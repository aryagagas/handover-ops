// Tes mode online tanpa internet: Supabase tiruan (tabel di memori + Realtime) dan dua "browser" (A dan B).
// Pakai: node tests/realtime.js   -> harus berakhir dengan ALL OK
const vm = require('vm'), fs = require('fs'), path = require('path');
let src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
src = src.replace(/render\(\);\s*\}\)\(\);\s*$/, 'render();globalThis.__t={render,S:()=>S,SY,UI,save,finishLogin,ensureReport,currentKey,reportText,pullAll,pushNow};})();');
if (!src.includes('__t=')) throw new Error('hook not injected');

/* ---- Supabase tiruan ---- */
const db = new Map(); const chans = []; let mute = null; const clone = x => JSON.parse(JSON.stringify(x));
const emit = ev => setTimeout(() => chans.forEach(c => { if (c.owner !== mute) c.cb(clone(ev)); }), 5);
function mockSupabase(owner) {
  return { createClient: () => ({
    from: () => ({
      select: () => ({ range: async (a, b) => ({ data: [...db.values()].slice(a, b + 1).map(r => ({ key: r.key, data: clone(r.data) })), error: null }),
        in: async (col, keys) => ({ data: keys.filter(k => db.has(k)).map(k => ({ key: k, data: clone(db.get(k).data) })), error: null }) }),
      upsert: (rows, opt) => { const done = []; rows.forEach(r => { const had = db.has(r.key); if (had && opt && opt.ignoreDuplicates) return; db.set(r.key, clone(r)); done.push({ key: r.key }); emit({ eventType: had ? 'UPDATE' : 'INSERT', new: clone(r) }); });
        const res = Promise.resolve({ error: null }); return { select: async () => ({ data: done, error: null }), then: (a, b) => res.then(a, b) }; },
      delete: () => ({ in: async (col, keys) => { keys.forEach(k => { if (db.delete(k)) emit({ eventType: 'DELETE', old: { key: k } }); }); return { error: null }; } })
    }),
    channel: () => { const ch = { owner, on(ev, f, cb) { this.cb = cb; return this; }, subscribe(cb) { chans.push(this); setTimeout(() => cb('SUBSCRIBED'), 0); return this; } }; return ch; }
  }) };
}

/* ---- browser tiruan ---- */
function browser(name) {
  const els = {}; const store = {};
  const el = id => ({ id, innerHTML: '', hidden: false, style: {}, textContent: '', value: '', open: false, dataset: {}, checked: false,
    classList: { toggle() {}, remove() {}, add() {} }, setAttribute() {}, removeAttribute() {}, addEventListener() {},
    showModal() { this.open = true; }, close() { this.open = false; }, querySelector() { return null; }, querySelectorAll() { return []; }, focus() {} });
  const document = { getElementById: id => els[id] || (els[id] = el(id)), addEventListener() {}, body: el('body'), documentElement: el('html'), querySelector: () => null, querySelectorAll: () => [], activeElement: null, visibilityState: 'visible' };
  const ctx = { document, location: { hash: '' }, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } }, navigator: {},
    crypto: require('crypto').webcrypto, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {}, console, addEventListener() {}, scrollTo() {},
    supabase: mockSupabase(name), HANDOVER_CONFIG: { supabaseUrl: 'https://x.supabase.co', supabaseKey: 'k', startWith: 'kosong' } };
  ctx.window = ctx; vm.createContext(ctx); vm.runInContext(src, ctx, { filename: name + '.js' });
  return { t: ctx.__t, els, document, ctx };
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('OK  ', m); };

