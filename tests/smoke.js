// Smoke test: syntax check + run the app script against a stub DOM (tanpa browser).
// Pakai: node tests/smoke.js            (default: assets/app.js)
//        node tests/smoke.js file.html  (single-file: ambil <script> inline terakhir)
const vm = require('vm'), fs = require('fs'), path = require('path');
const target = process.argv.slice(2).find(a => !a.startsWith('--')) || path.join(__dirname, '..', 'assets', 'app.js');
const raw = fs.readFileSync(target, 'utf8');
let src = raw;
if (/\.html?$/i.test(target)) { const scripts = [...raw.matchAll(/<script>([\s\S]*?)<\/script>/g)]; src = scripts[scripts.length - 1][1]; }
new vm.Script(src, { filename: 'page.js' }); // syntax
console.log('syntax OK');
src = src.replace(/render\(\);\s*\}\)\(\);\s*$/, 'render();globalThis.__t={render,S:()=>S,AU,AD,UI,doLogin,doOtp,doEnroll,finishLogin,totpAt,b32bytes,renderAuth,logout,rosterFor,whoAt,setRoster,currentKey,nextKey,buildText,parseBroadcast,reportText,mDue,toggleMw,ensureReport,openMaint,mParse,saveMaint,openPick,renderMaintForm,mergeCand,UI,switchTheme};})();');
if (!src.includes('__t=')) throw new Error('hook not injected');

function el(id) {
  return { id, innerHTML: '', hidden: false, style: {}, textContent: '', value: '', open: false, dataset: {},
    classList: { toggle() {}, remove() {}, add() {} }, setAttribute() {}, removeAttribute() {}, addEventListener() {},
    showModal() { this.open = true; }, close() { this.open = false; }, querySelector() { return null; }, querySelectorAll() { return []; }, focus() {} };
}
const els = {};
const document = { getElementById: id => els[id] || (els[id] = el(id)), addEventListener() {}, body: el('body'), documentElement: el('html'), querySelector: () => null };
const ctx = { document, location: { hash: '' }, localStorage: { getItem: () => null, setItem() {} }, navigator: {},
  crypto: require('crypto').webcrypto, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {}, console, addEventListener() {}, scrollTo() {} };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'page.js' });
const t = ctx.__t;
const has = (s, msg) => { if (!s.includes(msg)) throw new Error('missing: ' + msg); };