(async () => {
  const A = browser('A');
  ok(A.els.auth.innerHTML.includes('sync-wait'), 'A: layar "menyiapkan data" sebelum tersambung');
  await sleep(60);
  ok(A.t.SY.ready && db.size > 0, `A: database kosong diisi data awal (${db.size} baris)`);
  ok(db.has('user:Sakti') && db.has('meta') && db.has('roster'), 'baris user/meta/roster ada');
  ok(![...db.keys()].some(k => k.startsWith('issue:')), 'startWith kosong: tanpa issue contoh');
  ok(A.t.S().auth.users.Dimas.mfa === null, 'akun online daftar authenticator sendiri');

  const B = browser('B'); await sleep(60);
  ok(B.t.SY.ready && Object.keys(B.t.S().auth.users).length === 9, 'B: data diambil dari database');

  A.t.finishLogin('Sakti', 'tes'); B.t.finishLogin('Dimas', 'tes'); await sleep(600);
  ok(B.t.S().auth.audit.some(a => a.by === 'Sakti' && a.ev === 'login'), 'login A tercatat di audit log B');
  ok(Math.abs(A.t.S().now - Date.now()) < 5000, 'jam asli dipakai (bukan jam demo)');

  // maintenance dari A muncul di B (dan halaman B dirender ulang)
  B.ctx.location.hash = '#maint'; B.t.render();
  const now = Date.now();
  A.t.S().maint.push({ id: 'MT-1', cat: 'bifast', title: 'Maintenance Bifast', windows: [{ who: 'BRI', start: now + 3600e3, end: now + 7200e3, startDone: null, endDone: null }], action: 'Please close the bifast', actionEnd: '', impact: '', src: '', by: 'Sakti', at: now });
  A.t.save(); await sleep(600);
  ok(B.t.S().maint.some(m => m.id === 'MT-1'), 'maintenance A masuk ke B');
  ok(B.els.view.innerHTML.includes('BRI'), 'halaman Maintenance B langsung ter-update');

  // B sedang mengetik: data masuk tapi tidak render ulang dulu
  B.document.activeElement = { tagName: 'TEXTAREA' }; const before = B.els.view.innerHTML;
  A.t.S().maint[0].windows[0].who = 'BNI'; A.t.save(); await sleep(600);
  ok(B.t.S().maint[0].windows[0].who === 'BNI' && B.els.view.innerHTML === before && B.t.SY.pending, 'B mengetik: data masuk, render ditunda');
  B.document.activeElement = null;

  // laporan: petugas yang diganti A terlihat di teks laporan B
  const k = A.t.currentKey(); const rp = A.t.ensureReport(k); rp.duty = { cur: { UA: 'Tegar' } }; A.t.save(); await sleep(600);
  ok(/Current On Duty : @Tegar Ops/.test(B.t.reportText(k)), 'pilihan petugas laporan ikut ke B');

  // hapus
  A.t.S().maint = []; A.t.save(); await sleep(600);
  ok(!B.t.S().maint.length && !db.has('mt:MT-1'), 'hapus maintenance ikut terhapus di B dan database');

  // B ketinggalan update (koneksi putus), lalu menyamakan lagi
  mute = 'B'; A.t.S().holidays.push({ d: '2026-12-31', n: 'Tes' }); A.t.save(); await sleep(600);
  ok(!B.t.S().holidays.some(h => h.n === 'Tes'), 'B (putus) belum dapat update');
  mute = null; await B.t.pullAll(false);
  ok(B.t.S().holidays.some(h => h.n === 'Tes'), 'B menyusul setelah tersambung lagi');

  // draft otomatis tidak menimpa isian orang lain
  const hk = 'ho:2099-01-01-P|UA';
  db.set(hk, { key: hk, data: { key: '2099-01-01-P|UA', note: 'isian A' }, client: 'A' });
  B.t.S().handovers['2099-01-01-P|UA'] = { key: '2099-01-01-P|UA', note: '' }; await B.t.pushNow();
  ok(db.get(hk).data.note === 'isian A', 'baris baru dari B tidak menimpa baris yang sudah ada');
  ok(B.t.S().handovers['2099-01-01-P|UA'].note === 'isian A', 'B langsung memakai versi server');

  // admin keluarkan semua sesi -> B ikut keluar
  A.t.S().auth.settings.revokedAt = Date.now(); A.t.save(); await sleep(600);
  ok(!B.t.S().session, 'keluarkan semua sesi berlaku di browser lain');

  console.log('ALL OK'); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