(async () => {
  // RFC 6238 test vector (SHA1, T=59s -> step 1 -> 94287082)
  const code = await t.totpAt('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 1);
  console.log('RFC6238 step1:', code, code === '287082' ? 'OK' : 'FAIL');

  has(els.auth.innerHTML, 'login-form'); console.log('login page OK');
  // wrong password
  els['l-user'] = el('l-user'); els['l-user'].value = 'sakti.wardhana'; els['l-pass'] = el('l-pass'); els['l-pass'].value = 'salah';
  t.doLogin(); console.log('wrong pw ->', t.AU.err);
  // right password, Sakti not enrolled -> enroll
  els['l-user'].value = 'sakti.wardhana'; els['l-pass'].value = 'demo'; t.doLogin();
  console.log('step after login:', t.AU.step); has(els.auth.innerHTML, 'enroll-form');
  els.otp = el('otp'); els.otp.value = await t.totpAt(t.AU.enroll.secret, Math.floor(Date.now() / 30000));
  await t.doEnroll(); console.log('step after enroll:', t.AU.step, t.AU.codes && t.AU.codes.length);
  t.finishLogin(t.AU.user, 'authenticator baru');
  console.log('session:', t.S().session.user, 'desk', t.S().desk);
  // --- maintenance + laporan ---
  const pb = t.parseBroadcast('Dear all,\nMaintenance Internal Bifast\n- BRI 17 November 2026 00:15 - 03:00\n- Danamon & Danamon UUS 16 November 2026 23:00 - 17 November 2026 01:00\nStatus: Please close the bifast');
  console.log('parse:', pb.cat, '|', pb.title, '|', pb.action, '|', pb.windows.map(w => w.who + ' ' + new Date(w.start).toString().slice(4, 21) + ' -> ' + new Date(w.end).toString().slice(4, 21)).join(' ; '));
  const pb2 = t.parseBroadcast('Info maintenance switching Jalin\nBank Mandiri\nTanggal: Rabu, 18 Nov 2026\nPukul 01.00 - 04.30 WIB');
  console.log('parse2:', pb2.cat, '|', pb2.windows.map(w => w.who + ' ' + new Date(w.start).toString().slice(4, 21) + ' -> ' + new Date(w.end).toString().slice(16, 21)).join(' ; '));
  const pb3 = t.parseBroadcast('Maintenance core 20/11/2026 22:00-02:00');
  console.log('parse3:', pb3.windows.map(w => w.who + ' ' + new Date(w.start).toString().slice(4, 21) + ' -> ' + new Date(w.end).toString().slice(4, 21)).join(' ; '));
  const fmtW = w => w.who + ' ' + new Date(w.start).toString().slice(4, 21) + ' -> ' + new Date(w.end).toString().slice(4, 21);
  for (const s of require('./samples.js')) { const p = t.parseBroadcast(s); console.log('SAMPLE:', p.cat, '|', p.title, '|', p.action, '| impact:', p.impact, '|', p.windows.map(fmtW).join(' ; ')); }
  const m1 = t.parseBroadcast(require('./samples.js')[0]);
  console.log('merge cand for Aladin:', (t.mergeCand({ id: null, cat: m1.cat, title: m1.title }) || {}).id);
  console.log('due:', t.mDue().map(d => d.w.who + ':' + d.kind).join(', '));
  ctx.location.hash = '#laporan'; t.render(); has(els.view.innerHTML, 'rp-prev'); console.log('laporan html', els.view.innerHTML.length);
  { const k = t.currentKey(); const rp = t.S().reports[k]; rp.tasks = rp.tasks.filter(x => !/Spring/.test(x.t)); rp.tasks.push({ t: 'Task manual', on: true, custom: true }); rp.tasks[0].on = false;
    t.ensureReport(k); const ts = t.S().reports[k].tasks; console.log('sync: sprint back =', ts.some(x => /Spring/.test(x.t)), '| manual kept =', ts.some(x => x.t === 'Task manual'), '| first unchecked kept =', ts[0].on === false, '| n =', ts.length);
    t.S().reports[k].tasks = ts.filter(x => !x.custom); ts[0].on = true; }
  console.log('---REPORT---\n' + t.reportText(t.currentKey()) + '\n---END---');
  { const St = t.S(); const keep = St.now;
    St.now = new Date(2026, 10, 21, 15, 0).getTime(); console.log('SAT siang tasks:' + t.reportText(t.currentKey()).split('TASKS PERFORMED DURING SHIFT')[1].split('NOTES FOR NEXT SHIFT')[0]);
    ctx.location.hash = '#laporan'; t.render(); has(els.view.innerHTML, 'Siang · weekend & tanggal merah'); console.log('weekend note OK');
    for (const [lbl, dt] of [['SAT malam', [2026, 10, 14, 23, 0]], ['SUN malam', [2026, 10, 15, 23, 0]], ['MON malam', [2026, 10, 16, 23, 30]], ['FRI malam', [2026, 10, 20, 23, 30]], ['SUN pagi', [2026, 10, 15, 8, 0]], ['SUN siang', [2026, 10, 15, 15, 0]]]) {
      St.now = new Date(...dt).getTime(); console.log(lbl + ':', t.reportText(t.currentKey()).split('TASKS PERFORMED DURING SHIFT\n')[1].split('\n\n')[0].replace(/\n/g, ' | ')); }
    St.now = new Date(2026, 10, 20, 23, 0).getTime(); console.log('FRI malam:\n' + t.reportText(t.currentKey()).split('\n').filter(l => /day, \d|^\d\. (Re|St|En|Cl|Ch|Mo)/.test(l)).join('\n'));
    St.now = new Date(2026, 10, 16, 23, 0).getTime(); console.log('MON malam:\n' + t.reportText(t.currentKey()).split('\n').filter(l => /day, \d|Start of Day/.test(l)).join('\n'));
    St.now = new Date(2026, 10, 17, 3, 30).getTime(); console.log('16-M maint before reopen:' + t.reportText(t.currentKey()).split('MAINTENANCE ACTIVITY')[1].split('TASKS PERFORMED')[0]);
    t.toggleMw('MT-3|0|end'); t.toggleMw('MT-3|1|end'); console.log('16-M maint after reopen:' + t.reportText(t.currentKey()).split('MAINTENANCE ACTIVITY')[1].split('TASKS PERFORMED')[0]);
    console.log('mentions:', t.reportText(t.currentKey()).split('\n').filter(l => /On Duty/.test(l)).join(' | '));
    St.now = keep;
    { const nH = Object.keys(t.S().handovers).length; ctx.location.hash = '#laporan';
      for (const k of ['2026-11-16-P', '2026-11-16-M', '2026-11-14-M', '2026-11-21-P']) { t.UI.rpKey = k; t.render(); const v = els.view.innerHTML, b = els['band-in'].innerHTML;
        console.log('tab', k, '| shift btn pressed:', /data-rpshift="(\w)" aria-pressed="true"/.exec(b)[1], '|', /Template (weekdays|weekend)/.exec(b)[1], '| IDP:', v.includes('IDP Deposit'), '| SOD SPK:', v.includes('Start of Day SPK')); }
      console.log('no new handovers created:', Object.keys(t.S().handovers).length === nH); t.UI.rpKey = null; }
    { const k = t.currentKey(); const rp = t.ensureReport(k); rp.day = 'off'; t.ensureReport(k); console.log('MON siang dipaksa libur:', rp.tasks.map(x => x.t).join(' | '));
      rp.day = 'auto'; t.ensureReport(k); console.log('MON siang otomatis:', rp.tasks.length, 'task'); } }
  ctx.location.hash = '#maint'; t.render(); has(els.view.innerHTML, 'Danamon'); console.log('maint html', els.view.innerHTML.length);
  t.toggleMw('MT-3|1|start'); console.log('due after toggle:', t.mDue().map(d => d.w.who + ':' + d.kind).join(', '));
  t.openMaint(null); has(els.dlg.innerHTML, 'mt-form'); t.openPick('ongoing'); has(els.dlg.innerHTML, 'pick-form'); console.log('drawers OK');
  ctx.location.hash = '#handover'; t.render(); has(els.view.innerHTML, 'Pengingat maintenance'); console.log('home reminder OK');
  has(els.top.innerHTML, 'class="nb"'); console.log('nav badge OK');
  for (const r of ['handover', 'issue', 'maint', 'laporan', 'riwayat', 'admin']) { ctx.location.hash = '#' + r; t.render(); console.log('route', r, els.view.innerHTML.length); }
  for (const tab of ['jadwal', 'anggota', 'laporan', 'audit', 'keamanan']) { t.AD.tab = tab; t.render(); console.log('admin', tab, els.view.innerHTML.length); }
  t.switchTheme('dark'); t.switchTheme('light'); console.log('theme switch OK');
  // --- parser: format tanggal/jam lain ---
  { const fw = s => t.parseBroadcast(s).windows.map(fmtW).join(' ; ');
    const exp = [
      ['Maintenance BRI pukul 00:15 - 03:00 WIB tanggal 17 November 2026', 'BRI Nov 17 2026 00:15 -> Nov 17 2026 03:00'],
      ['Maintenance Bifast\nBank: BNI\nTanggal: 2026-11-20\nWaktu: 23:00 - 01:00', 'BNI Nov 20 2026 23:00 -> Nov 21 2026 01:00'],
      ['BI-FAST maintenance Bank Mega 17-Nov-2026 01:00 - 02:00', 'Bank Mega Nov 17 2026 01:00 -> Nov 17 2026 02:00'],
      ['Switching ALTO maintenance on November 25, 2026 from 01:00 to 03:00 WIB', 'ALTO Nov 25 2026 01:00 -> Nov 25 2026 03:00'],
      ['Maintenance Jalin 5 Januari 01:00 - 03:00', 'Jalin Jan 05 2027 01:00 -> Jan 05 2027 03:00'],
      ['Maintenance Artajasa tanggal 21-22 November 2026 pukul 23:00 - 05:00 WIB', 'Artajasa Nov 21 2026 23:00 -> Nov 22 2026 05:00'],
      ['BRI 17 November 2026 00:15 - 03:00\nBRI 17 November 2026 00:15 - 03:00', 'BRI Nov 17 2026 00:15 -> Nov 17 2026 03:00']];
    for (const [s, e] of exp) { const got = fw(s); if (got !== e) throw new Error('parse ' + JSON.stringify(s) + '\n got ' + got + '\n exp ' + e); }
    console.log('parser formats OK'); }
  // --- maintenance: jadwal dobel ditolak ---
  { const n0 = t.S().maint.length; t.openMaint(null);
    const setv = (id, v) => { els[id] = el(id); els[id].value = v; };
    setv('mt-src', ''); setv('mt-title', 'Maintenance Internal Bifast'); setv('mt-act', 'Please close the bifast'); setv('mt-act2', ''); setv('mt-imp', '');
    setv('mw-who-0', 'BRI'); setv('mw-s-0', '2026-11-17T00:15'); setv('mw-e-0', '2026-11-17T03:00'); els['mt-msg'] = el('mt-msg');
    t.UI.md.cat = 'bifast'; t.saveMaint(); has(els['mt-msg'].textContent, 'sudah tersimpan'); if (t.S().maint.length !== n0) throw new Error('dup saved');
    console.log('dup maintenance blocked OK'); for (const id of ['mt-src', 'mt-title', 'mt-act', 'mt-act2', 'mt-imp', 'mw-who-0', 'mw-s-0', 'mw-e-0']) delete els[id]; t.UI.md = null; }
  // --- laporan: petugas lewat dropdown ---
  { ctx.location.hash = '#laporan'; t.UI.rpKey = null; t.render(); has(els.view.innerHTML, 'data-rpduty="cur|UA"'); if (els.view.innerHTML.includes('type="text" data-mention')) throw new Error('mention still typed in report');
    const k = t.currentKey(); const rp = t.ensureReport(k); rp.duty = { cur: { AB: 'Tegar' } };
    has(t.reportText(k).split('\n').find(l => /Current On Duty/.test(l)), '@Tegar Ops'); t.render(); has(els.view.innerHTML, 'rp-duty-reset'); delete rp.duty;
    t.AD.tab = 'anggota'; ctx.location.hash = '#admin'; t.render(); has(els.view.innerHTML, 'data-mention="Bayu"'); console.log('duty dropdown OK'); }
  t.UI.menu = true; t.render(); has(els.top.innerHTML, 'data-act="logout"'); t.UI.menu = false;
  // roster override for next shift updates the current draft handover
  const cur = t.currentKey(), nk = t.nextKey(cur);
  t.setRoster(nk, 'UA', 'Tegar'); console.log('next UA after override:', t.whoAt(nk, 'UA'), '| draft.to', t.S().handovers[cur + '|UA'].to);
  t.setRoster(nk, 'UA', 'Dimas');
  // logout, login as Dimas (enrolled) with MFA
  t.logout('user', 'bye'); has(els.auth.innerHTML, 'login-form'); ctx.location.hash = '#laporan';
  els['l-user'].value = 'dimas.saputra'; els['l-pass'].value = 'demo'; t.doLogin(); console.log('Dimas step:', t.AU.step);
  const sec = t.S().auth.users.Dimas.mfa.secret; els.otp.value = await t.totpAt(sec, Math.floor(Date.now() / 30000));
  await t.doOtp(); console.log('Dimas session:', t.S().session && t.S().session.user, 'desk', t.S().desk, '| landing tab:', ctx.location.hash);
  ctx.location.hash = '#admin'; t.render(); has(els['band-in'].innerHTML, 'Khusus admin'); console.log('non-admin blocked OK');
  // replay protection
  t.logout('user', ''); els['l-user'].value = 'dimas.saputra'; els['l-pass'].value = 'demo'; t.doLogin(); await t.doOtp(); console.log('replay ->', t.AU.err);
  // lockout
  t.logout('user', ''); for (let i = 0; i < 5; i++) { els['l-user'].value = 'tegar.simanjuntak'; els['l-pass'].value = 'x'; t.doLogin(); }
  console.log('lock ->', t.AU.err.slice(0, 40));
  console.log('audit entries:', t.S().auth.audit.length);
  console.log('ALL OK');
  process.exit(0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });

