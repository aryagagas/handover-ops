(function(){
const pad=n=>String(n).padStart(2,'0');
/* Mode online: aktif kalau assets/config.js berisi URL dan key Supabase. Kalau kosong, app jalan lokal (localStorage) seperti biasa. */
const CFG=window.HANDOVER_CONFIG||{};
const ONLINE=!!(CFG.supabaseUrl&&CFG.supabaseKey);
const TABLE=CFG.table||'handover_kv';
const SY={sb:null,ready:false,snap:{},state:ONLINE?'connecting':'local',msg:'',t:null,pending:false,down:false,client:Math.random().toString(36).slice(2,10)};
function T(s){const [d,t]=s.split(' ');const [y,m,dd]=d.split('-').map(Number);const [h,mi]=(t||'00:00').split(':').map(Number);return new Date(y,m-1,dd,h,mi).getTime();}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const IC={
 swap:'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 sunrise:'<path d="M12 2v6M4.9 10.9l1.4 1.4M2 18h2M20 18h2M17.7 12.3l1.4-1.4M22 22H2M16 18a4 4 0 0 0-8 0"/><path d="m8 6 4-4 4 4"/>',
 moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
 monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 pause:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
 check:'<path d="M20 6 9 17l-5-5"/>',
 x:'<path d="M18 6 6 18M6 6l12 12"/>',
 copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
 pin:'<path d="M12 17v5"/><path d="M9 3h6l-1 6 3 4H7l3-4z"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
 lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>',
 logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
 settings:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff:'<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
 chev:'<path d="m6 9 6 6 6-6"/>',
 chevl:'<path d="m15 18-6-6 6-6"/>',
 chevr:'<path d="m9 18 6-6-6-6"/>',
 bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
 wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
 server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>'
};
const ic=(n,s=16)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const MARK='<svg class="mark" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><rect x="2" y="7" width="18" height="20" rx="6" fill="currentColor" opacity=".45"/><rect x="14" y="7" width="18" height="20" rx="6" fill="currentColor"/><path d="M19 17h8m-3-3 3 3-3 3" stroke="#0A1A31" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SHIFT={P:{name:'Pagi',start:6,label:'06:00–14:00',icon:'sunrise'},S:{name:'Siang',start:14,label:'14:00–22:00',icon:'sun'},M:{name:'Malam',start:22,label:'22:00–06:00',icon:'moon'}};
const STATUS={wait:{label:'Nunggu',long:'Nunggu / ongoing',icon:'clock',emoji:'🕑'},fu:{label:'Perlu FU',long:'Perlu follow up',icon:'bell',emoji:'💬'},hold:{label:'Simpen',long:'Simpen',icon:'pause',emoji:'⏸️'},done:{label:'Resolved',long:'Resolved',icon:'check',emoji:'✅'}};
const ST_ORDER=['wait','fu','hold','done'];
const DESKS={UA:{phone:'HP UA'},AB:{phone:'HP AB'}};
const DESK_ORDER=['UA','AB'];
/* Tim shift. Nama panggilan bisa diubah di sini. Urutan ini juga dipakai untuk rotasi jadwal demo. */
const PEOPLE=[['Bayu','Bayu Setiawan Hadi'],['Dimas','Dimas Eka Saputra'],['Fajar','Fajar Nugroho'],['Kevin','Kevin Ardiansyah Lubis'],['Leo','Leonardus Wibowo'],['Naufal','Naufal Hakim Pratama'],['Rafi','Rafi Maulana Siregar'],['Tegar','Tegar Simanjuntak'],['Sakti','Sakti Wardhana']];
const TEAM=PEOPLE.map(p=>p[0]);
const FULL=Object.fromEntries(PEOPLE);
const AV_COL=['#2F6BFF','#0FA58C','#E07A2E','#7A5CF0','#D9467A','#1E9BD7','#5E8C31','#B5532F','#3B4CCA'];
function initials(n){const w=(FULL[n]||n).split(' ');return (w[0][0]+(w[1]?w[1][0]:'')).toUpperCase();}
/* Jadwal: rotasi 9 orang, 2 HP per shift, bisa diubah admin (disimpan di S.roster). */
function rosterFor(sk,desk){const o=S&&S.roster&&S.roster[sk+'|'+desk];return o||rosterBase(sk,desk);}
function rosterBase(sk,desk){const p=parseKey(sk);const days=Math.round((new Date(p.y,p.m-1,p.d)-new Date(2026,10,15))/864e5);const n=days*3+['P','S','M'].indexOf(p.sid);return TEAM[(((2*n+(desk==='AB'?1:0))%9)+9)%9];}
const JIRA='https://jira.example.com/browse/';
const SCP=id=>'https://helpdesk.example.com/requests/'+id+'';
/* Maintenance: kategori, tindakan default, dan pengingat (muncul 3 jam sebelum mulai) */
const MCAT={switching:{label:'Switching',icon:'swap'},bifast:{label:'BI-Fast',icon:'bolt'},internal:{label:'Internal',icon:'server'},other:{label:'Lainnya',icon:'wrench'}};
const MCAT_ORDER=['switching','bifast','internal','other'];
const MDEF={switching:['Monitor switching transactions during maintenance',''],bifast:['Please close BI-Fast outgoing transactions to these banks during their maintenance hours and reopen them once finished','Open BI-Fast lagi setelah maintenance selesai'],internal:['Monitor services during maintenance','Cek layanan sudah normal setelah maintenance selesai'],other:['Monitor services during maintenance','']};
const SOON=3*3600e3;
/* Laporan atasan */
const EN_DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const EN_MONS=['January','February','March','April','May','June','July','August','September','October','November','December'];
/* Template task per shift (dari contoh laporan weekday). w: all = setiap hari, work = hari kerja saja, next = kalau besok hari kerja (task shift malam setelah jam 00). Bisa diubah admin. */
const WAG='Checking and handling of customer complaints in WAG BU',TIX='Monitoring and resolving complaints from internal ticketing system';
/* 6 template: tiap shift punya daftar hari kerja (work) dan weekend/tanggal merah (off). Awalan "!" = hanya kalau besok hari kerja (task shift malam setelah jam 00). */
const T_INS='Report Install & Uninstall Nusa App on Android',T_SMP='Checking SMP Point',T_SPR='Report ICTSP Spring Batchjob';
const T_IDP='IDP Deposit Batch Job Monitoring',T_CUT='Report ICTSP Day Cut Off',T_GL='End of Day GL',T_VA='Closing and Opening of VA Marketplace (00:00 - 04:00)',T_SOD='!Start of Day RTGS & STPG';
const TPL0={
  P:{work:[WAG,TIX,T_INS,T_SMP,'Start of Day SPK & SKN'],off:[WAG,TIX,T_INS,T_SMP]},
  S:{work:[WAG,TIX,T_SPR,T_SMP,'End of Day RTGS, SPK, & SKN','Close Branch KC Pusat & KC Barat'],off:[WAG,TIX,T_SPR,T_SMP]},
  M:{work:[WAG,TIX,T_IDP,T_CUT,T_GL,T_VA,T_SOD],off:[WAG,TIX,T_IDP,T_CUT,T_GL,T_VA]}};
const TPL_V=8;
const tplSeed=()=>{const o={};for(const s in TPL0){o[s]={};for(const k of ['work','off'])o[s][k]=TPL0[s][k].map(x=>x[0]==='!'?{t:x.slice(1),nb:true}:{t:x});}return o;};
const KIND_L={work:'Hari kerja',off:'Weekend & tanggal merah'};
/* Hari libur nasional / cuti bersama: diisi admin. Sabtu dan Minggu otomatis libur. */
const HOL0=[{d:'2026-12-25',n:'Hari Raya Natal'},{d:'2027-01-01',n:'Tahun Baru 2027'}];
/* Nama yang dipakai untuk mention di chat. Bisa diubah langsung dari form laporan. */
const MENTION0={Bayu:'Bayu Ops',Dimas:'Mas Dimas Ops',Fajar:'Fajar Ops',Kevin:'Kevin Ops',Leo:'Leo Ops',Naufal:'Naufal Ops',Rafi:'Rafi Ops',Tegar:'Tegar Ops',Sakti:'Sakti Wardhana'};
const DAYS=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];const DAYS_L=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONS=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const fmtDate=ms=>{const d=new Date(ms);return DAYS[d.getDay()]+' '+d.getDate()+' '+MONS[d.getMonth()];};
const fmtDateL=ms=>{const d=new Date(ms);return DAYS_L[d.getDay()]+', '+d.getDate()+' '+MONS[d.getMonth()]+' '+d.getFullYear();};
const fmtTime=ms=>{const d=new Date(ms);return pad(d.getHours())+':'+pad(d.getMinutes());};
const fmtDT=ms=>fmtDate(ms)+', '+fmtTime(ms);
function dur(d){const m=Math.round(d/60000);if(m<60)return m+' mnt';const h=Math.round(m/60);if(h<48)return h+' jam';return Math.round(h/24)+' hari';}
function ago(ms){const d=S.now-ms;if(d<60000)return 'barusan';return dur(d)+' lalu';}
function greeting(){const h=new Date(S.now).getHours();return h<4?'Selamat malam':h<11?'Selamat pagi':h<15?'Selamat siang':h<18?'Selamat sore':'Selamat malam';}
function shortWhen(ms){return fmtDate(ms)===fmtDate(S.now)?fmtTime(ms):fmtDate(ms).slice(4)+', '+fmtTime(ms);}

function shiftKeyAt(ms){const d=new Date(ms);const h=d.getHours();const b=new Date(d.getFullYear(),d.getMonth(),d.getDate());let sid;if(h>=6&&h<14)sid='P';else if(h>=14&&h<22)sid='S';else{sid='M';if(h<6)b.setDate(b.getDate()-1);}return ymd(b)+'-'+sid;}
function parseKey(k){const p=k.split('-');return {y:+p[0],m:+p[1],d:+p[2],sid:p[3]};}
function shiftRange(k){const p=parseKey(k);const start=new Date(p.y,p.m-1,p.d,SHIFT[p.sid].start,0).getTime();return {start,end:start+8*3600e3};}
const nextKey=k=>shiftKeyAt(shiftRange(k).end+60e3);
const prevKey=k=>shiftKeyAt(shiftRange(k).start-60e3);
const sidOf=k=>parseKey(k).sid;
const inR=(ms,r)=>ms>=r.start&&ms<r.end;
const shiftShort=k=>'Shift '+SHIFT[sidOf(k)].name+', '+fmtDate(shiftRange(k).start);
/* HP yang dipegang seseorang di shift tertentu (dari handover, atau jadwal kalau belum ada) */
function deskOf(n,sk){return DESK_ORDER.find(d=>{const h=S&&S.handovers&&S.handovers[sk+'|'+d];return h?h.from.includes(n):rosterFor(sk,d)===n;})||null;}

/* U(waktu, HP penulis, isi): penulis otomatis diambil dari jadwal HP itu di shift tersebut */
function U(at,desk,text,changes){return {at:T(at),by:rosterFor(shiftKeyAt(T(at)),desk),text,changes:changes||[]};}
function I(o){const i=Object.assign({type:'issue',desk:'UA',tags:[],tickets:[],waitingOn:'',pic:'',nextAction:'',fuAt:null,warning:'',context:'',systems:[],links:[],example:false},o);if(!i.desks)i.desks=[i.desk];return i;}
/* ---------- TOTP (RFC 6238, sama dengan Google/Microsoft Authenticator) ---------- */
const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',BKA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randB32(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return Array.from(a,x=>B32[x&31]).join('');}
function genBackup(){const out=[];for(let i=0;i<8;i++){const a=new Uint8Array(8);crypto.getRandomValues(a);out.push(Array.from(a,x=>BKA[x%BKA.length]).join(''));}return out;}
function b32bytes(s){let bits=0,v=0;const out=[];for(const c of s.toUpperCase()){const i=B32.indexOf(c);if(i<0)continue;v=((v<<5)|i)&0xffff;bits+=5;if(bits>=8){bits-=8;out.push((v>>bits)&255);}}return new Uint8Array(out);}
const keyCache={};
async function totpAt(secret,step){
  if(!(window.crypto&&crypto.subtle))return String((step*7919+secret.charCodeAt(0))%1e6).padStart(6,'0');
  let k=keyCache[secret];if(!k)k=keyCache[secret]=await crypto.subtle.importKey('raw',b32bytes(secret),{name:'HMAC',hash:'SHA-1'},false,['sign']);
  const buf=new ArrayBuffer(8);const dv=new DataView(buf);dv.setUint32(0,Math.floor(step/4294967296));dv.setUint32(4,step>>>0);
  const h=new Uint8Array(await crypto.subtle.sign('HMAC',k,buf));const o=h[h.length-1]&15;
  const n=((h[o]&127)<<24)|(h[o+1]<<16)|(h[o+2]<<8)|h[o+3];return String(n%1e6).padStart(6,'0');
}
/* Akun & audit awal. Username mengikuti pola nama.belakang (di versi asli diambil dari LDAP). Sakti admin dan belum daftar authenticator. */
function seedAuth(handovers){
  const users={};
  PEOPLE.forEach(([n,full])=>{const w=full.toLowerCase().split(' ');users[n]={username:w[0]+'.'+w[w.length-1],role:n==='Sakti'?'admin':'member',active:true,
    mfa:n==='Sakti'?null:{secret:randB32(32),at:T('2026-11-02 10:00'),backup:genBackup(),lastStep:0},failed:0,lockedUntil:0,lastLogin:null};});
  const a=[];const add=(at,by,cat,ev,text)=>a.push({at,by,cat,ev,text});
  const lg=n=>'Login berhasil (LDAP + '+(users[n].mfa?'authenticator':'authenticator belum didaftarkan')+')';
  Object.values(handovers).sort((x,y)=>shiftRange(x.shift).start-shiftRange(y.shift).start).forEach(h=>{
    const r=shiftRange(h.shift);const f=h.from[0];
    if(!handovers[prevKey(h.shift)+'|'+h.desk]){add(r.start-5*60e3,f,'auth','login',lg(f));users[f].lastLogin=r.start-5*60e3;}
    if(h.submittedAt)add(h.submittedAt,f,'handover','submit',`Serahkan ${DESKS[h.desk].phone} ${shiftShort(h.shift)} ke ${h.to.join(', ')}`);
    if(h.ackAt){const t=h.ackBy;add(h.ackAt-7*60e3,t,'auth','login',lg(t));users[t].lastLogin=h.ackAt-7*60e3;
      add(h.ackAt,t,'handover','accept',`Terima ${DESKS[h.desk].phone} ${shiftShort(h.shift)} dari ${f}`);add(r.end+6*60e3,f,'auth','logout','Logout');}
  });
  add(T('2026-11-15 21:58'),'Leo','auth','mfa_fail','Kode authenticator salah');
  add(T('2026-11-16 13:52'),null,'auth','login_fail','Login gagal: username "sakti" tidak dikenal');
  a.sort((x,y)=>x.at-y.at);
  return {users,settings:{idle:30,maxFail:5,lockMin:15},audit:a};
}
/* Maintenance awal. BI-Fast dari contoh laporan; dua lainnya contoh. */
function seedMaint(){
  const W=(who,s,e,done)=>({who,start:T(s),end:T(e),startDone:null,endDone:done||null});
  return [
   {id:'MT-3',cat:'bifast',title:'Maintenance Internal Bifast',action:'Please close the bifast',actionEnd:'Open BI-Fast lagi setelah maintenance selesai',by:'Sakti',at:T('2026-11-16 15:30'),
    src:'Maintenance Internal Bifast\n- BRI 17 November 2026 00:15 - 03:00\n- Danamon & Danamon UUS 16 November 2026 23:00 - 17 November 2026 01:00\nStatus: Please close the bifast',
    windows:[W('BRI','2026-11-17 00:15','2026-11-17 03:00'),W('Danamon & Danamon UUS','2026-11-16 23:00','2026-11-17 01:00')]},
   {id:'MT-2',cat:'switching',example:true,title:'Maintenance Switching (contoh)',action:'Monitor switching transactions during maintenance',actionEnd:'',by:'Bayu',at:T('2026-11-16 09:10'),src:'',
    windows:[W('Switching X','2026-11-18 01:00','2026-11-18 04:00')]},
   {id:'MT-1',cat:'internal',example:true,title:'Patching server reporting (contoh)',action:'',actionEnd:'Cek service reporting sudah jalan normal',by:'Dimas',at:T('2026-11-15 20:00'),src:'',
    windows:[W('DB reporting','2026-11-16 01:00','2026-11-16 03:00',{by:'Dimas',at:T('2026-11-16 03:12')})]}
  ];
}
function seedReports(){
  return {'2026-11-16-S':{mx:[],notes:'',day:'auto',tasks:TPL0.S.work.map(t=>({t,on:true})),resolved:[],ongoing:[
    {title:'Disruption for VA Payment PAYKU',status:'Currently the issue is being handled by PAYKU Team, follow up regularly ⚠️',jira:JIRA+'DIPM-18149',major:false,src:'AB-205'},
    {title:'Auto Loan phone_number wrong mapping: <HP_SALES> ⚠️',status:'still waiting for a fixing',jira:JIRA+'DIPM-18988',major:false,src:'UA-419'}]}};
}
function seed(){
  const issues=[
  /* ---------- UA (dari file handover UA) ---------- */
  I({id:'UA-412',desks:['UA','AB'],status:'wait',title:'Recon exception wallet (DB_WALLET_RECON)',
   tickets:[{sys:'Zoho',id:'#423516'},{sys:'Jira',id:'DIPM-18897',url:JIRA+'DIPM-18897'}],
   waitingOn:'Hendra (UA) + Dev',pic:'Iqbal',nextAction:'Bahas order yang belum expected di step 3.2 ke Iqbal/Hendra. Evidence ada di Google Doc.',fuAt:T('2026-11-17 09:00'),
   warning:'SOP-Refund-Overpayment DITAHAN. Jangan dijalankan sampai Dev konfirmasi (arahan Hendra). Step 3.2/3.3 yang cek ke DSS di-skip.',
   context:'4 SOP untuk 4 kasus berbeda, bukan 1 transaksi pakai 4 SOP. Jalankan transaksi sesuai orderno yang tercantum di SOP saja.\nPostStatusToSuccessForReconFailedOrder dan SetOrderFailAndPostRefund terlanjur dijalankan semua oleh Iqbal; 2 SOP lainnya dijalankan satu per satu.',
   systems:['IOMS','DB_WALLET_RECON'],links:[{label:'Google Doc evidence',url:'https://docs.example.com/evidence-recon'}],
   created:T('2026-11-15 15:10'),updates:[
    U('2026-11-15 15:10','UA','Switchover ke UA. Sudah di-escalate ke Hendra. Arahan: stop dulu, jangan jalankan apa pun sampai ada info dari Dev.',['Status: Nunggu']),
    U('2026-11-16 10:20','UA','Pre-check SetOrderFailAndCloseReconException: orderno seq 1 dan 7 tidak ketemu. Di DB ada orderno yang cocok (SOP typo, kurang 1 digit). Konfirmasi ke Hendra.'),
    U('2026-11-16 16:45','UA','Hendra oke pakai orderno dari DB. SetOrderFailAndCloseReconException sudah dijalankan semua.'),
    U('2026-11-16 18:30','AB','Dicatat juga di handover AB. Arahan Hendra tetap: jangan jalankan apa-apa sampai ada info dari Dev.'),
    U('2026-11-16 20:30','UA','Job IDP selesai, lanjut step 3.2. Beberapa order masih belum expected, evidence di Google Doc.',['Next action diubah','FU: Sel 17 Nov, 09:00'])]}),
  I({id:'UA-418',desks:['UA','AB'],status:'wait',title:'Tiket SCP Wei: slow query & disk DB >65%',
   tickets:[{sys:'SCP',id:'230455000009299030',url:SCP('230455000009299030')},{sys:'SCP',id:'230455000009330001',url:SCP('230455000009330001')},{sys:'Zoho',id:'#423590'},{sys:'Jira',id:'DIPM-18989',url:JIRA+'DIPM-18989'}],
   waitingOn:'DBA (Mas Yoga, Mas Indra)',nextAction:'FU di grup DBA PROD: ukuran expand disk dan progres DIPM-18989. Kalau ada update, tiket Jira ikut di-update.',fuAt:T('2026-11-17 09:00'),context:'Wei raise 2 tiket SCP lewat WeChat.',systems:['DB PROD'],
   created:T('2026-11-15 19:00'),updates:[
    U('2026-11-15 19:00','UA','Wei raise 2 tiket SCP di WeChat. Lagi dipahami Mas Yoga.'),
    U('2026-11-16 09:30','UA','Disk akan di-expand, Mas Yoga diskusi dulu dengan Mas Indra soal ukurannya.'),
    U('2026-11-16 15:00','AB','FU ke Mas Yoga soal Zoho #423590. Masih dicek; nanti tanyakan lagi progresnya.'),
    U('2026-11-16 16:05','UA','Slow query dibuatkan Jira DIPM-18989, sedang eskalasi ke DBA.')]}),
  I({id:'UA-420',status:'wait',title:'Liang tidak bisa masuk jumpserver',
   tickets:[{sys:'Jira',id:'DSSR-17541',url:'https://jira.example.com/browse/DSSR-17541'}],
   waitingOn:'Stefan',pic:'Mas Toni',nextAction:'FU Stefan. Kalau perlu, buat tiket request VPN untuk Liang (detail di chat Stefan).',fuAt:T('2026-11-17 08:00'),systems:['Jumpserver','VPN'],
   created:T('2026-11-16 08:15'),updates:[
    U('2026-11-16 08:15','UA','Tiket dibuat Mas Toni, status in progress.'),
    U('2026-11-16 18:20','UA','Info Stefan: yang bermasalah user VPN-nya, bukan jumpserver.',['Next action diubah'])]}),
  I({id:'UA-398',status:'wait',title:'PAYKU outage',
   waitingOn:'PayKu (Sinta) / Andre',nextAction:'Pantau grup SNAP. Siap kalau diminta buka akses PayKu lagi.',
   context:'PayKu lewat tunnel IT Sec, jadi tunnel harus ready sebelum dibuka.',systems:['SNAP','Tunnel IT Sec'],links:[{label:'status.payku.example',url:'https://status.payku.example'}],
   created:T('2026-11-13 11:00'),updates:[
    U('2026-11-13 11:00','UA','Status PayKu naik turun (operational/outage). Tunggu konfirmasi Sinta di grup.'),
    U('2026-11-14 16:00','UA','PayKu sudah operasional, tapi tunnel IT Sec harus ready dulu. Mas Andre minta RCA.'),
    U('2026-11-15 17:30','UA','RCA sudah dikirim PayKu. Di grup SNAP dibahas pembuatan secret key baru.'),
    U('2026-11-16 15:20','UA','Cyber risk kasih feedback soal RCA. Minggu depan ada meeting manajemen kedua pihak. Kita tunggu hasilnya, lalu eksekusi.')]}),
  I({id:'UA-405',desks:['UA','AB'],status:'wait',title:'Disk VM Kong >85%',
   waitingOn:'Tim BIT, Iqbal & Mas Farhan',pic:'Iqbal',nextAction:'Tunggu pembagian tugas dari Iqbal dan Mas Farhan, plus email handover formal SOP HK dari BIT.',fuAt:T('2026-11-18 10:00'),
   context:'Retensi masih ada data dari 2023. Bu Ratna menahan tiket expand dan minta dibahas dengan Iqbal dulu. Monitoring masih nunggu konfirmasi dan email Robert.',systems:['Kong'],
   created:T('2026-11-14 15:00'),updates:[
    U('2026-11-14 15:00','UA','Mas Joko (computing) bilang tidak bisa HK, harus tiket expand. Bu Ratna tahan, minta ngobrol ke Iqbal dulu.'),
    U('2026-11-15 10:00','UA','SOP HK sudah didapat, tapi perlu email dan handover formal dari BIT ke kita.'),
    U('2026-11-16 16:00','AB','Dari sisi AB: masih nunggu pembagian tugas dari Iqbal dan Mas Farhan. Monitoring nunggu konfirmasi dan email Robert.')]}),
  I({id:'UA-416',status:'wait',title:'Disk HDFS BDP (192.0.2.16 & 192.0.2.18)',tickets:[{sys:'Zoho',id:'ke WB'}],
   waitingOn:'Ming (WB)',nextAction:'Kalau Pak Harun tanya: tiket Zoho ke WB sudah dibuat, manual rebalancing ke 4 node sedang jalan.',
   systems:['HDFS','192.0.2.16','192.0.2.18'],links:[{label:'HDFS web UI (datanode)',url:'http://192.0.2.26:50070/dfshealth.html#tab-datanode'}],
   created:T('2026-11-15 23:10'),updates:[U('2026-11-15 23:10','UA','Alert disk space di 2 node. Ming lakukan manual rebalancing biar rata ke 4 node.')]}),
  I({id:'UA-419',desks:['UA','AB'],status:'wait',title:'Auto Loan: phone_number salah mapping',
   waitingOn:'Pak Yusuf & Samuel (AB)',nextAction:'Tunggu aba-aba Pak Yusuf sebelum koreksi data.',
   context:'Sales tidak bisa login H5. Kolom auto_loan.app_users.phone_number berisi placeholder <HP_SALES>, sehingga request OTP error "Invalid phone number (not E.164 international number)".',
   systems:['auto_loan'],created:T('2026-11-16 11:00'),updates:[
    U('2026-11-16 11:00','UA','Ketemu placeholder di kolom phone_number.'),
    U('2026-11-16 19:40','UA','Masih nunggu aba-aba Pak Yusuf, lagi koordinasi dengan Samuel di AB.'),
    U('2026-11-16 20:10','AB','Dari sisi AB: Samuel konfirmasi masih nunggu Pak Yusuf. Ikut dipantau dari HP AB.')]}),
  I({id:'UA-388',status:'fu',title:'Tiket TPM FinLink',tickets:[{sys:'Jira',id:'DIPM-18768',url:JIRA+'DIPM-18768'}],
   waitingOn:'FinLink',pic:'Bagas',nextAction:'FU FinLink: hasil cek request dengan amount di lampiran tiket.',fuAt:T('2026-11-16 21:00'),systems:['FinLink'],
   created:T('2026-11-14 18:00'),updates:[
    U('2026-11-14 18:00','UA','Bagas tanya ke FinLink, log sudah didapat. Request dengan amount di lampiran belum ketemu.'),
    U('2026-11-16 15:50','UA','Sudah di-FU: di sisi kita request juga tidak tercatat. FinLink cek ulang dan minta sample BIT61 XL.',['Status: Nunggu → Perlu FU','FU: Sen 16 Nov, 21:00'])]}),
  I({id:'UA-409',status:'fu',title:'Template notif deposito expire tgl 30',
   waitingOn:'Fikri (Funding)',nextAction:'Pastikan tiket deploy extend template sudah dibuat sebelum 30 Nov.',fuAt:T('2026-11-17 10:00'),systems:['Notifikasi'],
   created:T('2026-11-14 09:00'),updates:[
    U('2026-11-14 09:00','UA','Nadia (Funding) mau diskusi internal dulu apakah notif masih dipakai.'),
    U('2026-11-15 11:00','UA','Fikri: butuh dan mau di-extend. Ditanya apakah tiket sudah dibuat.'),
    U('2026-11-16 14:40','UA','Sudah di-FU lagi ke Fikri, tunggu jawaban.')]}),
  I({id:'UA-414',status:'fu',title:'Alert shadow limit',tickets:[{sys:'Zoho',id:'shadow limit'}],
   waitingOn:'Zhou (WeChat)',nextAction:'Tanya ulang Zhou di WeChat soal sample data yang salah.',fuAt:T('2026-11-16 20:00'),
   context:'Sample di tiket Zoho kena block code N (akun frozen). Harusnya cuma ada 1 data berstatus unknown.',
   created:T('2026-11-15 16:30'),updates:[
    U('2026-11-15 16:30','UA','Tiket Zoho dibuat, trace report sudah ada.'),
    U('2026-11-16 09:00','UA','Sample data di tiket salah, perlu dikoreksi.',['Status: Nunggu → Perlu FU'])]}),
  I({id:'UA-377',status:'hold',title:'Announcement BI-Fast di Nusa App',waitingOn:'tim Product / Robert',
   context:'Kalau announcement dinyalakan tanpa mematikan BI-Fast, inquiry tetap lolos. Kalau BI-Fast dimatikan, announcement hilang.',systems:['BI-Fast'],
   created:T('2026-11-12 10:00'),updates:[
    U('2026-11-12 10:00','UA','Robert minta FU ke tim Product dan screen recording announcement transfer BI-Fast bareng Liang.'),
    U('2026-11-14 15:30','UA','Dicoba waktu maintenance BI-Fast terakhir. Kata Iqbal tim bisnis tidak anggap prioritas, terima dulu apa adanya.',['Status: Nunggu → Simpen'])]}),
  I({id:'UA-391',status:'hold',title:'Communications link failure (SNAP timeout)',waitingOn:'AAM / Hafiz',pic:'Rendi',
   context:'Mengarah ke SNAP yang timeout. Di UAT juga sering terjadi.',systems:['SNAP'],
   created:T('2026-11-13 14:00'),updates:[
    U('2026-11-13 14:00','UA','Wei tanya. Rendi tanya ke Hafiz.'),
    U('2026-11-15 15:00','UA','Latest update sudah dikasih ke Wei, masih dicek AAM. Tidak ada yang tanya lagi, simpan saja.',['Status: Nunggu → Simpen'])]}),
  I({id:'UA-421',status:'done',tags:['UAT'],title:'Validasi PIN UAT gagal',pic:'Ardi',context:'Trace report WB mengarah ke modul HSM/enkripsi.',systems:['HSM'],
   created:T('2026-11-16 14:20'),resolvedAt:T('2026-11-16 19:05'),updates:[
    U('2026-11-16 14:20','UA','Semua validasi PIN di UAT gagal. FU ke Ardi.'),
    U('2026-11-16 19:05','UA','Solved.',['Status: Nunggu → Resolved'])]}),
  I({id:'UA-422',status:'done',tags:['UAT'],title:'gateway.uat down',systems:['gateway.uat'],
   created:T('2026-11-16 15:00'),resolvedAt:T('2026-11-16 16:30'),updates:[
    U('2026-11-16 15:00','UA','Dilapor Lina, cek service mana yang jatuh.'),
    U('2026-11-16 16:30','UA','Solved.',['Status: Nunggu → Resolved'])]}),
  I({id:'UA-423',status:'done',title:'Login MPC 404 (getFactor)',nextAction:'Pantau saja kalau muncul lagi.',
   context:'Login tidak terdampak. Hanya endpoint /api/login/getFactor di IAM_NGINX yang selalu 404. Service IAM_USER aman.',systems:['IAM_NGINX','IAM_USER'],
   created:T('2026-11-16 17:30'),resolvedAt:T('2026-11-16 17:50'),updates:[
    U('2026-11-16 17:30','UA','Ferdi tanya login MPC kena 404. Dicek: login sendiri tidak terdampak.'),
    U('2026-11-16 17:50','UA','Ferdi oke. Ditutup, pantau saja.',['Status: Nunggu → Resolved'])]}),
  I({id:'UA-417',type:'reminder',status:'wait',title:'Password LDAP dev WB Chen expired',waitingOn:'Mas Toni (tiket ke IT Sec)',nextAction:'Pastikan tiket IT Sec dibuat.',fuAt:T('2026-11-17 09:00'),systems:['LDAP'],
   created:T('2026-11-16 15:10'),updates:[U('2026-11-16 15:10','UA','Belum dibuatkan tiket oleh Mas Toni, sudah diminta di grup.')]}),
  I({id:'UA-415',type:'reminder',status:'wait',title:'DB utils /data over threshold',waitingOn:'Mas Eko (Data)',systems:['DB utils'],
   created:T('2026-11-16 10:00'),updates:[U('2026-11-16 10:00','UA','Sudah dilapor ke Mas Eko.')]}),
  I({id:'UA-410',type:'reminder',status:'wait',title:'Kembalikan link AJ ke DC-A (sekarang masih DC-B)',waitingOn:'Bu Ratna / Pak Harun',pic:'Network',nextAction:'Ingatkan network setelah ada keputusan Pak Harun.',context:'Dipindah ke DC-B karena link DC-A sempat drop.',systems:['Link AJ'],
   created:T('2026-11-15 14:30'),updates:[U('2026-11-15 14:30','UA','Info Bu Ratna: biarkan di DC-B dulu. Dodi/Bu Ratna akan bilang ke Pak Harun.')]}),
  I({id:'UA-411',type:'reminder',status:'wait',title:'FinLink: BIT61 belum terpegang',waitingOn:'FinLink',systems:['FinLink'],
   created:T('2026-11-15 18:00'),updates:[U('2026-11-16 15:55','UA','Sample BIT61 sudah dikirim ke FinLink.')]}),

  /* ---------- AB (dari contoh handover AB) ---------- */
  I({id:'AB-201',desk:'AB',desks:['AB','UA'],status:'wait',title:'Wholesale R25 masuk fase ORT (pre-production)',
   waitingOn:'Yuda (monitoring di UAT)',nextAction:'Pantau grup Wholesale. Kalau monitoring sudah siap, Yuda akan minta dipindah ke prod.',
   context:'COB sekarang diganti lewat web. SOP-nya diminta ke Pak Kurnia, lalu dari Pak Kurnia ke PAC.',systems:['Wholesale R25','COB'],
   created:T('2026-11-16 10:00'),updates:[
    U('2026-11-16 10:00','AB','Wholesale R25 sudah fase ORT. Monitoring sedang diselesaikan Yuda di UAT.'),
    U('2026-11-16 17:20','AB','Info: COB sekarang ganti lewat web. SOP diminta ke Pak Kurnia, dari Pak Kurnia ke PAC.')]}),
  I({id:'AB-202',desk:'AB',status:'fu',title:'DB adm-app penuh: ipg_base, bill_payment, yusp_benefit',tickets:[{sys:'Zoho',id:'#423589'}],
   waitingOn:'Hafiz, Mas Yoga',nextAction:'FU Hafiz soal CAB expand disk, dan minta nomor tiket ICM ke Yoga.',fuAt:T('2026-11-17 10:00'),
   context:'DBA tidak bisa asal bersihkan atau expand DB. ipg_base dan bill_payment dipegang Hafiz. yusp_benefit diarahkan ke Xiao, tapi Xiao bilang tidak pegang.',
   systems:['adm-app','ipg_base','bill_payment','yusp_benefit'],
   created:T('2026-11-15 16:00'),updates:[
    U('2026-11-15 16:00','AB','FU ke Hafiz untuk ipg_base dan bill_payment, ke Xiao untuk yusp_benefit.'),
    U('2026-11-16 09:40','AB','Hafiz confirm minta expand saja. Xiao tidak pegang yusp_benefit.'),
    U('2026-11-16 15:30','AB','Mas Yoga diskusi dengan Mas Indra soal expand disk adm-app. Rencananya lewat CAB.',['Status: Nunggu → Perlu FU','FU: Sel 17 Nov, 10:00'])]}),
  I({id:'AB-203',desk:'AB',status:'wait',title:'Restore data deposito: belum pasti sudah di-import',tickets:[{sys:'Jira',id:'DIPM-18434',url:JIRA+'DIPM-18434'}],
   waitingOn:'Wahyu / Computing',nextAction:'Tanya Wahyu apakah data dari NAS sudah di-import ke DB.',
   context:'Data sudah di-restore Gilang dan dimasukkan ke NAS. Tiket sudah digeser ke Computing.',systems:['Deposito','NAS'],
   created:T('2026-11-14 11:00'),updates:[
    U('2026-11-14 11:00','AB','Gilang sudah restore data deposito dan taruh di NAS.'),
    U('2026-11-15 15:30','AB','Tiket digeser ke Computing. Wahyu belum tahu sudah di-import ke DB atau belum.')]}),
  I({id:'AB-204',desk:'AB',status:'fu',title:'VDC: FDS reject rc 280 tapi transaksi di core sukses',
   waitingOn:'Fauzan → tim CMS',nextAction:'Tanya lagi ke Fauzan hasil cek dari CMS.',fuAt:T('2026-11-17 10:00'),
   context:'Info awal di chat tim Fraud. Fauzan yang FU ke CMS.',systems:['FDS','VDC','Core'],
   created:T('2026-11-13 15:00'),updates:[
    U('2026-11-13 15:00','AB','Fauzan: hari Senin akan dicek tim CMS.'),
    U('2026-11-16 10:30','AB','Sudah di-FU, katanya dilihat besok Selasa.'),
    U('2026-11-16 16:10','AB','FU lagi. Rudy (CMS) lagi cuti, belum ada update. Fauzan akan FU ke CMS lagi.',['Status: Nunggu → Perlu FU','FU: Sel 17 Nov, 10:00'])]}),
  I({id:'AB-205',desk:'AB',status:'wait',title:'VA PayKu: RCA sudah ada, tunggu arahan Product',
   waitingOn:'Product',systems:['VA PayKu'],
   created:T('2026-11-14 13:00'),updates:[U('2026-11-14 13:00','AB','RCA VA PayKu sudah ada. Tinggal tunggu arahan dari Product.')]}),
  I({id:'AB-206',desk:'AB',status:'fu',title:'Konfirmasi PIC BU ke Mira',
   waitingOn:'Mira',nextAction:'FU Mira lagi soal PIC BU.',fuAt:T('2026-11-16 21:00'),
   created:T('2026-11-13 10:00'),updates:[
    U('2026-11-13 10:00','AB','Tanya Mira siapa PIC BU.'),
    U('2026-11-15 16:00','AB','Belum dibalas, FU lagi.'),
    U('2026-11-16 14:30','AB','Masih belum dibalas.',['FU: Sen 16 Nov, 21:00'])]}),
  I({id:'AB-207',desk:'AB',status:'fu',title:'WEMQ DC-A sempat kena: RCA resmi belum ada',tickets:[{sys:'Jira',id:'DIPM-18754',url:JIRA+'DIPM-18754'}],
   waitingOn:'Arif (Network)',nextAction:'Minta RCA dimasukkan ke tiket atau dokumen resmi, bukan cuma lewat chat.',fuAt:T('2026-11-17 10:00'),
   context:'Jam 17:43 sudah normal dan traffic kembali 50:50.',systems:['WEMQ','DC-A'],
   created:T('2026-11-12 17:50'),updates:[
    U('2026-11-12 17:50','AB','WEMQ DC-A kena lagi, jam 17:43 sudah normal dan traffic 50:50. Minta root cause ke Network (Arif).'),
    U('2026-11-13 15:00','AB','Tiket di-close dengan keterangan root cause not found.'),
    U('2026-11-15 16:30','AB','Arif kasih RCA lewat chat, tapi belum ada di tiket atau dokumen resmi.',['Status: Nunggu → Perlu FU'])]}),
  I({id:'AB-208',desk:'AB',status:'wait',title:'Paylater QRIS gagal bayar, limit tidak kembali',
   tickets:[{sys:'SCP',id:'230455000009450028',url:SCP('230455000009450028')}],
   waitingOn:'Konfirmasi pelapor',nextAction:'Pastikan ke pelapor limit nasabah sudah kembali, lalu tutup.',
   context:'Komplain dari beberapa merchant dan helpdesk otorisasi bank mitra. Transaksi kena revert tapi limit tidak kembali; di adm-loan statusnya di ICPS cancel.',
   systems:['Paylater','QRIS','adm-loan','ICPS'],
   created:T('2026-11-09 10:00'),updates:[
    U('2026-11-09 10:00','AB','Komplain nasabah gagal bayar QRIS pakai Paylater. Kena revert tapi limit tidak kembali.'),
    U('2026-11-10 15:00','AB','Menurut WB limit sudah normal lagi.')]}),
  I({id:'AB-209',desk:'AB',status:'wait',title:'Anomali transaksi QRIS (tiket TPM)',tickets:[{sys:'Jira',id:'DIPM-18966',url:JIRA+'DIPM-18966'}],
   waitingOn:'TPM',context:'Info dari Rendi: transaksinya jadi di-force credit.',systems:['QRIS'],
   created:T('2026-11-14 15:00'),updates:[U('2026-11-14 15:00','AB','Tiket dari tim TPM soal anomali trx QRIS. Info Rendi: di-force credit.')]}),
  I({id:'AB-210',desk:'AB',status:'fu',title:'Tes skema matikan app_fio.txn_limit_info di UAT',
   pic:'Iqbal',nextAction:'Jalankan skema di UAT, screenshot error outgoing BI-Fast, kirim ke Iqbal.',fuAt:T('2026-11-17 10:00'),
   context:'Terkait bug txn_limit_info kemarin. Karena tidak ada maintenance BI-Fast, dicoba di UAT. Screenshot akan dibawa Iqbal ke orang Product.',
   systems:['app_fio','BI-Fast','UAT'],
   created:T('2026-11-16 15:00'),updates:[U('2026-11-16 15:00','AB','Iqbal minta jalankan skema mematikan app_fio.txn_limit_info.',['Status: Perlu FU'])]}),
  I({id:'AB-211',desk:'AB',type:'reminder',status:'wait',title:'Credit bureau: CBI sekarang main, PEFINDO backup',
   context:'Pefindo sempat jatuh. Ternyata tim Risk telat mengabari bahwa sudah diganti ke CBI.',systems:['CBI','PEFINDO'],
   created:T('2026-11-16 13:00'),updates:[U('2026-11-16 13:00','AB','Pefindo sempat jatuh, tim Risk telat kabari sudah ganti ke CBI (CBI = main, PEFINDO = backup).')]})
  ];
  const H=(sk,desk,status,note,sub,ack)=>{const from=rosterFor(sk,desk),to=rosterFor(nextKey(sk),desk);return {key:sk+'|'+desk,shift:sk,desk,from:[from],to:[to],status,note,submittedAt:sub?T(sub):null,submittedBy:sub?from:null,ackAt:ack?T(ack):null,ackBy:ack?to:null};};
  const list=[
   H('2026-11-15-S','UA','accepted','','2026-11-15 21:50','2026-11-15 22:06'),
   H('2026-11-15-M','UA','accepted','Pantau HDFS BDP, rebalancing jalan semalaman.','2026-11-16 05:52','2026-11-16 06:04'),
   H('2026-11-16-P','UA','accepted','Orderno seq 1 & 7 di SOP recon typo, sudah ditanya ke Hendra.','2026-11-16 13:55','2026-11-16 14:07'),
   H('2026-11-16-S','UA','draft','Recon wallet: SOP Refund masih ditahan. FU FinLink dan shadow limit sudah lewat jadwal, tolong dikejar.'),
   H('2026-11-15-S','AB','accepted','','2026-11-15 21:55','2026-11-15 22:03'),
   H('2026-11-15-M','AB','accepted','','2026-11-16 05:50','2026-11-16 06:02'),
   H('2026-11-16-P','AB','accepted','','2026-11-16 13:58','2026-11-16 14:05'),
   H('2026-11-16-S','AB','draft','Pefindo sempat jatuh: tim Risk telat kabari sudah ganti ke CBI (CBI main, PEFINDO backup). Kong dan Wholesale R25 juga penting buat UA.')
  ];
  const handovers={};list.forEach(h=>handovers[h.key]=h);
  return {v:6,now:T('2026-11-16 21:35'),me:'Sakti',desk:'UA',viewShift:null,issues,handovers,roster:{},auth:seedAuth(handovers),session:null,
    maint:seedMaint(),reports:seedReports(),mention:Object.assign({},MENTION0),tpl:tplSeed(),tplV:TPL_V,holidays:HOL0.slice()};
}

/* v7: data contoh disamarkan, data lama di browser tidak dipakai lagi */
const KEY=ONLINE?'handover-ops-online-v2':'handover-ops-proto-v7',PKEY='handover-ops-prefs';
/* Lengkapi data lama/dari server yang belum punya field baru */
function migrate(d,fresh){if(d.issues)d.issues.forEach(i=>{if(!i.desks)i.desks=[i.desk||'UA'];});
  if(!d.maint)d.maint=fresh?[]:seedMaint();if(!d.reports)d.reports=fresh?{}:seedReports();if(!d.mention)d.mention=Object.assign({},MENTION0);
  if(!d.tpl||(d.tplV||0)<TPL_V){d.tpl=tplSeed();d.tplV=TPL_V;delete d.taskTpl;}if(!d.holidays)d.holidays=HOL0.slice();
  if(d.auth){if(!d.auth.settings)d.auth.settings={idle:30,maxFail:5,lockMin:15};if(!d.auth.audit)d.auth.audit=[];
    const miss=TEAM.filter(n=>!d.auth.users[n]);if(miss.length){const sa=seedAuth({});miss.forEach(n=>{d.auth.users[n]=Object.assign(sa.users[n],{mfa:null});});}}
  return d;}
function load(){try{const s=localStorage.getItem(KEY);const d=s?JSON.parse(s):null;if(d)migrate(d);return d&&d.auth&&d.roster?d:null;}catch(e){return null;}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}pushSoon();}
/* Data awal mode online. "kosong": tanpa issue/handover/maintenance contoh, dan semua akun daftar authenticator sendiri saat login pertama. */
function freshData(){const s=seed();s.now=ONLINE?Date.now():s.now;
  if(CFG.startWith!=='contoh'){s.issues=[];s.handovers={};s.maint=[];s.reports={};s.auth.audit=[];TEAM.forEach(n=>{const u=s.auth.users[n];u.mfa=null;u.lastLogin=null;});}
  return s;}
let S=null;S=load()||seed();
let P={theme:'light',tips:true};try{Object.assign(P,JSON.parse(localStorage.getItem(PKEY)||'{}'));}catch(e){}
function saveP(){try{localStorage.setItem(PKEY,JSON.stringify(P));}catch(e){}}
const UI={q:'',type:'all',histDesk:null,ack:new Set(),editPeople:false,detail:null,resetArm:false,menu:false,arm:null};

const currentKey=()=>shiftKeyAt(S.now);
const find=id=>S.issues.find(i=>i.id===id);
const lastU=i=>i.updates[i.updates.length-1];
const lastAt=i=>i.updates.length?lastU(i).at:i.created;
function ensureHandover(sk,desk){
  const k=sk+'|'+desk;
  if(!S.handovers[k]){
    const prev=S.handovers[prevKey(sk)+'|'+desk];
    S.handovers[k]={key:k,shift:sk,desk,from:prev?prev.to.slice():[rosterFor(sk,desk)],to:[rosterFor(nextKey(sk),desk)],status:'draft',note:'',submittedAt:null,submittedBy:null,ackAt:null,ackBy:null};
  }
  return S.handovers[k];
}
function takenBy(sk,f){const m={};DESK_ORDER.filter(d=>d!==S.desk).forEach(d=>{ensureHandover(sk,d)[f].forEach(n=>{m[n]=DESKS[d].phone;});});return m;}
/* Mode lokal: jam demo maju 2 menit tiap aksi. Mode online: jam asli. */
function tick(){if(ONLINE){S.now=Date.now();return;}const r=shiftRange(currentKey());S.now=Math.min(S.now+2*60e3,r.end-60e3);}
function applyTheme(){const r=document.documentElement;if(P.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',P.theme);}
let toastT;function toast(msg){const t=document.getElementById('toast');t.innerHTML=ic('check',16)+'<span>'+esc(msg)+'</span>';t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},2400);}
function av(n,size){const i=TEAM.indexOf(n);return `<span class="av ${size||''}" style="background:${i<0?'var(--faint)':AV_COL[i]}" title="${esc(FULL[n]||n||'')}">${esc(n?initials(n):'?')}</span>`;}
const stateTitle=h=>h.status==='draft'?'Belum diserahkan':h.status==='submitted'?'Menunggu diterima':'Sudah diterima';
const txIc=(cls,icon)=>`<span class="tx-ic ${cls}">${ic(icon,18)}</span>`;
const cardBox=(title,count,body,extra)=>`<section class="card"><header class="card-h"><h2>${title}</h2>${count!=null?`<span class="count">${count}</span>`:''}${extra?`<span class="card-x">${extra}</span>`:''}</header>${body}</section>`;

/* ---------- top ---------- */
function route(){const h=location.hash.slice(1);return ['handover','issue','maint','laporan','riwayat','admin'].includes(h)?h:'handover';}
const NAV=[['handover','Serah terima','swap','Handover'],['issue','Issue','grid','Issue'],['maint','Maintenance','wrench','Maint'],['laporan','Laporan','file','Laporan'],['riwayat','Riwayat','history','Riwayat']];
const isAdmin=()=>!!(S.session&&S.auth.users[S.session.user]&&S.auth.users[S.session.user].role==='admin');
/* Admin dibuka dari menu akun, supaya header tidak penuh */
const navList=()=>NAV;
const THEMES=[['light','Terang','sun'],['dark','Gelap','moon'],['system','Ikut sistem','monitor']];
/* Pilihan tema 3 tombol dengan sorotan (thumb) yang meluncur ke pilihan aktif */
const THEME_ORDER=['light','dark','system'];
const themeBtns=()=>`<span class="th-thumb" aria-hidden="true" style="--i:${Math.max(0,THEME_ORDER.indexOf(P.theme))}"></span>`+[['light','Terang','sun'],['dark','Gelap','moon'],['system','Ikut sistem','monitor']].map(([v,l,i])=>`<button data-theme-set="${v}" aria-pressed="${P.theme===v}" title="Tema: ${l}" aria-label="Tema ${l}">${ic(i,15)}</button>`).join('');
function renderTop(){
  document.body.classList.toggle('desk-AB',S.desk==='AB');
  const r=route();const cur=currentKey();const nav=navList();const u=S.auth.users[S.me];const md=myDesk(S.me,cur);
  const nDue=mDue().length;const badge=k=>k==='maint'&&nDue?`<span class="nb" title="${nDue} pengingat maintenance">${nDue}</span>`:'';
  const th=THEMES.find(t=>t[0]===P.theme)||THEMES[0];const thN=THEMES[(THEMES.indexOf(th)+1)%3];
  document.getElementById('top').innerHTML=`
   <a class="brand" href="#handover">${MARK}<span class="word"><b>Handover</b><small>Ops Console</small></span></a>
   <nav class="tabs" aria-label="Menu">${nav.map(([k,l])=>`<a href="#${k}" ${r===k?'aria-current="page"':''}>${l}${badge(k)}</a>`).join('')}</nav>
   <div class="top-r">
    <div class="dseg" role="group" aria-label="Pilih HP">${DESK_ORDER.map(d=>`<button data-desk="${d}" aria-pressed="${S.desk===d}"><span class="hpdot ${d}"></span>${DESKS[d].phone}</button>`).join('')}</div>
    <button class="icbtn" data-theme-set="${thN[0]}" title="Tema: ${th[1]}. Klik untuk ${thN[1].toLowerCase()}" aria-label="Tema ${th[1]}, ganti ke ${thN[1]}">${ic(th[2],18)}</button>
    <div class="acct-w"><button class="acct" data-act="menu" aria-haspopup="menu" aria-expanded="${UI.menu}" title="${esc(FULL[S.me]||S.me)}">${av(S.me,'sm')}<span class="acct-n">${esc(S.me)}</span>${ic('chev',14)}</button>
     ${UI.menu?`<div class="menu" role="menu">
      <div class="menu-h">${av(S.me)}<div><b>${esc(FULL[S.me]||S.me)}</b><small>${esc(u.username)} · ${u.role==='admin'?'Admin':'Anggota'}</small><small>${md?'Pegang '+DESKS[md].phone+' shift ini':'Tidak terjadwal di shift ini'}</small></div></div>
      <div class="menu-s">${ic('shield',14)}<span>LDAP + ${esc(S.session.method||'authenticator')} · masuk ${fmtTime(S.session.at)}</span></div>
      ${u.role==='admin'?`<a class="mi" href="#admin" role="menuitem">${ic('settings',17)}Admin</a>`:''}
      <button class="mi danger" data-act="logout" role="menuitem">${ic('logout',17)}Keluar</button></div>`:''}</div>
   </div>`;
  const bn=document.getElementById('bnav');bn.style.gridTemplateColumns=`repeat(${nav.length},minmax(0,1fr))`;
  bn.innerHTML=nav.map(([k,l,i,s])=>`<a href="#${k}" ${r===k?'aria-current="page"':''} aria-label="${l}">${ic(i,20)}<span>${s}</span>${badge(k)}</a>`).join('');
}
function ring(done,total){const R=40,C=2*Math.PI*R;const p=total?done/total:1;return `<div class="ringwrap"><svg viewBox="0 0 96 96" width="96" height="96" aria-hidden="true"><circle cx="48" cy="48" r="${R}" class="ring-t"/><circle cx="48" cy="48" r="${R}" class="ring-p" stroke-dasharray="${(C*p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 48 48)"/></svg><div class="ring-c"><b class="num">${done}/${total}</b><small>sudah dicek</small></div></div>`;}

/* ---------- handover ---------- */
function renderHandover(band,v){
  const cur=currentKey();const sk=S.viewShift&&S.handovers[S.viewShift+'|'+S.desk]?S.viewShift:cur;const isCur=sk===cur;
  const h=ensureHandover(sk,S.desk);const sid=sidOf(sk);const nk=nextKey(sk);const nsid=sidOf(nk);
  const r=shiftRange(sk),nr=shiftRange(nk);const cr=shiftRange(cur);
  const all=S.issues.filter(i=>i.desks.includes(S.desk));const open=all.filter(i=>i.status!=='done');
  const touched=i=>i.updates.some(u=>inR(u.at,r));
  const order=(a,b)=>(a.type===b.type?0:a.type==='reminder'?1:-1)||ST_ORDER.indexOf(a.status)-ST_ORDER.indexOf(b.status);
  const unchecked=open.filter(i=>!touched(i)).sort(order);
  const checked=open.filter(touched).sort((a,b)=>lastAt(b)-lastAt(a));
  const resolved=all.filter(i=>i.status==='done'&&i.resolvedAt&&inR(i.resolvedAt,r));
  const warnings=open.filter(i=>i.warning);
  const fu=open.filter(i=>i.fuAt&&i.fuAt<nr.end).sort((a,b)=>a.fuAt-b.fuAt);
  const counts={wait:0,fu:0,hold:0};open.filter(i=>i.type==='issue').forEach(i=>counts[i.status]++);
  const isFrom=h.from.includes(S.me),isTo=h.to.includes(S.me);
  const canAck=isCur&&h.status==='submitted'&&isTo;
  const ackN=warnings.filter(w=>UI.ack.has(w.id)).length;const allAcked=ackN===warnings.length;
  const editable=isCur&&h.status==='draft';const canTouch=editable&&isFrom;
  const fromName=h.from.join(', ')||'—',toName=h.to.join(', ')||'shift berikutnya';

  let msg='',btn='';
  if(!isCur)msg='Catatan shift sebelumnya.';
  else if(h.status==='draft'){
    if(isFrom){msg=unchecked.length?`${unchecked.length} item belum dicek.`:'Semua item sudah dicek.';
      btn=`<button class="btn-w" data-act="submit" ${h.to.length?'':'disabled'}>${ic('arrow',17)}Serahkan</button>`;}
    else msg=`Yang menyerahkan ${esc(fromName)}.`;
  }else if(h.status==='submitted'){
    if(isTo){msg=warnings.length?`Centang ${warnings.length-ackN} item wajib dibaca dulu.`:`Diserahkan jam ${fmtTime(h.submittedAt)}.`;
      btn=`<button class="btn-w" data-act="accept" ${allAcked?'':'disabled'}>${ic('check',17)}Terima</button>`;}
    else msg=`Diserahkan ${esc(fromName)} jam ${fmtTime(h.submittedAt)}.`;
  }else{
    msg=`Diterima ${esc(h.ackBy)} jam ${fmtTime(h.ackAt)}.`;
    if(isCur&&!ONLINE)btn=`<button class="btn-w ghost" data-act="advance">Mulai Shift ${SHIFT[nsid].name} (demo)</button>`;
  }
  const editor=editable&&UI.editPeople?`<div class="editor">${['from','to'].map(f=>{const t=takenBy(sk,f);return `<div class="ed-row"><span class="ed-lbl">${f==='from'?'Dari':'Ke'}</span>${TEAM.map(n=>`<button class="opt" data-tg="${f}" data-name="${n}" aria-pressed="${h[f].includes(n)}" ${t[n]?`disabled title="Sudah pegang ${t[n]}"`:''} title="${esc(FULL[n])}">${n}</button>`).join('')}</div>`;}).join('')}<span class="ed-note">1 orang 1 HP. Nama yang redup sudah pegang HP lain.</span></div>`:'';

  band.innerHTML=`
   <div class="hero-top"><div><p class="hello">${greeting()}, ${esc(S.me)}</p><h1 class="h-w">Serah terima ${DESKS[S.desk].phone}</h1></div>
    <span class="shiftchip" style="--sc:var(--sh-${sidOf(cur).toLowerCase()})">${ic(SHIFT[sidOf(cur)].icon,16)}Shift ${SHIFT[sidOf(cur)].name} <span>· ${fmtTime(S.now)} · selesai ${dur(cr.end-S.now)} lagi</span></span></div>
   <section class="pass">
    <div>
     <div class="pass-meta"><span class="pass-tag">${ic('phone',13)}${DESKS[S.desk].phone}</span><span>${fmtDateL(r.start)} · ${SHIFT[sid].label}</span>${editable?`<button class="pass-edit" data-act="edit-people">${UI.editPeople?'Selesai':'Ganti orang'}</button>`:''}</div>
     <div class="pass-people">
      <div class="pp">${av(h.from[0],'lg')}<div><small>Shift ${SHIFT[sid].name}</small><b title="${esc(FULL[h.from[0]]||'')}">${esc(fromName)}</b></div></div>
      <span class="pass-line"><i></i>${ic('arrow',16)}</span>
      <div class="pp">${av(h.to[0],'lg')}<div><small>Shift ${SHIFT[nsid].name}</small><b title="${esc(FULL[h.to[0]]||'')}">${esc(toName)}</b></div></div>
     </div>
     <div class="pass-state"><b><span class="sdot ${h.status}"></span>${stateTitle(h)}</b><span>${msg}</span></div>
    </div>
    <div class="pass-r">${h.status==='draft'&&isCur?ring(checked.length,open.length):''}${btn}</div>
    <div class="pass-stats">${[['wait','Nunggu',counts.wait],['fu','Perlu FU',counts.fu],['hold','Simpen',counts.hold],['done','Selesai',resolved.length]].map(([c,l,n])=>`<div class="ps"><span><i class="dot ${c}"></i>${l}</span><b>${n}</b></div>`).join('')}</div>
    ${editor}
   </section>`;

  const tx=(i,o)=>{const u=lastU(i);
    const sub=o.checked?`${esc(u.by)} · ${fmtTime(u.at)} · ${esc(u.text)}`:[i.waitingOn?'Nunggu '+esc(i.waitingOn):'',`update ${ago(lastAt(i))}`].filter(Boolean).join(' · ');
    const icon=o.checked?txIc('done','check'):i.type==='reminder'?txIc('rem','pin'):txIc(i.status,STATUS[i.status].icon);
    const chips=[i.warning?'<span class="chip red">Wajib baca</span>':'',i.desks.length>1?'<span class="chip">UA + AB</span>':'',i.example?'<span class="chip">Contoh</span>':''].join('');
    return `<div class="tx" data-open="${i.id}">${icon}<div class="tx-main"><button class="tx-t" data-open="${i.id}">${esc(i.title)}</button><span class="tx-s">${sub}</span></div><div class="tx-end">${chips}${o.same?`<button class="btn sm" data-same="${i.id}">Masih sama</button>`:''}</div></div>`;};

  const toN=h.to[0]||rosterFor(nk,S.desk);const toU=S.auth.users[toN]?S.auth.users[toN].username:'';
  const tips=P.tips&&isCur?`<div class="howto"><b>Cara coba</b><ol>
    <li><span class="n">1</span><span>Klik <b>Masih sama</b>, lalu <b>Serahkan</b></span></li>
    <li><span class="n">2</span><span>Keluar, masuk sebagai ${esc(toN)} (<code>${esc(toU)}</code> / <code>demo</code>)</span></li>
    <li><span class="n">3</span><span>Centang wajib baca, lalu <b>Terima</b></span></li></ol>
    <button class="x" data-act="hide-tips" aria-label="Tutup panduan">${ic('x',16)}</button></div>`:'';

  const warnHtml=warnings.length?`<section class="alert"><div class="alert-h">${ic('alert',18)}Wajib dibaca<span class="count" style="margin-left:auto">${warnings.length}</span></div>${warnings.map(i=>`<div class="alert-i"><button class="tx-t" data-open="${i.id}">${esc(i.title)}</button><p>${esc(i.warning)}</p>
     ${canAck?`<label class="ack"><input type="checkbox" data-ack="${i.id}" ${UI.ack.has(i.id)?'checked':''}>Sudah saya baca</label>`:h.status==='accepted'?`<span class="acked">${ic('check',14)}Dibaca ${esc(h.ackBy)}, ${fmtTime(h.ackAt)}</span>`:''}</div>`).join('')}</section>`:'';

  const tab=UI.hoTab||'todo',LIM=6;
  const resRow=i=>`<div class="tx" data-open="${i.id}">${txIc('done','check')}<div class="tx-main"><button class="tx-t" data-open="${i.id}">${esc(i.title)}</button><span class="tx-s">${esc(lastU(i).by)} · ${fmtTime(i.resolvedAt)}</span></div></div>`;
  const items=tab==='done'?checked:tab==='res'?resolved:unchecked;
  const rowFn=i=>tab==='todo'?tx(i,{same:canTouch}):tab==='done'?tx(i,{checked:true}):resRow(i);
  const shown=UI.more?items:items.slice(0,LIM);
  const empty={todo:'Semua item sudah dicek di shift ini.',done:'Belum ada item yang dicek di shift ini.',res:'Belum ada yang selesai di shift ini.'}[tab];
  const listCard=`<section class="card"><header class="card-h tabs-h">
     <div class="seg" role="group" aria-label="Daftar item">${[['todo','Belum dicek',unchecked.length],['done','Sudah dicek',checked.length],['res','Selesai',resolved.length]].map(([k,l,n])=>`<button data-hotab="${k}" aria-pressed="${tab===k}">${l}<span>${n}</span></button>`).join('')}</div>
     <span class="card-acts"><button class="btn sm" data-act="copy" title="Salin teks handover untuk grup">${ic('copy',14)}Salin</button><button class="btn sm primary" data-act="new">${ic('plus',14)}Issue baru</button></span></header>
    <div class="card-b">${shown.length?shown.map(rowFn).join(''):`<p class="none">${empty}</p>`}</div>
    ${items.length>LIM?`<button class="more-btn" data-act="more">${UI.more?'Tampilkan lebih sedikit':`Tampilkan ${items.length-LIM} lagi`}</button>`:''}</section>`;
  const fuShown=UI.fuMore?fu:fu.slice(0,4);
  const fuCard=`<section class="card"><header class="card-h"><h2>Follow up terjadwal</h2><span class="count">${fu.length}</span><span class="card-x">s/d ${fmtTime(nr.end)}</span></header>
    <div class="card-b">${fuShown.length?fuShown.map(i=>`<div class="tx" data-open="${i.id}">${txIc(i.fuAt<S.now?'over':'fu','bell')}<div class="tx-main"><button class="tx-t" data-open="${i.id}">${esc(i.title)}</button><span class="tx-s">${esc(i.nextAction||'')}</span></div><div class="tx-end"><span class="tx-time ${i.fuAt<S.now?'over':''}">${i.fuAt<S.now?'Lewat':shortWhen(i.fuAt)}</span></div></div>`).join(''):'<p class="none">Tidak ada.</p>'}</div>
    ${fu.length>4?`<button class="more-btn" data-act="fumore">${UI.fuMore?'Tampilkan lebih sedikit':`Tampilkan ${fu.length-4} lagi`}</button>`:''}</section>`;

  const soonM=mWin().filter(x=>wState(x.w)!=='end'&&x.w.start-S.now<=12*3600e3).sort((a,b)=>a.w.start-b.w.start);
  const mCard=`<section class="card"><header class="card-h"><h2>Maintenance</h2><span class="count">${soonM.length}</span><span class="card-x"><a href="#maint">Semua jadwal</a></span></header>
    <div class="card-b">${soonM.length?soonM.slice(0,4).map(mRow).join(''):'<p class="none">Tidak ada maintenance dalam 12 jam ke depan.</p>'}</div></section>`;

  v.innerHTML=`
   ${tips}
   ${!isCur?`<div class="banner">Kamu lagi lihat ${esc(shiftShort(sk))}. <button class="link" data-act="back">Kembali ke shift sekarang</button></div>`:''}
   ${isCur&&!myDesk(S.me,cur)?`<div class="banner">${ic('info',16)}<span>Kamu tidak terjadwal di shift ini, jadi cuma bisa lihat dan menulis update issue. Serah terima dilakukan petugas shift.</span></div>`:''}
   <div class="grid2">
    <div class="col">
     ${isCur?dueBox(mDue(),3,false):''}
     ${warnHtml}
     ${listCard}
    </div>
    <div class="col">
     ${isCur?mCard:''}
     ${fuCard}
     ${cardBox('Catatan shift',null,`<div class="card-b pad">${editable&&isFrom?`<textarea id="ho-note" placeholder="Hal umum yang perlu diketahui shift berikutnya">${esc(h.note)}</textarea><p class="note-h">Tersimpan otomatis.</p>`:`<p class="${h.note?'':'none'}" style="${h.note?'color:var(--ink-2)':''}">${h.note?esc(h.note):'Tidak ada catatan.'}</p>`}</div>`)}
    </div>
   </div>`;
}

/* ---------- issues ---------- */
function renderIssues(band,v){
  const mine=S.issues.filter(i=>i.desks.includes(S.desk));
  band.innerHTML=`<div class="hero-top"><div><p class="hello">${DESKS[S.desk].phone}</p><h1 class="h-w">Issue</h1><p class="sub-w">${mine.filter(i=>i.status!=='done').length} masih open</p></div>
    <button class="btn-w" data-act="new">${ic('plus',17)}Issue baru</button></div>
   <div class="tool"><label class="search">${ic('search',17)}<input type="search" id="q" placeholder="Cari issue, tiket, orang, isi update…" value="${esc(UI.q)}" aria-label="Cari issue"></label>
    <div class="dseg" role="group" aria-label="Tipe">${[['all','Semua'],['issue','Issue'],['reminder','Reminder']].map(([k,l])=>`<button data-type="${k}" aria-pressed="${UI.type===k}">${l}</button>`).join('')}</div></div>`;
  v.innerHTML=`<div class="board" id="lanes"></div>`;
  renderLanes();
}
function matches(i){
  if(!i.desks.includes(S.desk))return false;
  if(UI.type!=='all'&&i.type!==UI.type)return false;
  if(!UI.q)return true;
  const hay=[i.id,i.title,i.context,i.waitingOn,i.pic,i.nextAction,i.warning,...i.systems,...i.tags,...i.tickets.map(t=>t.sys+' '+t.id),...i.updates.map(u=>u.text+' '+u.by+' '+(FULL[u.by]||''))].join(' ').toLowerCase();
  return UI.q.toLowerCase().split(/\s+/).every(w=>hay.includes(w));
}
function renderLanes(){
  const el=document.getElementById('lanes');if(!el)return;
  el.innerHTML=ST_ORDER.map(st=>{
    const items=S.issues.filter(i=>i.status===st&&matches(i)).sort((a,b)=>(b.warning?1:0)-(a.warning?1:0)||(a.fuAt||Infinity)-(b.fuAt||Infinity)||lastAt(b)-lastAt(a));
    return `<div class="lane"><div class="lane-h">${txIc(st,STATUS[st].icon)}${STATUS[st].long}<span class="count">${items.length}</span></div>
     ${items.length?items.map(icard).join(''):`<div class="lane-none">${UI.q?'Tidak ada yang cocok':'Kosong'}</div>`}</div>`;
  }).join('');
}
function icard(i){
  const open=i.status!=='done';const f=[];
  if(i.warning&&open)f.push('<span class="chip red">Wajib baca</span>');
  if(open&&i.fuAt)f.push(`<span class="chip ${i.fuAt<S.now?'red':''}">FU ${i.fuAt<S.now?'lewat':shortWhen(i.fuAt)}</span>`);
  if(i.type==='reminder')f.push('<span class="chip">Reminder</span>');
  if(i.desks.length>1)f.push('<span class="chip">UA + AB</span>');
  return `<div class="icard" role="button" tabindex="0" data-open="${i.id}">
   <div class="icard-t">${esc(i.title)}</div>
   <div class="icard-s">${open?(i.waitingOn?'Nunggu '+esc(i.waitingOn):'Belum ada yang ditunggu'):'Selesai '+ago(i.resolvedAt||lastAt(i))}</div>
   <div class="icard-f">${f.join('')}<span class="id">${esc(i.id)}</span></div></div>`;
}

/* ---------- history ---------- */
function renderHistory(band,v){
  const fd=UI.histDesk||S.desk;
  const list=Object.values(S.handovers).filter(h=>fd==='all'||h.desk===fd).sort((a,b)=>shiftRange(b.shift).start-shiftRange(a.shift).start||a.desk.localeCompare(b.desk));
  band.innerHTML=`<div class="hero-top"><div><p class="hello">Mutasi serah terima</p><h1 class="h-w">Riwayat</h1><p class="sub-w">Siapa menyerahkan ke siapa, dan kapan diterima.</p></div>
    <div class="dseg" role="group" aria-label="Pilih HP">${[['UA','HP UA'],['AB','HP AB'],['all','Semua']].map(([k,l])=>`<button data-hist="${k}" aria-pressed="${fd===k}">${l}</button>`).join('')}</div></div>`;
  let html='';
  list.forEach((h,idx)=>{const r=shiftRange(h.shift);const day=fmtDateL(r.start);const sid=sidOf(h.shift);
    const prevDay=idx>0?fmtDateL(shiftRange(list[idx-1].shift).start):'';
    if(day!==prevDay)html+=`<div class="hist-d">${day}</div><div class="card-b" style="padding-top:0;padding-bottom:4px">`;
    html+=`<div class="tx" data-view="${esc(h.key)}" role="button" tabindex="0">${txIc(sid,SHIFT[sid].icon)}<div class="tx-main"><span class="tx-t">Shift ${SHIFT[sid].name}${fd==='all'?' · '+DESKS[h.desk].phone:''}</span><span class="h-who"><b>${esc(h.from.join(', '))}</b>${ic('arrow',13)}<b>${esc(h.to.join(', '))}</b></span></div>
      <div class="tx-end"><span class="h-st"><span class="sdot ${h.status}"></span>${h.status==='accepted'?'Diterima '+fmtTime(h.ackAt):h.status==='submitted'?'Diserahkan '+fmtTime(h.submittedAt):'Belum diserahkan'}</span></div></div>`;
    const nextDay=idx<list.length-1?fmtDateL(shiftRange(list[idx+1].shift).start):'';
    if(nextDay!==day)html+='</div>';});
  v.innerHTML=`<section class="card" style="padding-bottom:10px">${html||'<div class="card-b"><p class="none">Belum ada riwayat.</p></div>'}</section>`;
}

/* ---------- drawer ---------- */
const dlg=document.getElementById('dlg');
const toLocalInput=ms=>{if(!ms)return '';const d=new Date(ms);return ymd(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes());};
const fromLocalInput=v=>v?T(v.replace('T',' ')):null;
function stPicker(cur){return `<input type="hidden" id="u-status" value="${cur}"><div class="sseg" role="group" aria-label="Status">${ST_ORDER.map(s=>`<button type="button" data-setst="${s}" aria-pressed="${s===cur}"><span class="dot ${s}"></span>${STATUS[s].label}</button>`).join('')}</div>`;}
function fuPicker(id,val){return `<input type="datetime-local" id="${id}" value="${toLocalInput(val)}" aria-label="Jadwal follow up">
  <div class="quickfu">${[['1h','+1 jam'],['next','Awal shift berikut'],['tmr','Besok 09:00'],['clear','Hapus']].map(([k,l])=>`<button type="button" class="pillbtn" data-fu="${k}" data-for="${id}">${l}</button>`).join('')}</div>`;}
function deskChecks(p,sel){return `<div class="desk-pick">${DESK_ORDER.map(d=>`<label><input type="checkbox" id="${p}-desk-${d}" ${sel.includes(d)?'checked':''}>${DESKS[d].phone}</label>`).join('')}</div>`;}
const readDesks=p=>DESK_ORDER.filter(d=>{const el=document.getElementById(p+'-desk-'+d);return el&&el.checked;});
function openDetail(id){UI.detail=id;renderDetail();if(!dlg.open)dlg.showModal();setTimeout(()=>{const t=document.getElementById('u-text');if(t)t.focus();},40);}
function renderDetail(){
  const i=find(UI.detail);if(!i)return;
  const groups=[];[...i.updates].reverse().forEach(u=>{const k=shiftKeyAt(u.at);let g=groups[groups.length-1];if(!g||g.k!==k){g={k,items:[]};groups.push(g);}g.items.push(u);});
  const showDesk=i.desks.length>1;
  const rows=[
    ['Nunggu',esc(i.waitingOn||'—')],
    ['Next action',esc(i.nextAction||'—')],
    ['Follow up',i.fuAt?`<span style="${i.fuAt<S.now?'color:var(--danger);font-weight:700':''}">${fmtDT(i.fuAt)}${i.fuAt<S.now?' (lewat)':''}</span>`:'—'],
    i.pic?['PIC',esc(i.pic)]:null,
    i.tickets.length?['Tiket',i.tickets.map(t=>t.url?`<a href="${esc(t.url)}" target="_blank" rel="noopener">${esc((t.sys?t.sys+' ':'')+t.id)}</a>`:esc((t.sys?t.sys+' ':'')+t.id)).join(', ')]:null,
    i.systems.length?['Sistem',esc(i.systems.join(', '))]:null,
    i.links.length?['Link',i.links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(', ')]:null,
    ['Tampil di',i.desks.map(d=>DESKS[d].phone).join(' dan ')],
    ['Dibuka',`${fmtDT(i.created)} (${dur(S.now-i.created)})`]
  ].filter(Boolean);
  dlg.innerHTML=`<div class="d-head">
    <div class="d-top"><span>${esc(i.id)} · ${i.desks.map(d=>DESKS[d].phone).join(' + ')}${i.example?' · Contoh':''}</span><button class="x" data-act="close" aria-label="Tutup">${ic('x',18)}</button></div>
    <h2>${esc(i.title)}</h2>
    <div class="d-st"><span class="st-pill"><span class="dot ${i.status}"></span>${STATUS[i.status].long}</span>${i.type==='reminder'?'<span class="st-pill">Reminder</span>':''}${i.waitingOn&&i.status!=='done'?`<span class="st-pill">Nunggu ${esc(i.waitingOn)}</span>`:''}</div>
   </div>
   <div class="d-body">
   ${i.warning?`<div class="d-warn">${ic('alert',18)}<div><b>Wajib dibaca</b>${esc(i.warning)}</div></div>`:''}
   <form id="upd-form" class="panel">
    <div class="panel-h">Tulis update</div>
    <textarea id="u-text" placeholder="Apa perkembangannya?" aria-label="Isi update"></textarea>
    <div class="fl"><span>Status</span>${stPicker(i.status)}</div>
    <div class="fl"><span>Follow up lagi</span>${fuPicker('u-fu',i.fuAt)}</div>
    <details class="more"><summary>Lainnya</summary><div class="fgrid">
     <div class="fl"><span>Nunggu siapa</span><input type="text" id="u-wait" value="${esc(i.waitingOn)}"></div>
     <div class="fl"><span>Next action</span><input type="text" id="u-next" value="${esc(i.nextAction)}"></div>
     <div class="fl"><span>Wajib dibaca (kosongkan kalau tidak ada)</span><input type="text" id="u-warn" value="${esc(i.warning)}"></div>
     <div class="fl"><span>Tampil di</span>${deskChecks('u',i.desks)}</div></div></details>
    <div class="f-act"><span class="form-msg" id="u-msg"></span><button class="btn primary" type="submit">Simpan update</button></div>
   </form>
   <section class="panel"><div class="panel-h">Detail</div><dl class="dl">${rows.map(([k,val])=>`<div><dt>${k}</dt><dd>${val}</dd></div>`).join('')}</dl>
    ${i.context?`<div class="fl"><span>Konteks</span><p class="ctx">${esc(i.context)}</p></div>`:''}</section>
   <section class="panel"><div class="panel-h">Riwayat update</div><div class="tl">
    ${groups.map(g=>`<div class="tl-g"><div class="tl-h">${esc(shiftShort(g.k))}</div>${g.items.map(u=>{const hd=deskOf(u.by,g.k);return `<div class="upd">${av(u.by,'sm')}<div><div class="upd-h"><b>${esc(u.by)}</b><span>${fmtTime(u.at)}${showDesk&&hd?' · '+DESKS[hd].phone:''}</span></div><div class="upd-t">${esc(u.text)}</div>${u.changes&&u.changes.length?`<div class="upd-c">${esc(u.changes.join(' · '))}</div>`:''}</div></div>`;}).join('')}</div>`).join('')}</div></section>
  </div>`;
}
function saveUpdate(){
  const i=find(UI.detail);const g=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
  const text=g('u-text'),st=g('u-status'),wait=g('u-wait'),next=g('u-next'),warn=g('u-warn'),fu=fromLocalInput(g('u-fu'));
  const ch=[];
  if(st!==i.status)ch.push(`Status: ${STATUS[i.status].label} → ${STATUS[st].label}`);
  if(wait!==(i.waitingOn||''))ch.push('Nunggu: '+(wait||'—'));
  if(next!==(i.nextAction||''))ch.push('Next action diubah');
  if(fu!==(i.fuAt||null))ch.push(fu?'FU: '+fmtDT(fu):'FU dihapus');
  if(warn!==(i.warning||''))ch.push(warn?'Wajib baca diubah':'Wajib baca dihapus');
  const desks=readDesks('u');if(!desks.length){document.getElementById('u-msg').textContent='Pilih minimal satu HP.';return;}
  if(desks.join()!==DESK_ORDER.filter(d=>i.desks.includes(d)).join())ch.push('Tampil di: '+desks.join(' + '));
  if(!text&&!ch.length){document.getElementById('u-msg').textContent='Tulis update atau ubah status dulu.';return;}
  tick();
  i.updates.push({at:S.now,by:S.me,text:text||'Ubah detail.',changes:ch});
  if(st==='done'&&i.status!=='done')i.resolvedAt=S.now;
  if(st!=='done')delete i.resolvedAt;
  Object.assign(i,{status:st,waitingOn:wait,nextAction:next,warning:warn,fuAt:fu,desks});
  save();renderDetail();render();toast('Update tersimpan');
}
function markSame(id){const i=find(id);tick();i.updates.push({at:S.now,by:S.me,text:'Dicek, belum ada perkembangan.',changes:[]});save();render();toast('Ditandai sudah dicek');}
function openNew(){
  UI.detail=null;
  dlg.innerHTML=`<div class="d-head"><div class="d-top"><span>${DESKS[S.desk].phone}</span><button class="x" data-act="close" aria-label="Tutup">${ic('x',18)}</button></div><h2>Issue baru</h2></div>
   <div class="d-body"><form id="new-form" class="panel">
    <div class="fl"><span>Judul</span><input type="text" id="n-title" placeholder="Contoh: Disk VM Kong >85%"></div>
    <div class="fl"><span>Status</span>${stPicker('wait')}</div>
    <div class="fl"><span>Nunggu siapa</span><input type="text" id="n-wait" placeholder="Contoh: Hendra (UA)"></div>
    <div class="fl"><span>Next action</span><input type="text" id="n-next"></div>
    <div class="fl"><span>Follow up</span>${fuPicker('n-fu',null)}</div>
    <details class="more"><summary>Lainnya</summary><div class="fgrid">
     <div class="fl"><span>Tipe</span><select id="n-type" class="inp"><option value="issue">Issue</option><option value="reminder">Reminder</option></select></div>
     <div class="fl"><span>Tampil di</span>${deskChecks('n',[S.desk])}</div>
     <div class="fl"><span>Tiket (pisah koma)</span><input type="text" id="n-tix" placeholder="DIPM-18897, Zoho #423516"></div>
     <div class="fl"><span>PIC</span><input type="text" id="n-pic"></div>
     <div class="fl"><span>Sistem (pisah koma)</span><input type="text" id="n-sys"></div>
     <div class="fl"><span>Tag</span><input type="text" id="n-tag" placeholder="UAT, PROD"></div>
     <div class="fl"><span>Wajib dibaca</span><input type="text" id="n-warn" placeholder="Contoh: jangan jalankan SOP X sebelum konfirmasi Dev"></div>
     <div class="fl"><span>Konteks</span><textarea id="n-ctx"></textarea></div></div></details>
    <div class="f-act"><span class="form-msg" id="n-msg"></span><button class="btn primary" type="submit">Buat issue</button></div>
   </form></div>`;
  if(!dlg.open)dlg.showModal();
  setTimeout(()=>{const t=document.getElementById('n-title');if(t)t.focus();},40);
}
function parseTickets(s){return s.split(',').map(x=>x.trim()).filter(Boolean).map(t=>{
  if(/^[A-Z][A-Z0-9]+-\d+$/.test(t))return {sys:'Jira',id:t,url:JIRA+t};
  const m=t.match(/^(zoho|scp|jira)\s+(.+)$/i);if(m){const sys=m[1].toLowerCase()==='scp'?'SCP':m[1][0].toUpperCase()+m[1].slice(1).toLowerCase();return {sys,id:m[2],url:sys==='SCP'&&/^\d+$/.test(m[2])?SCP(m[2]):null};}
  return {sys:'',id:t};});}
function createIssue(){
  const g=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
  if(!g('n-title')){document.getElementById('n-msg').textContent='Judul wajib diisi.';return;}
  const desks=readDesks('n');if(!desks.length){document.getElementById('n-msg').textContent='Pilih minimal satu HP.';return;}
  tick();const desk=desks.includes(S.desk)?S.desk:desks[0];
  const nums=S.issues.filter(i=>i.desk===desk).map(i=>+i.id.split('-')[1]);
  const st=g('u-status')||'wait';
  const i=I({id:desk+'-'+(Math.max(0,...nums)+1),type:g('n-type')||'issue',desk,desks,tags:g('n-tag')?g('n-tag').split(',').map(x=>x.trim()).filter(Boolean):[],status:st,title:g('n-title'),
    tickets:parseTickets(g('n-tix')),waitingOn:g('n-wait'),pic:g('n-pic'),nextAction:g('n-next'),fuAt:fromLocalInput(g('n-fu')),warning:g('n-warn'),
    context:g('n-ctx'),systems:g('n-sys')?g('n-sys').split(',').map(x=>x.trim()).filter(Boolean):[],created:S.now,
    updates:[{at:S.now,by:S.me,text:'Issue dibuat.',changes:['Status: '+STATUS[st].label]}]});
  if(st==='done')i.resolvedAt=S.now;
  S.issues.push(i);S.desk=desk;save();openDetail(i.id);render();toast('Issue dibuat');
}
function buildText(sk,desk){
  const h=S.handovers[sk+'|'+desk];const sid=sidOf(sk);const r=shiftRange(sk);const nk=nextKey(sk);const nr=shiftRange(nk);
  const all=S.issues.filter(i=>i.desks.includes(desk));const open=all.filter(i=>i.status!=='done');
  const counts={wait:0,fu:0,hold:0,done:0};all.filter(i=>i.type==='issue').forEach(i=>{if(i.status!=='done')counts[i.status]++;else if(i.resolvedAt&&inR(i.resolvedAt,r))counts.done++;});
  const L=[];
  L.push(`# Handover ${DESKS[desk].phone} · Shift ${SHIFT[sid].name} · ${fmtDate(r.start)} · ${SHIFT[sid].label}`);
  L.push(`Dari: ${h.from.join(', ')} → Ke: ${h.to.join(', ')} (Shift ${SHIFT[sidOf(nk)].name})`);
  L.push(`Ringkasan: 🕑 ${counts.wait} · 💬 ${counts.fu} · ⏸️ ${counts.hold} · ✅ ${counts.done}`);
  if(h.note)L.push('',`Catatan: ${h.note}`);
  const w=open.filter(i=>i.warning);if(w.length){L.push('','## ⚠️ Wajib dibaca');w.forEach(i=>L.push(`- ${i.title}: ${i.warning}`));}
  const fu=open.filter(i=>i.fuAt&&i.fuAt<nr.end).sort((a,b)=>a.fuAt-b.fuAt);if(fu.length){L.push('','## ⏰ Jadwal FU');fu.forEach(i=>L.push(`- ${fmtDT(i.fuAt)}${i.fuAt<S.now?' (LEWAT)':''} · ${i.title}${i.nextAction?' — '+i.nextAction:''}`));}
  const rem=open.filter(i=>i.type==='reminder');if(rem.length){L.push('','## 📌 Reminder');rem.forEach(i=>L.push(`- ${i.title}${i.waitingOn?' (nunggu '+i.waitingOn+')':''}`));}
  ST_ORDER.forEach(st=>{
    const items=all.filter(i=>i.type==='issue'&&i.status===st&&(st!=='done'||(i.resolvedAt&&inR(i.resolvedAt,r))));
    if(!items.length)return;
    L.push('',`## ${STATUS[st].emoji} ${STATUS[st].long}`);
    items.forEach(i=>{
      L.push('',`### ${i.title}${i.tickets.length?' — '+i.tickets.map(t=>(t.sys?t.sys+' ':'')+t.id).join(', '):''}${i.desks.length>1?' [UA + AB]':''}`);
      const meta=[i.waitingOn&&st!=='done'?'Nunggu: '+i.waitingOn:'',i.nextAction&&st!=='done'?'Next: '+i.nextAction:'',i.fuAt&&st!=='done'?'FU: '+fmtDT(i.fuAt):''].filter(Boolean);
      if(meta.length)L.push(meta.join(' · '));
      const ups=i.updates.filter(u=>inR(u.at,r));
      if(ups.length)ups.forEach(u=>L.push(`- ${fmtTime(u.at)} ${u.by}: ${u.text}${u.changes.length?' ['+u.changes.join('; ')+']':''}`));
      else L.push(`- (tidak ada update shift ini, terakhir ${ago(lastAt(i))})`);
    });
  });
  return L.join('\n');
}
function openCopy(){
  const sk=S.viewShift&&S.handovers[S.viewShift+'|'+S.desk]?S.viewShift:currentKey();
  dlg.innerHTML=`<div class="d-head"><div class="d-top"><span>${DESKS[S.desk].phone}</span><button class="x" data-act="close" aria-label="Tutup">${ic('x',18)}</button></div><h2>Teks untuk grup</h2></div>
   <div class="d-body"><section class="panel"><p style="color:var(--muted);font-size:14px">Format mirip file handover lama, siap ditempel.</p>
   <textarea id="copy-ta" class="copy-ta" readonly aria-label="Teks handover">${esc(buildText(sk,S.desk))}</textarea>
   <div class="f-act"><span id="copy-msg" style="margin-right:auto;font-size:13.5px;color:var(--muted)"></span><button class="btn primary" data-act="do-copy">${ic('copy',16)}Salin</button></div></section></div>`;
  if(!dlg.open)dlg.showModal();
}

/* ---------- login: LDAP (disimulasikan) + authenticator ---------- */
const AU={step:'cred',user:null,err:'',info:'',ok:'',prefill:'',backup:false,enroll:null,codes:null,busy:false};
const val=id=>{const el=document.getElementById(id);return el?el.value.trim():'';};
const userByName=u=>{u=(u||'').trim().toLowerCase();return TEAM.find(n=>S.auth.users[n].username===u)||null;};
const isLocked=n=>S.auth.users[n].lockedUntil>Date.now();
function myDesk(n,sk){return deskOf(n,sk)||DESK_ORDER.find(d=>{const h=S.handovers[sk+'|'+d];return h&&h.to.includes(n);})||null;}
function audit(cat,ev,text,by){if(ONLINE)S.now=Date.now();S.auth.audit.push({id:S.now.toString(36)+Math.random().toString(36).slice(2,7),at:S.now,by:by===undefined?(S.session?S.session.user:null):by,cat,ev,text});if(S.auth.audit.length>500)S.auth.audit.splice(0,S.auth.audit.length-500);}
function lockMsg(n){const m=Math.max(1,Math.ceil((S.auth.users[n].lockedUntil-Date.now())/60e3));return `Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi ${m} menit lagi, atau minta admin membuka kunci.`;}
function failAttempt(n,ev,text){const u=S.auth.users[n],st=S.auth.settings;u.failed=(u.failed||0)+1;audit('auth',ev,text,n);
  if(u.failed>=st.maxFail){u.lockedUntil=Date.now()+st.lockMin*60e3;u.failed=0;audit('auth','lock',`Akun dikunci ${st.lockMin} menit setelah ${st.maxFail}x gagal`,n);}save();}
function resetAU(o){Object.assign(AU,{step:'cred',user:null,err:'',info:'',ok:'',backup:false,enroll:null,codes:null,busy:false},o||{});}
const idleExpired=()=>!!(S.session&&Date.now()-S.session.last>S.auth.settings.idle*60e3);
const idleMsg=()=>`Kamu otomatis keluar karena tidak aktif ${S.auth.settings.idle} menit.`;
function endSession(reason,info,prefillName){
  const n=S.session&&S.session.user;
  if(n){const t={idle:['timeout','Sesi berakhir: tidak aktif '+S.auth.settings.idle+' menit'],shift:['logout','Sesi berakhir: pergantian shift'],force:['force','Sesi dikeluarkan oleh admin'],off:['force','Sesi ditutup: akses akun dicabut']}[reason]||['logout','Logout'];audit('auth',t[0],t[1],n);}
  S.session=null;UI.menu=false;if(dlg.open)dlg.close();
  const pn=prefillName||n;resetAU({info:info||'',prefill:pn&&S.auth.users[pn]?S.auth.users[pn].username:''});save();
}
function logout(reason,info,prefillName){endSession(reason,info,prefillName);render();window.scrollTo(0,0);}

function doLogin(){
  const uname=val('l-user');const pe=document.getElementById('l-pass');const pw=pe?pe.value:'';if(pe)pe.value='';
  resetAU({prefill:uname});
  if(!uname||!pw){AU.err='Isi username dan password dulu.';return renderAuth();}
  const n=userByName(uname);
  if(n&&isLocked(n)){AU.err=lockMsg(n);return renderAuth();}
  if(!n||pw!=='demo'){
    AU.err='Username atau password salah.';
    if(n){failAttempt(n,'login_fail','Login gagal: password salah');if(isLocked(n))AU.err=lockMsg(n);}
    else{audit('auth','login_fail',`Login gagal: username "${uname.slice(0,40)}" tidak dikenal`,null);save();}
    return renderAuth();
  }
  const u=S.auth.users[n];
  if(!u.active){AU.err='Akun kamu belum punya akses ke aplikasi ini. Minta admin menambahkan kamu ke grup OPS-HANDOVER.';audit('auth','login_fail','Login ditolak: akun nonaktif',n);save();return renderAuth();}
  AU.user=n;
  if(u.mfa)AU.step='mfa';else{AU.step='enroll';AU.enroll={secret:randB32(32)};}
  renderAuth();
}
async function matchTotp(secret,code){const now=Math.floor(Date.now()/30000);for(const d of [0,-1,1]){if(await totpAt(secret,now+d)===code)return now+d;}return null;}
async function doOtp(){
  if(AU.busy||!AU.user)return;const n=AU.user;const u=S.auth.users[n];const code=val('otp').replace(/\D/g,'');
  if(isLocked(n)){resetAU({prefill:u.username,err:lockMsg(n)});return renderAuth();}
  if(code.length!==6){AU.err='Kode harus 6 digit.';return renderAuth();}
  AU.busy=true;let step=null;try{step=await matchTotp(u.mfa.secret,code);}finally{AU.busy=false;}
  if(step===null){AU.err='Kode salah atau sudah kedaluwarsa. Coba kode terbaru.';failAttempt(n,'mfa_fail','Kode authenticator salah');if(isLocked(n))resetAU({prefill:u.username,err:lockMsg(n)});return renderAuth();}
  if(step<=(u.mfa.lastStep||0)){AU.err='Kode ini sudah dipakai. Tunggu kode berikutnya muncul di aplikasi.';return renderAuth();}
  u.mfa.lastStep=step;finishLogin(n,'authenticator');
}
function doBackup(){
  if(!AU.user)return;const n=AU.user;const u=S.auth.users[n];const code=val('bk').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(isLocked(n)){resetAU({prefill:u.username,err:lockMsg(n)});return renderAuth();}
  const i=u.mfa.backup.indexOf(code);
  if(i<0){AU.err='Kode cadangan tidak cocok atau sudah pernah dipakai.';failAttempt(n,'mfa_fail','Kode cadangan salah');if(isLocked(n))resetAU({prefill:u.username,err:lockMsg(n)});return renderAuth();}
  u.mfa.backup.splice(i,1);audit('auth','backup',`Pakai kode cadangan (sisa ${u.mfa.backup.length})`,n);finishLogin(n,'kode cadangan');
}
async function doEnroll(){
  if(AU.busy||!AU.user||!AU.enroll)return;const n=AU.user;const code=val('otp').replace(/\D/g,'');
  if(code.length!==6){AU.err='Kode harus 6 digit.';return renderAuth();}
  AU.busy=true;let step=null;try{step=await matchTotp(AU.enroll.secret,code);}finally{AU.busy=false;}
  if(step===null){AU.err='Kode belum cocok. Pastikan jam di HP diatur otomatis, lalu masukkan kode terbaru.';return renderAuth();}
  const codes=genBackup();S.auth.users[n].mfa={secret:AU.enroll.secret,at:S.now,backup:codes,lastStep:step};
  audit('auth','mfa_enroll','Authenticator didaftarkan',n);save();
  Object.assign(AU,{codes,step:'codes',err:'',ok:'Authenticator aktif. Satu langkah lagi.'});renderAuth();
}
function finishLogin(n,method){
  const u=S.auth.users[n];u.failed=0;u.lastLogin=S.now;
  S.session={user:n,at:S.now,start:Date.now(),last:Date.now(),method};S.me=n;
  const d=myDesk(n,currentKey());if(d)S.desk=d;S.viewShift=null;UI.ack.clear();UI.editPeople=false;UI.menu=false;
  audit('auth','login','Login berhasil (LDAP + '+method+')',n);resetAU();save();
  /* setelah login selalu mulai dari Serah terima */
  UI.rpKey=null;UI.hoTab='todo';UI.more=false;UI.fuMore=false;
  if(location.hash!=='#handover')location.hash='handover';
  render();window.scrollTo(0,0);toast('Selamat datang, '+n);
}
function copyText(t,okMsg){const fail=()=>toast('Gagal menyalin, salin manual ya');try{navigator.clipboard.writeText(t).then(()=>toast(okMsg),fail);}catch(e){fail();}}

const auMsg=()=>AU.err?`<div class="au-msg err" role="alert">${ic('alert',16)}<span>${esc(AU.err)}</span></div>`:AU.ok?`<div class="au-msg ok">${ic('check',16)}<span>${esc(AU.ok)}</span></div>`:AU.info?`<div class="au-msg info">${ic('info',16)}<span>${esc(AU.info)}</span></div>`:'';
function whoBox(n){const u=S.auth.users[n];return `<div class="who">${av(n)}<div><b>${esc(FULL[n]||n)}</b><small>${esc(u.username)}</small></div><button class="link" type="button" data-act="au-back">Ganti akun</button></div>`;}
const demoCode=()=>`<details class="demo-code"><summary>${ic('phone',15)}Nggak pegang HP? Lihat kode demo</summary><div class="dc"><b class="num" id="demo-code">··· ···</b><span id="demo-left"></span></div><p class="note-h">Cuma ada di prototype, supaya bisa dicoba tanpa scan QR.</p></details>`;
const otpInput=()=>`<input type="text" id="otp" class="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="······" aria-label="Kode 6 digit" data-focus>`;
function authCred(cur,nk){
  const tag=n=>{const d=deskOf(n,cur);if(d)return [0,'HP '+d+' · bertugas'];const t=DESK_ORDER.find(x=>{const h=S.handovers[cur+'|'+x];return h?h.to.includes(n):rosterFor(nk,x)===n;});return t?[1,'HP '+t+' · berikutnya']:[2,''];};
  const list=TEAM.map(n=>[n,...tag(n)]).sort((a,b)=>a[1]-b[1]);
  return `<div class="au-head"><h2>Masuk</h2><p>Pakai username dan password akun kantor.</p></div>${auMsg()}
   <form id="login-form" class="au-form" autocomplete="off" novalidate>
    <label class="fl"><span>Username</span><input type="text" id="l-user" value="${esc(AU.prefill)}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="nama.belakang" ${AU.prefill?'':'data-focus'}></label>
    <label class="fl"><span>Password</span><span class="pw"><input type="password" id="l-pass" autocomplete="off" placeholder="Password" ${AU.prefill?'data-focus':''}><button type="button" class="eye" data-act="pw-eye" aria-label="Tampilkan password">${ic('eye',17)}</button></span></label>
    <div class="demo-note">${ic('info',16)}<span><b>Mode demo.</b> Password semua akun: <code>demo</code>. Jangan isi password kantor asli, halaman ini tidak tersambung ke LDAP.</span></div>
    <button class="btn primary block" type="submit">Lanjut${ic('arrow',17)}</button></form>
   <div class="au-demo"><span class="au-lbl">Akun demo (klik untuk isi otomatis)</span><div class="pchips">${list.map(([n,o,t])=>{const u=S.auth.users[n];return `<button type="button" class="pchip ${u.active?'':'off'}" data-pick="${n}" title="${esc(FULL[n])} · ${esc(u.username)}">${av(n,'sm')}${esc(n)}${t?`<small>${t}</small>`:''}${u.role==='admin'?'<small class="adm">Admin</small>':''}</button>`;}).join('')}</div></div>`;
}
function authMfa(){
  const n=AU.user;
  if(AU.backup)return `<div class="au-head"><h2>Kode cadangan</h2><p>Pakai salah satu kode cadangan yang kamu simpan waktu daftar authenticator. Tiap kode cuma bisa dipakai sekali.</p></div>${whoBox(n)}${auMsg()}
    <form id="backup-form" class="au-form"><input type="text" id="bk" class="otp bk" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX" maxlength="9" aria-label="Kode cadangan" data-focus><button class="btn primary block" type="submit">Verifikasi</button></form>
    <div class="au-links"><button class="link" type="button" data-act="au-backup">Pakai kode authenticator</button></div>`;
  return `<div class="au-head"><h2>Verifikasi 2 langkah</h2><p>Buka aplikasi authenticator di HP, lalu masukkan kode 6 digit untuk <b>Handover Ops</b>.</p></div>${whoBox(n)}${auMsg()}
   <form id="otp-form" class="au-form">${otpInput()}<button class="btn primary block" type="submit">Verifikasi</button></form>
   <div class="au-links"><button class="link" type="button" data-act="au-backup">HP hilang? Pakai kode cadangan</button></div>${demoCode()}`;
}
function authEnroll(){
  const n=AU.user;const key=AU.enroll.secret.match(/.{1,4}/g).join(' ');
  return `<div class="au-head"><h2>Aktifkan authenticator</h2><p>Cukup sekali. Setelah ini, setiap login minta kode dari HP kamu.</p></div>${whoBox(n)}${auMsg()}
   <ol class="enroll">
    <li><div><b>Pasang aplikasi authenticator</b><span>Misalnya Google Authenticator, Microsoft Authenticator, atau yang dipakai kantor.</span></div></li>
    <li><div><b>Scan QR ini dari aplikasi</b><div class="qrbox" id="qr"><span class="note-h">QR tidak bisa dimuat. Pakai kunci di bawah.</span></div><span>Nggak bisa scan? Masukkan kunci ini secara manual:</span><code class="key">${key}</code><button class="link" type="button" data-act="copy-key">Salin kunci</button></div></li>
    <li><div><b>Masukkan kode 6 digit</b><span>Kode yang muncul di aplikasi untuk Handover Ops.</span><form id="enroll-form" class="au-form">${otpInput()}<button class="btn primary block" type="submit">Aktifkan</button></form></div></li>
   </ol>${demoCode()}`;
}
function authCodes(){
  return `<div class="au-head"><h2>Simpan kode cadangan</h2><p>Kalau HP hilang atau ganti, kode ini dipakai untuk masuk. Tiap kode cuma bisa dipakai sekali.</p></div>${auMsg()}
   <div class="codes num">${AU.codes.map(c=>`<span>${c.slice(0,4)}-${c.slice(4)}</span>`).join('')}</div>
   <div class="au-links"><button class="link" type="button" data-act="copy-codes">Salin semua kode</button></div>
   <button class="btn primary block" type="button" data-act="au-done">Sudah saya simpan, lanjut${ic('arrow',17)}</button>`;
}
function drawQr(){
  const box=document.getElementById('qr');if(!box||typeof QRCode==='undefined'||!AU.enroll)return;
  const u=S.auth.users[AU.user];const iss=encodeURIComponent('Handover Ops');
  const uri=`otpauth://totp/${iss}:${encodeURIComponent(u.username)}?secret=${AU.enroll.secret}&issuer=${iss}&algorithm=SHA1&digits=6&period=30`;
  box.innerHTML='';try{new QRCode(box,{text:uri,width:168,height:168,colorDark:'#0A1A31',colorLight:'#FFFFFF',correctLevel:QRCode.CorrectLevel.M});box.removeAttribute('title');}catch(e){box.innerHTML='<span class="note-h">QR tidak bisa dimuat. Pakai kunci di bawah.</span>';}
}
let demoT=null;
function tickDemo(){
  clearInterval(demoT);if(!document.getElementById('demo-code'))return;
  const run=()=>{const el=document.getElementById('demo-code');if(!el){clearInterval(demoT);return;}
    const u=AU.user&&S.auth.users[AU.user];const sec=AU.step==='enroll'&&AU.enroll?AU.enroll.secret:(u&&u.mfa?u.mfa.secret:null);if(!sec)return;
    totpAt(sec,Math.floor(Date.now()/30000)).then(c=>{el.textContent=c.slice(0,3)+' '+c.slice(3);});
    const l=document.getElementById('demo-left');if(l)l.textContent='ganti dalam '+(30-Math.floor(Date.now()/1000)%30)+' dtk';};
  run();demoT=setInterval(run,1000);
}
function renderAuth(){
  const el=document.getElementById('auth');el.hidden=false;document.body.classList.remove('desk-AB');
  const cur=currentKey(),sid=sidOf(cur),nk=nextKey(cur);const d=new Date(S.now);
  const pct=((((d.getHours()-6+24)%24)+d.getMinutes()/60)/24*100).toFixed(1);const cr=shiftRange(cur);
  const duty=DESK_ORDER.map(dk=>{const h=S.handovers[cur+'|'+dk];const f=h?h.from[0]:rosterFor(cur,dk);const t=h?h.to[0]:rosterFor(nk,dk);
    return `<div class="rn"><span class="rn-hp"><span class="hpdot ${dk}"></span>${DESKS[dk].phone}</span><span class="rn-who">${av(f,'sm')}<b>${esc(FULL[f]||f)}</b></span><span class="rn-next">${fmtTime(cr.end)}<b>${esc(t)}</b></span></div>`;}).join('');
  const s2=AU.step!=='cred';
  const body=AU.step==='mfa'?authMfa():AU.step==='enroll'?authEnroll():AU.step==='codes'?authCodes():authCred(cur,nk);
  el.innerHTML=`
   <aside class="au-side" style="--sc:var(--sh-${sid.toLowerCase()})">
    <div class="au-bar"><span class="brand">${MARK}<span class="word"><b>Handover</b><small>Ops Console</small></span></span><div class="dseg icons" role="group" aria-label="Tema">${themeBtns()}</div></div>
    <div class="au-board">
     <p class="au-date">${fmtDateL(S.now)}</p>
     <p class="au-clock">${fmtTime(S.now)}</p>
     <p class="au-shift"><i></i><b>Shift ${SHIFT[sid].name}</b><span>${SHIFT[sid].label} · selesai ${dur(cr.end-S.now)} lagi</span></p>
     <div class="track" aria-hidden="true"><div class="track-bar">${['P','S','M'].map(s=>`<i class="${s===sid?'on':''}"></i>`).join('')}<b style="left:${pct}%"></b></div>
      <div class="track-l">${['P','S','M'].map(s=>`<span class="${s===sid?'on':''}"><b>${SHIFT[s].name}</b>${SHIFT[s].label}</span>`).join('')}</div></div>
     <div class="roster-now"><div class="rn rn-h"><span>HP</span><span>Bertugas</span><span>Berikutnya</span></div>${duty}</div>
    </div>
    <p class="au-fine">Akses khusus tim Ops. Login dan serah terima tercatat atas nama masing-masing.</p>
   </aside>
   <div class="au-main"><div class="au-card">
     <ol class="au-steps"><li class="${s2?'ok':'on'}">1. Akun kantor</li><li class="${s2?'on':''}">2. Authenticator</li></ol>
     ${body}</div>
    <p class="au-foot">${ONLINE?'Prototype: tidak tersambung ke LDAP (password semua akun <b>demo</b>). Data tersimpan online dan dipakai bersama tim.':'Prototype: tidak tersambung ke LDAP, semua data hanya di browser ini. <button class="link" data-act="reset">Reset data demo</button>'}</p></div>`;
  if(AU.step==='enroll')drawQr();
  const f=el.querySelector('[data-focus]');if(f)setTimeout(()=>{try{f.focus({preventScroll:true});}catch(e){}},30);
  tickDemo();playEnter('auth|'+AU.step+'|'+(AU.backup?1:0),['auth']);
}

/* ---------- admin ---------- */
const AD={tab:'jadwal',week:0,af:'all'};
const EV={login:['done','key'],logout:['hold','logout'],timeout:['hold','clock'],login_fail:['over','x'],mfa_fail:['over','x'],lock:['over','lock'],unlock:['rem','lock'],mfa_enroll:['wait','shield'],mfa_reset:['rem','shield'],backup:['fu','key'],submit:['wait','arrow'],accept:['done','check'],roster:['rem','calendar'],role:['rem','users'],active:['rem','users'],settings:['rem','settings'],force:['over','logout'],mt_add:['wait','wrench'],mt_edit:['rem','wrench'],mt_del:['over','x'],mt_done:['done','check'],report:['wait','file']};
const CATL={auth:'Login',handover:'Serah terima',maint:'Maintenance',admin:'Admin'};
function weekStartOf(ms){const d=new Date(ms);const b=new Date(d.getFullYear(),d.getMonth(),d.getDate());b.setDate(b.getDate()-((b.getDay()+6)%7));return b;}
function weekDays(){const ws=weekStartOf(shiftRange(currentKey()).start);ws.setDate(ws.getDate()+AD.week*7);return [0,1,2,3,4,5,6].map(i=>{const d=new Date(ws);d.setDate(d.getDate()+i);return d;});}
function whoAt(sk,d){const h=S.handovers[sk+'|'+d];if(h)return h.from[0];const p=S.handovers[prevKey(sk)+'|'+d];return p&&p.to[0]?p.to[0]:rosterFor(sk,d);}
function slotLocked(sk,d){const ph=S.handovers[prevKey(sk)+'|'+d];return shiftRange(sk).start<=S.now||!!(ph&&ph.status!=='draft');}
function setRoster(sk,d,n){const k=sk+'|'+d;if(n===rosterBase(sk,d))delete S.roster[k];else S.roster[k]=n;const p=S.handovers[prevKey(sk)+'|'+d];if(p&&p.status==='draft')p.to=[n];}
function rosterResetWeek(){
  let c=0;weekDays().forEach(d=>['P','S','M'].forEach(sid=>{const sk=ymd(d)+'-'+sid;DESK_ORDER.forEach(dk=>{if(slotLocked(sk,dk))return;const b=rosterBase(sk,dk);if(whoAt(sk,dk)!==b||S.roster[sk+'|'+dk]){setRoster(sk,dk,b);c++;}});}));
  if(c)audit('admin','roster',`Jadwal minggu ${fmtDate(weekDays()[0].getTime())} dikembalikan ke rotasi (${c} slot)`);
  save();render();toast(c?c+' slot dikembalikan ke rotasi':'Jadwal sudah sesuai rotasi');
}
function admRoster(){
  const cur=currentKey();const days=weekDays();const SIDS=['P','S','M'];const counts=Object.fromEntries(TEAM.map(n=>[n,0]));let bad=0,warn=0;
  const todayYmd=ymd(new Date(shiftRange(cur).start));
  const rows=days.map(d=>{const ds=ymd(d);
    const cells=SIDS.map(sid=>{const sk=ds+'-'+sid;const pair=DESK_ORDER.map(dk=>whoAt(sk,dk));const prev=DESK_ORDER.map(dk=>whoAt(prevKey(sk),dk));const isBad=pair[0]===pair[1];if(isBad)bad++;
      return DESK_ORDER.map((dk,di)=>{const n=pair[di];counts[n]=(counts[n]||0)+1;const isWarn=!isBad&&prev.includes(n);if(isWarn)warn++;
        const lbl=`${DESKS[dk].phone}, Shift ${SHIFT[sid].name} ${fmtDate(d.getTime())}`;
        const inner=slotLocked(sk,dk)?`<div class="rlock" title="${esc(FULL[n]||n)} (terkunci)">${av(n,'sm')}${esc(n)}</div>`:`<select class="rsel ${S.roster[sk+'|'+dk]?'ov':''}" data-roster="${sk}|${dk}" aria-label="${esc(lbl)}">${TEAM.map(t=>`<option value="${t}" ${t===n?'selected':''}>${t}</option>`).join('')}</select>`;
        return `<td class="rcell ${isBad?'bad':isWarn?'warn':''} ${sk===cur?'now':''}" ${isBad?'title="1 orang pegang 2 HP"':isWarn?'title="Shift beruntun tanpa jeda"':''}>${inner}</td>`;}).join('');}).join('');
    return `<tr class="${ds===todayYmd?'today':''}"><td class="day">${DAYS[d.getDay()]} ${d.getDate()}<small>${MONS[d.getMonth()]}${ds===todayYmd?' · hari ini':''}</small></td>${cells}</tr>`;}).join('');
  const wl=`${days[0].getDate()} ${MONS[days[0].getMonth()]} – ${days[6].getDate()} ${MONS[days[6].getMonth()]}`;
  const badges=(bad?`<span class="badge lock">${ic('alert',13)}${bad} shift bentrok</span>`:'')+(warn?`<span class="badge no">${ic('clock',13)}${warn} shift beruntun</span>`:'')+(!bad&&!warn?`<span class="badge ok">${ic('check',13)}Jadwal aman</span>`:'');
  return `<section class="card" style="margin-bottom:24px"><header class="card-h"><h2>Jadwal shift</h2><span class="wknav"><button class="x" data-week="-1" aria-label="Minggu sebelumnya">${ic('chevl',18)}</button><span>${wl}</span><button class="x" data-week="1" aria-label="Minggu berikutnya">${ic('chevr',18)}</button></span></header>
   <div class="rs-bar">${badges}<span class="rs-note">1 orang 1 HP per shift. Shift yang sudah mulai atau sudah diserahkan dikunci.</span>${AD.week!==0?'<button class="btn sm" data-week="0">Minggu ini</button>':''}<button class="btn sm" data-act="roster-reset">Kembalikan ke rotasi</button></div>
   <div class="tbl-wrap"><table class="roster"><thead><tr><th rowspan="2">Tanggal</th>${SIDS.map(sid=>`<th colspan="2" class="grp"><span style="color:var(--sh-${sid.toLowerCase()})">${ic(SHIFT[sid].icon,15)}</span>${SHIFT[sid].name} <span style="color:var(--muted);font-weight:500">${SHIFT[sid].label}</span></th>`).join('')}</tr>
    <tr>${SIDS.map(()=>DESK_ORDER.map(dk=>`<th>${DESKS[dk].phone}</th>`).join('')).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
   <div class="legend"><span><i class="ov"></i>Diubah admin</span><span><i class="bad"></i>1 orang pegang 2 HP</span><span><i class="warn"></i>Shift beruntun tanpa jeda</span><span><i class="lk"></i>Terkunci</span></div></section>
   ${cardBox('Jumlah shift minggu ini',null,`<div class="card-b pad"><div class="wk">${TEAM.map(n=>`<div class="wk-i">${av(n,'sm')}<span>${esc(n)}</span><b>${counts[n]}</b></div>`).join('')}</div></div>`,'Per orang')}`;
}
function admMembers(){
  const me=S.me;const en=TEAM.filter(n=>S.auth.users[n].mfa).length;
  const rows=TEAM.map(n=>{const u=S.auth.users[n];const locked=u.lockedUntil>Date.now();
    return `<div class="mem ${u.active?'':'off'}"><div class="mem-n">${av(n)}<div><b>${esc(FULL[n])}${n===me?' <span class="chip">Kamu</span>':''}</b><small>${esc(u.username)} · ${u.lastLogin?'login terakhir '+shortWhen(u.lastLogin):'belum pernah login'}</small>
      <label class="mem-m" title="Nama yang di-tag di laporan atasan"><span>Di chat @</span><input type="text" data-mention="${esc(n)}" value="${esc(mention(n))}" aria-label="Nama ${esc(n)} di chat"></label></div></div>
     <select class="rsel" data-role="${n}" aria-label="Peran ${esc(n)}"><option value="member" ${u.role==='member'?'selected':''}>Anggota</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select>
     <div class="mem-b">${u.mfa?`<span class="badge ok">${ic('shield',13)}Authenticator aktif</span>`:`<span class="badge no">${ic('shield',13)}Belum daftar</span>`}${locked?`<span class="badge lock">${ic('lock',13)}Terkunci</span>`:''}${u.active?'':'<span class="badge">Nonaktif</span>'}</div>
     <div class="mem-a">${locked?`<button class="btn sm" data-unlock="${n}">Buka kunci</button>`:''}${u.mfa?`<button class="btn sm" data-mfareset="${n}">Reset authenticator</button>`:''}<label class="sw" title="${n===me?'Tidak bisa menonaktifkan akun sendiri':'Akses ke aplikasi'}"><input type="checkbox" data-active="${n}" ${u.active?'checked':''} ${n===me?'disabled':''}><span>Aktif</span></label></div></div>`;}).join('');
  return `<div class="banner">${ic('info',16)}<span>Di versi asli, daftar ini mengikuti grup LDAP <b>OPS-HANDOVER</b>. Orang yang dikeluarkan dari grup otomatis tidak bisa login. Admin di sini mengatur peran, status akses, dan reset authenticator (misalnya HP hilang atau ganti).</span></div>
   ${cardBox('Anggota tim',TEAM.length,`<div class="card-b">${rows}</div>`,`${en}/${TEAM.length} authenticator aktif`)}`;
}
function admTpl(){
  const list=(sid,k)=>{const arr=S.tpl[sid][k];const nm=`shift ${SHIFT[sid].name} ${KIND_L[k].toLowerCase()}`;
    return `<div class="tpl-col"><div class="tpl-h">${ic(k==='work'?'calendar':'sun',15)}<b>${KIND_L[k]}</b><small>${k==='work'?'Senin–Jumat':'Sabtu, Minggu, libur'}</small><span class="count">${arr.length}</span></div>
     ${arr.map((x,i)=>`<div class="tpl"><span class="tpl-n">${i+1}</span>
      <input type="text" data-tplt="${sid}|${k}|${i}" value="${esc(x.t)}" aria-label="Task ${i+1} ${nm}">
      <button type="button" class="x" data-tpldel="${sid}|${k}|${i}" aria-label="Hapus task ${i+1} ${nm}">${ic('x',14)}</button>
      ${sid==='M'?`<label class="chk tpl-nb"><input type="checkbox" data-tplnb="${sid}|${k}|${i}" ${x.nb?'checked':''}>Hanya kalau besoknya hari kerja</label>`:''}</div>`).join('')||'<p class="none">Belum ada task.</p>'}
     <form class="add-row" data-tpladd="${sid}|${k}"><input type="text" placeholder="Tambah task" aria-label="Task baru ${nm}"><button class="btn sm" type="submit" style="height:40px">Tambah</button></form></div>`;};
  const col=sid=>`<section class="card"><header class="card-h"><h2>Shift ${{P:1,S:2,M:3}[sid]} · ${SHIFT[sid].name}</h2><span class="card-x">${SHIFT[sid].label}</span></header><div class="card-b pad"><div class="tpl-2">${list(sid,'work')}${list(sid,'off')}</div></div></section>`;
  const today=ymd(new Date(S.now));
  const hol=cardBox('Hari libur nasional & cuti bersama',S.holidays.length,`<div class="card-b">
     ${S.holidays.length?S.holidays.map((h,i)=>`<div class="tx static">${txIc(h.d<today?'hold':'rem','calendar')}<div class="tx-main"><span class="tx-t" style="cursor:default">${esc(h.n)}</span><span class="tx-s">${fmtDateL(T(h.d))}</span></div><div class="tx-end"><button class="x" data-holdel="${i}" aria-label="Hapus ${esc(h.n)}">${ic('x',14)}</button></div></div>`).join(''):'<p class="none">Belum ada.</p>'}
     <form id="hol-form" class="hol-form"><input type="date" id="hol-d" aria-label="Tanggal libur"><input type="text" id="hol-n" placeholder="Nama, contoh: Idul Fitri" aria-label="Nama hari libur"><button class="btn sm" type="submit" style="height:40px">Tambah</button></form>
     <p class="form-msg" id="hol-msg" style="margin-top:6px"></p></div>`);
  return `<div class="banner">${ic('info',16)}<span>Isi "Tasks performed" di laporan atasan diambil dari sini. Hari kerja = Senin–Jumat; weekend & tanggal merah = Sabtu, Minggu, dan tanggal di daftar libur bawah. Shift malam ikut tanggal mulainya (Sabtu 22:00 pakai weekend). Perubahan langsung berlaku ke laporan shift yang sedang berjalan.</span></div>
   <div class="col">${['P','S','M'].map(col).join('')}${hol}</div>`;
}
function admAudit(){
  const list=S.auth.audit.filter(a=>AD.af==='all'||a.cat===AD.af).slice().reverse().slice(0,200);
  let html='',last='';
  list.forEach(a=>{const day=fmtDateL(a.at);if(day!==last){if(last)html+='</div>';html+=`<div class="hist-d">${day}</div><div class="card-b" style="padding-top:0;padding-bottom:4px">`;last=day;}
    const [cls,icn]=EV[a.ev]||['hold','info'];
    html+=`<div class="tx static">${txIc(cls,icn)}<div class="tx-main"><span class="tx-t" style="cursor:default">${esc(a.text)}</span><span class="tx-s">${a.by?esc(FULL[a.by]||a.by):'Tidak dikenal'} · ${fmtTime(a.at)}</span></div><div class="tx-end"><span class="chip">${CATL[a.cat]||esc(a.cat)}</span></div></div>`;});
  if(last)html+='</div>';
  return `<section class="card" style="padding-bottom:10px">${html||'<div class="card-b"><p class="none">Belum ada catatan.</p></div>'}</section><p class="note-h" style="margin-top:12px">Di versi asli, audit log disimpan di server, tidak bisa diubah atau dihapus, dan bisa diekspor untuk keperluan audit.</p>`;
}
function admSecurity(){
  const s=S.auth.settings;const sel=(k,opts,suf)=>`<select class="inp set-sel" data-set="${k}">${opts.map(o=>`<option value="${o}" ${s[k]===o?'selected':''}>${o} ${suf}</option>`).join('')}</select>`;
  const en=TEAM.filter(n=>S.auth.users[n].mfa),notEn=TEAM.filter(n=>!S.auth.users[n].mfa);
  const row=(t,sub,ctl)=>`<div class="set"><div class="set-t"><b>${t}</b><small>${sub}</small></div>${ctl}</div>`;
  return `<div class="grid2"><div class="col">${cardBox('Kebijakan login',null,`<div class="card-b">
    ${row('Login akun kantor (LDAP)','Password dicek langsung ke server LDAP lewat LDAPS. Aplikasi tidak menyimpan password.','<span class="badge ok">Aktif</span>')}
    ${row('Verifikasi authenticator (TOTP)','Kode 6 digit dari aplikasi authenticator, berganti tiap 30 detik. Akun yang belum daftar diminta mendaftar saat login.','<span class="badge ok">Wajib</span>')}
    ${row('Logout otomatis kalau tidak aktif','Sesi ditutup kalau tidak ada klik atau ketikan.',sel('idle',[15,30,60],'menit'))}
    ${row('Batas gagal login','Password atau kode authenticator salah berturut-turut.',sel('maxFail',[3,5,10],'kali'))}
    ${row('Lama akun dikunci','Admin bisa membuka kunci lebih cepat di tab Anggota.',sel('lockMin',[15,30,60],'menit'))}
    ${row('Logout saat pergantian shift','Petugas shift berikutnya wajib masuk pakai akunnya sendiri.','<span class="badge ok">Aktif</span>')}</div>`)}</div>
   <div class="col">${cardBox('Authenticator tim',null,`<div class="card-b pad"><div class="big num">${en.length}/${TEAM.length}<small>sudah aktif</small></div><div class="bar"><i style="width:${Math.round(en.length/TEAM.length*100)}%"></i></div>
     ${notEn.length?`<div class="plist">${notEn.map(n=>`<div>${av(n,'sm')}${esc(FULL[n])}<small>belum daftar</small></div>`).join('')}</div>`:'<p class="none">Semua anggota sudah pakai authenticator.</p>'}</div>`)}
    ${cardBox('Sesi aktif',null,`<div class="card-b pad"><p style="color:var(--ink-2);font-size:14px;margin-bottom:14px">Keluarkan semua akun yang sedang login, misalnya kalau ada laptop atau HP yang hilang. Semua orang harus login ulang, termasuk kamu.</p><button class="btn" data-act="force-logout">${ic('logout',16)}Keluarkan semua sesi</button></div>`)}</div></div>`;
}
function renderAdmin(band,v){
  if(!isAdmin()){band.innerHTML=`<div class="hero-top"><div><p class="hello">Admin</p><h1 class="h-w">Khusus admin</h1><p class="sub-w">Akun kamu tidak punya akses ke halaman ini.</p></div></div>`;
    v.innerHTML=cardBox('Akses ditolak',null,'<div class="card-b pad"><p class="none">Minta admin tim untuk mengubah peran akun kamu.</p></div>');return;}
  const tabs=[['jadwal','Jadwal','calendar'],['anggota','Anggota','users'],['laporan','Template laporan','file'],['audit','Audit log','list'],['keamanan','Keamanan','shield']];
  const right=AD.tab==='audit'?`<div class="dseg adm-tabs" role="group" aria-label="Filter audit">${[['all','Semua'],['auth','Login'],['handover','Serah terima'],['maint','Maintenance'],['admin','Admin']].map(([k,l])=>`<button data-af="${k}" aria-pressed="${AD.af===k}">${l}</button>`).join('')}</div>`:'';
  band.innerHTML=`<div class="hero-top"><div><p class="hello">Admin · ${esc(S.me)}</p><h1 class="h-w">Pengaturan tim</h1><p class="sub-w">Jadwal shift, akses akun, dan jejak aktivitas.</p></div>${right}</div>
   <div class="dseg adm-tabs" role="group" aria-label="Bagian admin">${tabs.map(([k,l,i])=>`<button data-adtab="${k}" aria-pressed="${AD.tab===k}">${ic(i,15)}${l}</button>`).join('')}</div>`;
  v.innerHTML=AD.tab==='jadwal'?admRoster():AD.tab==='anggota'?admMembers():AD.tab==='laporan'?admTpl():AD.tab==='audit'?admAudit():admSecurity();
}

/* ---------- maintenance ---------- */
function hm(ms){const m=Math.max(0,Math.round(ms/60000));const h=Math.floor(m/60),mm=m%60;return h?h+' jam'+(mm?' '+mm+' mnt':''):mm+' mnt';}
function rangeText(w){const a=fmtDate(w.start),b=fmtDate(w.end);return a===b?`${a}, ${fmtTime(w.start)}–${fmtTime(w.end)}`:`${a} ${fmtTime(w.start)} – ${b} ${fmtTime(w.end)}`;}
const mWin=()=>{const out=[];(S.maint||[]).forEach(m=>m.windows.forEach((w,wi)=>out.push({m,w,wi})));return out;};
const wState=w=>S.now<w.start?'up':S.now<w.end?'on':'end';
/* Pengingat: tindakan awal muncul 3 jam sebelum mulai sampai selesai; tindakan akhir muncul setelah selesai */
function mDue(){const out=[];
  mWin().forEach(x=>{const {m,w}=x;const st=wState(w);
    if(m.action&&!w.startDone&&st!=='end'&&w.start-S.now<=SOON)out.push(Object.assign({kind:'start',at:w.start},x));
    if(m.actionEnd&&!w.endDone&&st==='end')out.push(Object.assign({kind:'end',at:w.end},x));});
  return out.sort((a,b)=>a.at-b.at);}
function dueRow(x){const {m,w,wi,kind}=x;const st=wState(w);
  const when=kind==='end'?`Selesai ${shortWhen(w.end)}`:st==='on'?`Sedang berlangsung, selesai ${fmtTime(w.end)}`:`Mulai ${shortWhen(w.start)} · ${hm(w.start-S.now)} lagi`;
  return `<div class="due">${txIc(kind==='end'?'done':st==='on'?'wait':'fu',MCAT[m.cat].icon)}<div class="due-m"><b>${esc(w.who)} · ${esc(m.title)}</b><span>${esc(kind==='end'?m.actionEnd:m.action)}</span><small>${when}${m.impact?' · Dampak: '+esc(m.impact):''}</small></div><button class="btn sm primary" data-mw="${m.id}|${wi}|${kind}">${ic('check',14)}Sudah</button></div>`;}
function dueBox(due,limit,showEmpty){
  if(!due.length)return showEmpty?cardBox('Perlu tindakan',null,'<div class="card-b"><p class="none">Tidak ada yang perlu ditindak sekarang.</p></div>'):'';
  return `<section class="alert warn"><div class="alert-h">${ic('bell',18)}Pengingat maintenance<span class="count" style="margin-left:auto">${due.length}</span></div>${due.slice(0,limit).map(dueRow).join('')}${due.length>limit?`<a class="more-btn" href="#maint" style="text-align:center;text-decoration:none">Lihat ${due.length-limit} lainnya</a>`:''}</section>`;}
function mRow(x){const {m,w,wi}=x;const st=wState(w);const soon=st==='up'&&w.start-S.now<=SOON;
  const pill=st==='on'?'<span class="mpill on">Berlangsung</span>':st==='end'?'<span class="mpill end">Selesai</span>':`<span class="mpill ${soon?'soon':''}">${w.start-S.now<24*3600e3?hm(w.start-S.now)+' lagi':fmtDate(w.start)}</span>`;
  const done=[[m.action,w.startDone,'start'],[m.actionEnd,w.endDone,'end']].filter(([a,d])=>a&&d).map(([a,d,k])=>`<button class="mdone" data-mw="${m.id}|${wi}|${k}" title="Sudah: ${esc(a)}. Klik untuk batalkan">${ic('check',13)}${esc(d.by)} ${fmtTime(d.at)}</button>`).join('');
  return `<div class="tx" data-mopen="${m.id}" role="button" tabindex="0">${txIc(st==='end'?'done':st==='on'?'wait':soon?'fu':'hold',MCAT[m.cat].icon)}<div class="tx-main"><span class="tx-t">${esc(w.who)}</span><span class="tx-s" title="${m.impact?'Dampak: '+esc(m.impact):''}">${rangeText(w)} · ${esc(m.title)}${m.impact?' · '+esc(m.impact):''}</span></div><div class="tx-end">${m.example?'<span class="chip">Contoh</span>':''}${done}${pill}</div></div>`;}
function toggleMw(key){const [id,wi,kind]=key.split('|');const m=S.maint.find(x=>x.id===id);if(!m)return;const w=m.windows[+wi];if(!w)return;const f=kind==='end'?'endDone':'startDone';
  if(w[f]){w[f]=null;audit('maint','mt_done',`Batal tandai: ${w.who} · ${m.title}`);save();render();toast('Tanda dibatalkan');return;}
  tick();w[f]={by:S.me,at:S.now};audit('maint','mt_done',`${w.who} · ${m.title}: ${kind==='end'?m.actionEnd:m.action}`);save();render();toast('Ditandai sudah ditindak');}
function renderMaint(band,v){
  const f=UI.mcat||'all',tab=UI.mtab||'up';
  const all=mWin().filter(x=>f==='all'||x.m.cat===f);
  const up=all.filter(x=>wState(x.w)!=='end').sort((a,b)=>a.w.start-b.w.start);
  const past=all.filter(x=>wState(x.w)==='end').sort((a,b)=>b.w.end-a.w.end);
  const due=mDue();
  band.innerHTML=`<div class="hero-top"><div><p class="hello">Pengingat dari broadcast</p><h1 class="h-w">Maintenance</h1><p class="sub-w">${due.length?due.length+' perlu tindakan · ':''}${up.length} jadwal akan datang atau berlangsung</p></div>
    <button class="btn-w" data-act="m-new">${ic('plus',17)}Tambah dari broadcast</button></div>
   <div class="dseg mcats" role="group" aria-label="Kategori">${[['all','Semua']].concat(MCAT_ORDER.map(k=>[k,MCAT[k].label])).map(([k,l])=>`<button data-mcat="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div>`;
  const items=tab==='up'?up:past;let html='',last='';
  items.forEach(x=>{const day=fmtDateL(tab==='up'?x.w.start:x.w.end);if(day!==last){html+=`<div class="mday">${day}</div>`;last=day;}html+=mRow(x);});
  const list=`<section class="card"><header class="card-h tabs-h"><div class="seg" role="group" aria-label="Jadwal">${[['up','Akan datang',up.length],['past','Sudah lewat',past.length]].map(([k,l,n])=>`<button data-mtab="${k}" aria-pressed="${tab===k}">${l}<span>${n}</span></button>`).join('')}</div></header>
    <div class="card-b">${html||`<p class="none">${tab==='up'?'Belum ada jadwal. Tempel broadcast lewat tombol Tambah dari broadcast.':'Belum ada.'}</p>`}</div></section>`;
  const how=cardBox('Cara pakai',null,`<div class="card-b pad"><ol class="how">
    <li><span>Dapat broadcast maintenance, klik <b>Tambah dari broadcast</b> lalu tempel isinya.</span></li>
    <li><span>Bank, jadwal, dan status dibaca otomatis. Cek lagi, lalu simpan.</span></li>
    <li><span>Pengingat muncul di Serah terima 3 jam sebelum mulai. Klik <b>Sudah</b> setelah ditindak.</span></li>
    <li><span>Maintenance di sekitar shift otomatis masuk ke Laporan atasan.</span></li></ol></div>`);
  v.innerHTML=`<div class="grid2"><div class="col">${list}</div><div class="col">${dueBox(due,99,true)}${how}</div></div>`;
}
/* Baca broadcast: cari "Nama 17 November 2026 00:15 - 03:00" atau "... 23:00 - 17 November 2026 01:00", juga format 17/11/2026 dan 00.15 */
const MONX={jan:0,januari:0,january:0,feb:1,februari:1,february:1,mar:2,maret:2,march:2,apr:3,april:3,mei:4,may:4,jun:5,juni:5,june:5,jul:6,juli:6,july:6,agu:7,agt:7,agus:7,agustus:7,aug:7,august:7,sep:8,sept:8,september:8,okt:9,oktober:9,oct:9,october:9,nov:10,nop:10,november:10,nopember:10,des:11,desember:11,dec:11,december:11};
const DAYW=/(?:,?\s*(?:senin|selasa|rabu|kamis|jum'?at|sabtu|minggu|monday|tuesday|wednesday|thursday|friday|saturday|sunday))+[,\s]*$/i;
/* Nama perusahaan: "PT Bank Aladin Syariah Tbk" -> "Bank Aladin Syariah", "PT. Rintis Sejahtera" -> "Rintis Sejahtera" */
const ORG=/\bPT\.?\s+[A-Z][\w&.'\-]*(?:\s+(?:[A-Z][\w&.'\-]*|&))*/;
const shortOrg=s=>s.replace(/^PT\.?\s+/,'').replace(/\s*\(persero\)/i,'').replace(/\s+tbk\.?$/i,'').replace(/[.,]+$/,'').trim();
const KW=/\b(hari|tanggal|tgl|pukul|jam|waktu|date|time|periode|jadwal|pada|mulai)\b/gi;
const bare=s=>s.replace(DAYW,'').replace(KW,' ').replace(/[\s:\/,\-–|()]+/g,' ').trim();
const NOT_NAME=/maint|dear|hormat|reminder|messages|kepada|dari|perihal|terima kasih|demikian/i;
/* Kata yang dibuang dari nama bank/sistem: "Maintenance Jalin" -> "Jalin", "Switching ALTO maintenance on" -> "ALTO" */
const WHO_X=/\b(maintenance|maint|pemeliharaan|bi[\s-]?fast|switching|kegiatan|internal|network|jaringan|akan|dilaksanakan|melaksanakan|melakukan|on|from|at|pada|untuk|sampai|hingga|dengan|s\.?d)\b\.?/gi;
const whoClean=s=>bare(s).replace(WHO_X,' ').replace(/\b\d{1,2}\b/g,' ').replace(/\s+/g,' ').trim();
const MONW=Object.keys(MONX).sort((a,b)=>b.length-a.length).join('|');
const RNG='\\s*(?:-|–|s\\.?\\s?d\\.?|s\\/d|sampai(?:\\s+dengan)?|hingga)\\s*';
/* Tanggal: 2026-11-20 · 20/11/2026 · 20 November 2026 · 21-22 Nov 2026 (ambil hari pertama) · 17-Nov-2026 · November 25, 2026. Jam: 01:30, 01.30, 24:00 */
const TOK=new RegExp(['(\\d{4})-(\\d{1,2})-(\\d{1,2})','(\\d{1,2})[\\/.-](\\d{1,2})[\\/.-](\\d{4})',
  `(\\d{1,2})(?:${RNG}\\d{1,2})?[\\s-]+(${MONW})\\b\\.?(?:[,\\s-]+(\\d{4}))?`,`\\b(${MONW})\\b\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s+(\\d{4}))?`,
  '(\\d{1,2})[:.](\\d{2})(?!\\d)'].join('|'),'gi');
/* Tahun tidak ditulis: pakai tahun ini, kecuali tanggalnya sudah lewat jauh (broadcast Desember untuk Januari) */
const yGuess=(mo,d)=>{let y=new Date(S.now).getFullYear();if(new Date(y,mo,d).getTime()<S.now-60*864e5)y++;return y;};
const KV_WHO=/^(nama bank|bank|nama peserta|peserta|sistem|aplikasi|mitra|vendor|institusi|lembaga)\s*:\s*(.+)$/i;
function cleanTitle(s){s=s.replace(/\s+/g,' ').trim().replace(/^((pemberitahuan|informasi|info|jadwal|kegiatan|penundaan|rencana|pelaksanaan)\s+)+/i,'');
  const m=s.match(ORG);if(m)s=s.replace(m[0],shortOrg(m[0]));return (s.charAt(0).toUpperCase()+s.slice(1)).replace(/[:\s]+$/,'').slice(0,90);}
function parseBroadcast(txt){
  const res={cat:null,title:'',action:'',impact:'',windows:[]};const low=txt.toLowerCase();
  res.cat=/bi[\s-]?fast/.test(low)?'bifast':/switching|jalin|artajasa|rintis|atm bersama|\balto\b/.test(low)?'switching':/internal/.test(low)?'internal':null;
  let lastDate=null,lastName='',kvTitle='',kvWho='',lineTitle='',inImpact=false;const impact=[];
  const full=x=>x.replace(/\s+/g,' ').replace(/[.,]+$/,'').trim();
  txt.split(/\r?\n/).forEach(raw=>{
    const isBullet=/^\s*[-•*·]/.test(raw);
    const line=raw.trim().replace(/^(?:[-•*·>]+|\d+[.)])\s*/,'').replace(/\*/g,'').trim();if(!line){inImpact=false;return;}
    const st=line.match(/^status\s*:?\s*(.+)$/i);if(st){if(!res.action)res.action=st[1].trim();return;}
    const kv=line.match(/^(perihal|agenda|hal|subject|judul)\s*:\s*(.+)$/i);if(kv){if(!kvTitle&&/maint/i.test(kv[2]))kvTitle=kv[2];return;}
    const imp=line.match(/^(dampak|impact|layanan terdampak)\s*:?\s*(.*)$/i);if(imp){inImpact=true;if(imp[2].trim())impact.push(imp[2].trim());return;}
    if(inImpact){if(isBullet){impact.push(line);return;}inImpact=false;}
    const kw=line.match(KV_WHO);if(kw&&!/\d/.test(kw[2])){kvWho=full(kw[2]);return;}
    const toks=[];let m;TOK.lastIndex=0;
    while((m=TOK.exec(line))){let v=null;
      if(m[1])v=[+m[1],+m[2]-1,+m[3]];
      else if(m[4])v=[+m[6],+m[5]-1,+m[4]];
      else if(m[7]){const mo=MONX[m[8].toLowerCase()];v=[m[9]?+m[9]:yGuess(mo,+m[7]),mo,+m[7]];}
      else if(m[10]){const mo=MONX[m[10].toLowerCase()];v=[m[12]?+m[12]:yGuess(mo,+m[11]),mo,+m[11]];}
      else{const h=+m[13],mi=+m[14];if((h<24&&mi<60)||(h===24&&mi===0))toks.push({t:'t',i:m.index,v:[h,mi]});continue;}
      if(v[1]>=0&&v[1]<12&&v[2]>=1&&v[2]<=31)toks.push({t:'d',i:m.index,v});}
    if(!toks.length){if(!lineTitle&&/maint/i.test(line)&&line.length<=100)lineTitle=line;else lastName=line;return;}
    /* Jam sebelum tanggal ("pukul 00:15 - 03:00 tanggal 17 Nov") pakai tanggal di baris itu; kalau tidak ada, tanggal baris sebelumnya */
    const fd=toks.find(k=>k.t==='d');const times=[];let d=fd?fd.v:lastDate;
    toks.forEach(k=>{if(k.t==='d'){d=k.v;lastDate=k.v;}else if(d)times.push(new Date(d[0],d[1],d[2],k.v[0],k.v[1]).getTime());});
    const before=line.slice(0,toks[0].i);
    if(!lineTitle&&/^maint/i.test(before.trim())){const tt=bare(before);if(tt.length<=80&&whoClean(tt))lineTitle=tt;}
    if(times.length<2)return;
    /* Nama bank/sistem: nama PT sebelum tanggal, teks pendek sebelum tanggal, isian "Bank :", nama PT di baris itu, baris pendek sebelumnya, nama PT di mana saja */
    const ob=before.match(ORG);let who=ob?full(ob[0]):whoClean(before);
    if(!who||who.length>40||who.split(' ').length>6||NOT_NAME.test(who)){
      const o=line.match(ORG);const ln=whoClean(lastName);const oa=txt.match(ORG);
      const lt=whoClean(lineTitle);
      who=kvWho?kvWho:o?full(o[0]):ln&&ln.length<=40&&!NOT_NAME.test(ln)?ln:oa?full(oa[0]):lt&&lt.length<=40?lt:'';}
    let s=times[0],e=times[1];if(e<=s)e+=864e5;
    if(!res.windows.some(w=>w.who===who&&w.start===s&&w.end===e))res.windows.push({who:who.slice(0,60),start:s,end:e,startDone:null,endDone:null});
  });
  const t=kvTitle||lineTitle;
  /* BI-Fast digabung per jenis seperti di laporan: "Maintenance Internal Bifast" berisi daftar bank */
  if(res.cat==='bifast')res.title=/internal/i.test(t||txt)?'Maintenance Internal Bifast':'Maintenance Bifast';
  else if(t)res.title=cleanTitle(t);
  res.impact=impact.map(x=>x.replace(/[.;,]+$/,'')).filter(Boolean).join(', ');
  return res;
}
const isDefAct=(v,i)=>!v||MCAT_ORDER.some(k=>MDEF[k][i]===v);
const isDefTitle=t=>!t||/^maintenance( internal)? bifast$/i.test(t.trim())||MCAT_ORDER.some(k=>t==='Maintenance '+MCAT[k].label);
/* Jadwal yang sama persis (bank, mulai, selesai) dengan yang sudah tersimpan di kategori ini */
const wKey=w=>(w.who||'').trim().toLowerCase()+'|'+w.start+'|'+w.end;
const dupOf=(d,w)=>S.maint.find(m=>m.id!==d.id&&m.cat===d.cat&&m.windows.some(x=>wKey(x)===wKey(w)));
const mergeHtml=d=>{const mc=mergeCand(d);return mc?`<label class="chk merge"><input type="checkbox" id="mt-merge" ${d.merge!==false?'checked':''}><span>Gabung ke <b>${esc(mc.title)}</b> yang sudah ada (${mc.windows.length} jadwal). Di laporan atasan jadi satu nomor dengan daftar bank.</span></label>`:'';};
function openMaint(id){
  const m=id?S.maint.find(x=>x.id===id):null;
  UI.md=m?JSON.parse(JSON.stringify(m)):{id:null,cat:'bifast',title:'',windows:[{who:'',start:null,end:null,startDone:null,endDone:null}],action:MDEF.bifast[0],actionEnd:MDEF.bifast[1],impact:'',src:'',merge:true};
  UI.mdMsg='';renderMaintForm();if(!dlg.open)dlg.showModal();
  if(!id)setTimeout(()=>{const t=document.getElementById('mt-src');if(t)t.focus();},40);
}
/* Maintenance lain dengan kategori & judul sama yang belum selesai: jadwal baru bisa digabung ke situ */
const mergeCand=d=>d.id?null:S.maint.find(m=>m.cat===d.cat&&m.title.trim().toLowerCase()===(d.title||'').trim().toLowerCase()&&m.windows.some(w=>wState(w)!=='end'))||null;
function renderMaintForm(){const d=UI.md;
  dlg.innerHTML=`<div class="d-head"><div class="d-top"><span>Maintenance${d.id?' · '+esc(d.id):''}</span><button class="x" data-act="close" aria-label="Tutup">${ic('x',18)}</button></div><h2>${d.id?'Ubah maintenance':'Tambah maintenance'}</h2></div>
  <div class="d-body"><form id="mt-form" class="panel">
   <div class="fl"><span>Tempel broadcast</span><textarea id="mt-src" placeholder="Tempel isi broadcast di sini, lalu klik Baca otomatis">${esc(d.src)}</textarea>
    <div class="f-row"><button type="button" class="btn sm" data-act="m-parse">${ic('bolt',14)}Baca otomatis</button><span class="note-h" id="mt-pmsg">${esc(UI.mdMsg||'Bank, jadwal, dan status diisi dari teks. Cek lagi sebelum simpan.')}</span></div></div>
   <div class="fl"><span>Kategori</span><div class="sseg">${MCAT_ORDER.map(k=>`<button type="button" data-mcatset="${k}" aria-pressed="${d.cat===k}">${ic(MCAT[k].icon,15)}${MCAT[k].label}</button>`).join('')}</div></div>
   <div class="fl"><span>Judul</span><input type="text" id="mt-title" value="${esc(d.title)}" placeholder="Contoh: Maintenance Internal Bifast"></div>
   <div class="fl"><span>Jadwal</span><div class="mws">${d.windows.map((w,i)=>`<div class="mw"><input type="text" class="mw-who" id="mw-who-${i}" value="${esc(w.who)}" placeholder="Bank atau sistem, contoh: BRI" aria-label="Bank atau sistem">${d.windows.length>1?`<button type="button" class="x" data-mwdel="${i}" aria-label="Hapus jadwal">${ic('x',16)}</button>`:''}
     <label class="mwl"><small>Mulai</small><input type="datetime-local" id="mw-s-${i}" value="${toLocalInput(w.start)}"></label><label class="mwl"><small>Selesai</small><input type="datetime-local" id="mw-e-${i}" value="${toLocalInput(w.end)}"></label></div>`).join('')}</div>
    <div><button type="button" class="pillbtn" data-act="m-addwin">+ Tambah jadwal</button></div></div>
   <div class="fl"><span>Status / tindakan sebelum mulai</span><input type="text" id="mt-act" value="${esc(d.action)}" placeholder="Contoh: Please close the bifast"><p class="note-h" style="margin:0">Jadi pengingat 3 jam sebelum mulai, dan masuk ke laporan atasan sebagai Status.</p></div>
   <div class="fl"><span>Tindakan setelah selesai (opsional)</span><input type="text" id="mt-act2" value="${esc(d.actionEnd)}" placeholder="Contoh: Open BI-Fast lagi"></div>
   <div class="fl"><span>Dampak (opsional)</span><input type="text" id="mt-imp" value="${esc(d.impact||'')}" placeholder="Contoh: ATM, QRIS, Payment Gateway Biller"></div>
   <div id="mt-merge-box">${mergeHtml(d)}</div>
   <div class="f-act">${d.id?'<button type="button" class="btn" data-act="m-del">Hapus</button>':''}<span class="form-msg" id="mt-msg"></span><button class="btn primary" type="submit">Simpan</button></div>
  </form></div>`;}
function syncMD(){const d=UI.md;if(!d)return;const g=id=>{const el=document.getElementById(id);return el?el.value:null;};
  let x;if((x=g('mt-src'))!=null)d.src=x;if((x=g('mt-title'))!=null)d.title=x;if((x=g('mt-act'))!=null)d.action=x;if((x=g('mt-act2'))!=null)d.actionEnd=x;if((x=g('mt-imp'))!=null)d.impact=x;
  const mg=document.getElementById('mt-merge');if(mg)d.merge=!!mg.checked;
  d.windows.forEach((w,i)=>{if((x=g('mw-who-'+i))!=null)w.who=x.trim();if((x=g('mw-s-'+i))!=null)w.start=fromLocalInput(x);if((x=g('mw-e-'+i))!=null)w.end=fromLocalInput(x);});}
function mParse(){syncMD();const d=UI.md;
  if(!(d.src||'').trim()){UI.mdMsg='Tempel isi broadcast dulu.';return renderMaintForm();}
  const r=parseBroadcast(d.src);
  if(r.cat)d.cat=r.cat;
  if(r.title)d.title=r.title;else if(isDefTitle(d.title))d.title='Maintenance '+MCAT[d.cat].label;
  if(r.action)d.action=r.action;else if(isDefAct(d.action,0))d.action=MDEF[d.cat][0];
  if(isDefAct(d.actionEnd,1))d.actionEnd=MDEF[d.cat][1];
  if(r.impact)d.impact=r.impact;
  /* Saat mengubah maintenance lama, tanda "Sudah" pada jadwal yang sama tetap dipertahankan */
  if(r.windows.length)d.windows=r.windows.map(w=>{const o=d.windows.find(x=>x.start===w.start&&x.end===w.end&&(x.startDone||x.endDone));return o?Object.assign(w,{startDone:o.startDone,endDone:o.endDone}):w;});
  UI.mdMsg=r.windows.length?`Kebaca ${r.windows.length} jadwal: ${r.windows.map(w=>(w.who||'?')+' '+rangeText(w)).join('; ')}. Cek lagi sebelum simpan.`:'Jadwal belum kebaca, isi manual di bawah ya.';
  renderMaintForm();}
function saveMaint(){syncMD();const d=UI.md;if(!d)return;const msg=t=>{const el=document.getElementById('mt-msg');if(el)el.textContent=t;};
  d.title=(d.title||'').trim();if(!d.title)return msg('Judul wajib diisi.');
  let ws=d.windows.filter(w=>w.who||w.start||w.end);if(!ws.length)return msg('Isi minimal satu jadwal.');
  for(const w of ws){if(!w.start||!w.end)return msg('Isi tanggal & jam mulai dan selesai di setiap jadwal.');if(w.end<=w.start)return msg(`Jam selesai ${w.who||'jadwal'} harus setelah jam mulai.`);if(!w.who)w.who=d.title;}
  /* Buang jadwal dobel di form, lalu (untuk maintenance baru) yang sudah pernah disimpan dari broadcast yang sama */
  ws=ws.filter((w,i)=>ws.findIndex(x=>wKey(x)===wKey(w))===i);
  let skip=0;
  if(!d.id){const dups=ws.filter(w=>dupOf(d,w));if(dups.length===ws.length){const m0=dupOf(d,ws[0]);return msg(`Jadwal ini sudah tersimpan di ${m0.title} (${m0.id}). Tidak perlu ditambah lagi.`);}
    skip=dups.length;ws=ws.filter(w=>!dupOf(d,w));}
  ws.sort((a,b)=>a.start-b.start);
  const o={id:d.id,cat:d.cat,title:d.title,windows:ws,action:(d.action||'').trim(),actionEnd:(d.actionEnd||'').trim(),impact:(d.impact||'').trim(),src:d.src||'',example:!!d.example};
  tick();const sk=skip?` · ${skip} jadwal dobel dilewati`:'';
  const mc=mergeCand(d);const mgEl=document.getElementById('mt-merge');
  if(mc&&mgEl&&mgEl.checked){mc.windows.push(...ws);mc.windows.sort((a,b)=>a.start-b.start);if(!mc.action)mc.action=o.action;if(!mc.actionEnd)mc.actionEnd=o.actionEnd;
    if(o.impact&&!(mc.impact||'').includes(o.impact))mc.impact=[mc.impact,o.impact].filter(Boolean).join(', ');if(o.src)mc.src=[mc.src,o.src].filter(Boolean).join('\n\n---\n\n');
    audit('maint','mt_edit',`Tambah ${ws.length} jadwal ke ${mc.title}: ${ws.map(w=>w.who).join(', ')}`);UI.md=null;save();dlg.close();render();toast('Digabung ke '+mc.title+sk);return;}
  if(d.id){const i=S.maint.findIndex(x=>x.id===d.id);o.by=S.maint[i].by;o.at=S.maint[i].at;S.maint[i]=o;audit('maint','mt_edit','Ubah maintenance: '+o.title);}
  else{o.id='MT-'+(Math.max(0,...S.maint.map(x=>+x.id.split('-')[1]||0))+1);o.by=S.me;o.at=S.now;S.maint.push(o);audit('maint','mt_add',`Tambah maintenance: ${o.title} (${ws.length} jadwal)`);}
  UI.md=null;save();dlg.close();render();toast('Maintenance disimpan'+sk);}

/* ---------- laporan atasan ---------- */
const mention=n=>(S.mention&&S.mention[n])||MENTION0[n]||n;
const enDate=ms=>{const d=new Date(ms);return d.getDate()+' '+EN_MONS[d.getMonth()]+' '+d.getFullYear();};
const enDay=ms=>EN_DAYS[new Date(ms).getDay()]+', '+enDate(ms);
function winText(w){const a=enDate(w.start),b=enDate(w.end);return a===b?`${a}, ${fmtTime(w.start)} - ${fmtTime(w.end)}`:`${a}, ${fmtTime(w.start)} - ${b}, ${fmtTime(w.end)}`;}
/* ✅ kalau maintenance sudah lewat dan (kalau ada) sudah dibuka lagi; selain itu ⚠️ */
const wDone=(m,w)=>wState(w)==='end'&&(!m.actionEnd||!!w.endDone);
/* Hari kerja: bukan Sabtu/Minggu dan bukan tanggal libur dari admin */
function dayInfo(ds){const d=new Date(T(ds));const h=(S.holidays||[]).find(x=>x.d===ds);const dw=d.getDay();return {work:!h&&dw!==0&&dw!==6,why:h?h.n:dw===0?'Minggu':dw===6?'Sabtu':''};}
function shiftDays(sk){const r=shiftRange(sk);return {a:ymd(new Date(r.start)),b:ymd(new Date(r.start+864e5))};}
/* Template dipilih dari tanggal shift mulai (shift malam Sabtu = weekend). Pilihan manual di laporan bisa menimpanya. */
function dayKind(sk,rp){if(rp.day==='work'||rp.day==='off')return rp.day;return dayInfo(shiftDays(sk).a).work?'work':'off';}
const nbOk=(sk,rp)=>rp.day==='work'||dayInfo(shiftDays(sk).b).work;
const tplList=(sk,rp)=>(((S.tpl||tplSeed())[sidOf(sk)]||{})[dayKind(sk,rp)])||[];
const taskOn=(t,sk,rp)=>!t.nb||nbOk(sk,rp);
const tplTasks=(sk,rp)=>tplList(sk,rp).map(x=>({t:x.t,nb:!!x.nb,on:true}));
function ensureReport(sk){if(!S.reports)S.reports={};
  if(!S.reports[sk]){const p=S.reports[prevKey(sk)];S.reports[sk]={ongoing:p?p.ongoing.map(o=>Object.assign({},o)):[],resolved:[],mx:[],tasks:[],notes:'',day:'auto'};}
  syncTasks(sk,S.reports[sk]);return S.reports[sk];}
/* Task laporan selalu ikut template shift & jenis harinya (status centang tetap diingat). Task tambahan manual (custom) ditaruh di akhir. */
function syncTasks(sk,rp){const tpl=tplList(sk,rp);const old=rp.tasks||[];
  const out=tpl.map(x=>{const o=old.find(y=>!y.custom&&y.t===x.t);return {t:x.t,nb:!!x.nb,on:o?o.on!==false:true};});
  old.filter(y=>y.custom&&!tpl.some(x=>x.t===y.t)).forEach(y=>out.push(y));
  rp.tasks=out;}
/* Petugas dari serah terima kalau sudah ada, kalau belum dari jadwal (tidak membuat data serah terima baru) */
function dutyBase(sk){const cur=[],next=[];DESK_ORDER.forEach(d=>{const h=S.handovers[sk+'|'+d];cur.push([d,h&&h.from[0]||whoAt(sk,d)]);next.push([d,h&&h.to[0]||rosterFor(nextKey(sk),d)]);});return {cur,next};}
/* Pilihan manual di laporan (dropdown Petugas) menimpa jadwal: rp.duty = {cur:{UA:'Tegar'}, next:{AB:'Leo'}} */
function dutyOf(sk){const b=dutyBase(sk);const o=(S.reports&&S.reports[sk]&&S.reports[sk].duty)||{};
  const ap=(arr,k)=>arr.map(([d,n])=>[d,(o[k]&&TEAM.includes(o[k][d]))?o[k][d]:n]);return {cur:ap(b.cur,'cur'),next:ap(b.next,'next')};}
/* Laporan yang sedang dibuka: default shift sekarang, bisa pilih shift 1/2/3 dan tanggal lain */
const rpKey=()=>UI.rpKey||currentKey();
/* Maintenance yang masuk laporan: yang menyentuh shift ini sampai akhir shift berikutnya */
function repWins(m,sk){const r=shiftRange(sk),nr=shiftRange(nextKey(sk));return m.windows.filter(w=>w.end>r.start&&w.start<nr.end);}
function repMaint(sk){const first=m=>Math.min(...repWins(m,sk).map(w=>w.start));
  return (S.maint||[]).filter(m=>repWins(m,sk).length).sort((a,b)=>first(a)-first(b));}
function reportText(sk){
  const rp=ensureReport(sk);const r=shiftRange(sk);const sid=sidOf(sk);const d=new Date(r.start);const du=dutyOf(sk);
  const mt=repMaint(sk).filter(m=>!rp.mx.includes(m.id));
  const major=rp.ongoing.concat(rp.resolved).filter(o=>o.major).length;
  const tag=arr=>arr.map(([,n])=>'@'+mention(n)).join(' ');
  const inc=arr=>arr.length?arr.map((o,i)=>[`${i+1}. ${(o.title||'').trim()||'-'}`,(o.status||'').trim()?'Status : '+o.status.trim():null,(o.jira||'').trim()?'Jira Ticket : '+o.jira.trim():null].filter(Boolean).join('\n')).join('\n\n'):'-';
  const tasks=rp.tasks.filter(t=>t.on&&t.t.trim()&&taskOn(t,sk,rp));
  return ['SUMMARY REPORT:','',
    `📝 IT INCIDENT HANDOVER — SHIFT ${{P:1,S:2,M:3}[sid]}`,`⏰ ${SHIFT[sid].label}`,`📅 ${sid==='M'?enDay(r.start)+' - '+enDay(r.end):enDay(r.start)}`,'',
    `👤 Current On Duty : ${tag(du.cur)}`,`➡️ Next On Duty : ${tag(du.next)}`,'',
    '📊 Shift Summary',`* Ongoing Incident : ${rp.ongoing.length}`,`* Resolved Incident : ${rp.resolved.length}`,`* Maintenance Activity : ${mt.length}`,`* Major Incident : ${major}`,'',
    '❌ ONGOING INCIDENTS',inc(rp.ongoing),'',
    '✅ RESOLVED INCIDENTS',inc(rp.resolved),'',
    '⚠️ MAINTENANCE ACTIVITY',mt.length?mt.map((m,i)=>{const ws=repWins(m,sk);const all=ws.every(w=>wDone(m,w));
      return [`${i+1}. ${m.title}`,...ws.map(w=>`- ${w.who} at ${winText(w)} ${wDone(m,w)?'✅':'⚠️'}`),all?'Status: '+(m.cat==='bifast'?'Bifast already reopened':'Maintenance finished'):m.action?'Status: '+m.action:null].filter(Boolean).join('\n');}).join('\n\n'):'-','',
    '🛠️ TASKS PERFORMED DURING SHIFT',tasks.length?tasks.map((t,i)=>`${i+1}. ${t.t.trim()}`).join('\n'):'-','',
    '📌 NOTES FOR NEXT SHIFT',(rp.notes||'').trim()||'-'].join('\n');
}
function updatePreview(){const p=document.getElementById('rp-prev');if(p)p.textContent=reportText(rpKey());}
function renderReport(band,v){
  const sk=rpKey();const rp=ensureReport(sk);const sid=sidOf(sk);const r=shiftRange(sk);const du=dutyOf(sk);const mt=repMaint(sk);
  const cur=currentKey();const isCur=sk===cur;const day=shiftDays(sk).a;const di=dayInfo(day);const kind=dayKind(sk,rp);
  band.innerHTML=`<div class="hero-top"><div><p class="hello">${fmtDateL(r.start)} · ${di.work?'Hari kerja':'Libur'+(di.why&&!/^(Sabtu|Minggu)$/.test(di.why)?' ('+esc(di.why)+')':'')}${isCur?' · shift sekarang':''}</p><h1 class="h-w">Laporan ke atasan</h1><p class="sub-w">Gabungan HP UA dan HP AB. Teksnya langsung jadi selagi kamu mengisi.</p></div>
    <button class="btn-w" data-act="rp-copy">${ic('copy',17)}Salin teks</button></div>
   <div class="rp-bar"><div class="dseg" role="group" aria-label="Pilih shift">${['P','S','M'].map(s=>`<button data-rpshift="${s}" aria-pressed="${sid===s}">${ic(SHIFT[s].icon,15)}Shift ${{P:1,S:2,M:3}[s]} · ${SHIFT[s].name}</button>`).join('')}</div>
    <label class="rp-date">${ic('calendar',15)}<input type="date" id="rp-date" value="${day}" aria-label="Tanggal shift"></label>
    <span class="rp-kind">${ic(kind==='work'?'calendar':'sun',14)}Template ${kind==='work'?'weekdays':'weekend & tanggal merah'}</span>
    ${isCur?'':`<button class="btn-w ghost sm" data-act="rp-now">Kembali ke shift sekarang</button>`}</div>`;
  const base=dutyBase(sk);const ovr=rp.duty&&Object.values(rp.duty).some(x=>x&&Object.keys(x).length);
  const ppl=(arr,k)=>arr.map(([d,n],i)=>{const isB=base[k][i][1]===n;const opts=TEAM.filter(x=>x===n||S.auth.users[x].active);
    return `<label class="mn ${isB?'':'ov'}">${av(n,'sm')}<span class="mn-f"><small>${DESKS[d].phone}${isB?'':' · diganti'}</small>
      <select class="rsel" data-rpduty="${k}|${d}" aria-label="${k==='cur'?'Current':'Next'} on duty ${DESKS[d].phone}">${opts.map(x=>`<option value="${x}" ${x===n?'selected':''}>${esc(x)} · ${esc(FULL[x])}</option>`).join('')}</select>
      <small class="mn-at">@${esc(mention(n))}</small></span></label>`;}).join('');
  const people=cardBox('Petugas',null,`<div class="card-b pad"><div class="mn-row"><span class="mn-l">Current on duty</span>${ppl(du.cur,'cur')}</div><div class="mn-row"><span class="mn-l">Next on duty</span>${ppl(du.next,'next')}</div>
    <p class="note-h">Otomatis dari jadwal shift dan serah terima. Kalau ada tukar shift, pilih orangnya di sini.${ovr?` <button class="link" data-act="rp-duty-reset">Kembalikan sesuai jadwal</button>`:''} Nama @ di chat diatur di Admin → Anggota.</p></div>`);
  const incCard=(list,title)=>{const arr=rp[list];const other=list==='ongoing'?'Resolved':'Ongoing';
    return `<section class="card"><header class="card-h tabs-h"><h2>${title}</h2><span class="count">${arr.length}</span><span class="card-acts"><button class="btn sm" data-rppick="${list}">${ic('grid',14)}Ambil dari Issue</button><button class="btn sm" data-rpadd="${list}">${ic('plus',14)}Tambah</button></span></header>
     <div class="card-b">${arr.length?arr.map((o,i)=>`<div class="inc">
      <div class="inc-h"><span class="inc-n">${i+1}</span><input type="text" data-rp="${list}|${i}|title" value="${esc(o.title)}" placeholder="Judul incident" aria-label="Judul incident ${i+1}"><button type="button" class="x" data-rpdel="${list}|${i}" aria-label="Hapus incident ${i+1}">${ic('x',16)}</button></div>
      <textarea data-rp="${list}|${i}|status" placeholder="Status, contoh: still waiting for a fixing" aria-label="Status incident ${i+1}">${esc(o.status)}</textarea>
      <input type="text" data-rp="${list}|${i}|jira" value="${esc(o.jira)}" placeholder="Link Jira (opsional)" aria-label="Link Jira incident ${i+1}">
      <div class="inc-f"><label class="chk"><input type="checkbox" data-rpmajor="${list}|${i}" ${o.major?'checked':''}>Major incident</label><button type="button" class="link" data-rpmove="${list}|${i}">Pindah ke ${other}</button></div></div>`).join(''):'<p class="none">Kosong. Di teks akan tertulis tanda -</p>'}</div></section>`;};
  const nMt=mt.filter(m=>!rp.mx.includes(m.id)).length;
  const mtCard=`<section class="card"><header class="card-h"><h2>Maintenance activity</h2><span class="count">${nMt}</span><span class="card-x"><a href="#maint">Kelola jadwal</a></span></header><div class="card-b">${mt.length?mt.map(m=>`<label class="mx"><input type="checkbox" data-rpmx="${m.id}" ${rp.mx.includes(m.id)?'':'checked'}><div><b>${esc(m.title)}</b>${repWins(m,sk).map(w=>`<small>${esc(w.who)} · ${rangeText(w)}</small>`).join('')}${m.action?`<small>Status: ${esc(m.action)}</small>`:''}</div></label>`).join(''):'<p class="none">Tidak ada maintenance dari awal shift ini sampai akhir shift berikutnya.</p>'}</div></section>`;
  const vis=rp.tasks.map((t,i)=>[t,i]).filter(([t])=>taskOn(t,sk,rp));const off=rp.tasks.filter(t=>!taskOn(t,sk,rp));
  const nOn=vis.filter(([t])=>t.on).length;
  const {a:dA,b:dB}=shiftDays(sk);
  const lab=ds=>{const i=dayInfo(ds);const d=new Date(T(ds));return `${DAYS_L[d.getDay()]} ${d.getDate()} ${MONS[d.getMonth()]}: <b class="${i.work?'':'off'}">${i.work?'hari kerja':'libur'+(i.why&&!/^(Sabtu|Minggu)$/.test(i.why)?' ('+esc(i.why)+')':'')}</b>`;};
  const dayTxt=rp.day==='work'?'Dianggap <b>hari kerja</b> (diatur manual)':rp.day==='off'?'Dianggap <b class="off">hari libur</b> (diatur manual)':sid==='M'?lab(dA)+' · besok '+lab(dB):lab(dA);
  const taskCard=`<section class="card"><header class="card-h"><h2>Tasks performed</h2><span class="count">${nOn}</span><span class="card-x"><button class="link" data-act="rp-all">${nOn===vis.length&&nOn?'Kosongkan':'Centang semua'}</button></span></header>
    <div class="card-b"><div class="dayline"><span>${dayTxt}</span><div class="seg sm" role="group" aria-label="Jenis hari">${[['auto','Otomatis'],['work','Weekdays'],['off','Weekend & tanggal merah']].map(([k,l])=>`<button data-rpday="${k}" aria-pressed="${(rp.day||'auto')===k}">${l}</button>`).join('')}</div></div>
    <div class="tasks">${vis.map(([t,i])=>`<div class="task"><label class="chk"><input type="checkbox" data-rptask="${i}" ${t.on?'checked':''}>${esc(t.t)}</label>${t.custom?`<button type="button" class="x" data-rptdel="${i}" aria-label="Hapus task tambahan">${ic('x',14)}</button>`:''}</div>`).join('')}</div>
    ${off.length?`<p class="task-off">${ic('calendar',14)}<span>Dilewati karena besok bukan hari kerja: ${off.map(t=>esc(t.t)).join(', ')}</span></p>`:''}
    <form id="rp-task-form" class="add-row"><input type="text" id="rp-task" placeholder="Tambah task lain" aria-label="Task baru"><button class="btn sm" type="submit" style="height:40px">Tambah</button></form>
    <p class="note-h">Pakai template <b>Shift ${SHIFT[sid].name} · ${KIND_L[dayKind(sk,rp)].toLowerCase()}</b>. Task dari template tidak bisa dihapus di sini. Hapus centangnya kalau tidak dikerjakan; ubah daftarnya di Admin → Template laporan.${rp.tasks.some(t=>t.custom||!t.on)?` <button class="link" data-act="rp-tpl">Kembalikan seperti template</button>`:''}</p></div></section>`;
  const notes=cardBox('Notes for next shift',null,`<div class="card-b pad"><textarea id="rp-notes" placeholder="Kosongkan kalau tidak ada, nanti tertulis tanda -">${esc(rp.notes)}</textarea></div>`);
  const prev=`<section class="card sticky"><header class="card-h"><h2>Pratinjau chat</h2><span class="card-acts"><button class="btn sm primary" data-act="rp-copy">${ic('copy',14)}Salin</button></span></header><div class="card-b pad"><pre id="rp-prev" class="rp-prev">${esc(reportText(sk))}</pre><p class="note-h">Format SUMMARY REPORT, siap ditempel ke chat atasan.</p></div></section>`;
  v.innerHTML=`<div class="grid2"><div class="col">${people}${incCard('ongoing','Ongoing incidents')}${incCard('resolved','Resolved incidents')}${mtCard}${taskCard}${notes}</div><div class="col" style="align-self:stretch;align-content:start">${prev}</div></div>`;
}
function copyReport(){const sk=rpKey();const t=reportText(sk);audit('handover','report','Salin laporan atasan '+shiftShort(sk));save();
  const fb=()=>{const p=document.getElementById('rp-prev');if(p&&window.getSelection){const rg=document.createRange();rg.selectNodeContents(p);const s=getSelection();s.removeAllRanges();s.addRange(rg);}toast('Teks sudah diseleksi, tekan Ctrl+C');};
  try{navigator.clipboard.writeText(t).then(()=>toast('Laporan disalin, tinggal tempel di chat'),fb);}catch(e){fb();}}
function openPick(list){UI.pick=list;const sk=rpKey();const r=shiftRange(sk);const rp=ensureReport(sk);
  const have=new Set(rp.ongoing.concat(rp.resolved).map(o=>o.src).filter(Boolean));
  const cand=S.issues.filter(i=>i.type==='issue'&&(list==='ongoing'?i.status!=='done':i.status==='done'&&i.resolvedAt&&inR(i.resolvedAt,r))).sort((a,b)=>lastAt(b)-lastAt(a));
  dlg.innerHTML=`<div class="d-head"><div class="d-top"><span>Laporan atasan</span><button class="x" data-act="close" aria-label="Tutup">${ic('x',18)}</button></div><h2>Ambil dari Issue</h2></div>
   <div class="d-body"><form id="pick-form" class="panel"><p style="color:var(--muted);font-size:14px">${list==='ongoing'?'Issue yang masih open di HP UA dan HP AB.':'Issue yang selesai di shift ini.'} Status diisi dari update terakhir dan link Jira dari tiket, bisa diubah setelahnya.</p>
    <div class="picks">${cand.length?cand.map(i=>{const h=have.has(i.id);return `<label class="pick ${h?'off':''}"><input type="checkbox" value="${esc(i.id)}" ${h?'checked disabled':''}><div><b>${esc(i.title)}</b><small>${esc(i.id)} · ${i.desks.map(d=>DESKS[d].phone).join(' + ')} · ${h?'Sudah ada di laporan':STATUS[i.status].label}</small></div></label>`;}).join(''):'<p class="none">Tidak ada.</p>'}</div>
    <div class="f-act"><span class="form-msg" id="pk-msg"></span><button class="btn primary" type="submit">Tambahkan</button></div></form></div>`;
  if(!dlg.open)dlg.showModal();}
function addPicked(){const ids=[...document.querySelectorAll('#pick-form input[type=checkbox]:checked:not(:disabled)')].map(x=>x.value);
  if(!ids.length){document.getElementById('pk-msg').textContent='Pilih minimal satu issue.';return;}
  const rp=ensureReport(rpKey());
  ids.forEach(id=>{const i=find(id);if(!i)return;const j=i.tickets.find(t=>t.sys==='Jira');rp[UI.pick].push({title:i.title,status:lastU(i).text,jira:j?(j.url||j.id):'',major:false,src:i.id});});
  save();dlg.close();render();toast(ids.length+' incident ditambahkan');}
const rpRef=s=>{const [l,i,f]=s.split('|');const rp=ensureReport(rpKey());return {rp,l,i:+i,f,o:rp[l]&&rp[l][+i]};};

/* ---------- sinkron online (Supabase) ----------
   Data dipecah per baris di tabel handover_kv: issue:<id>, ho:<shift|HP>, mt:<id>, rp:<shift>, user:<nama>, audit:<id>, roster, meta.
   Setiap save() mengirim baris yang berubah saja. Perubahan dari orang lain masuk lewat Realtime dan langsung dirender.
   Yang tetap lokal per browser: sesi login, HP yang dipilih, tema. */
const resetLabel=()=>ONLINE?'Hapus semua data tim':'Reset data contoh';
const SYNC_TXT={connecting:'Menyambung ke database…',online:'Online · tersinkron realtime',retry:'Koneksi putus, mencoba lagi…',error:'Gagal tersambung ke database'};
function footSync(){
  const rb=document.getElementById('reset-btn');if(rb){rb.hidden=ONLINE&&!isAdmin();if(!UI.resetArm)rb.textContent=resetLabel();}
  const ft=document.querySelector('.foot span');
  if(ft&&ONLINE)ft.innerHTML=`<span class="sync ${SY.state}"><i></i>${SYNC_TXT[SY.state]||''}</span> Prototype: login disimulasikan (password <b>demo</b>), jam memakai waktu asli. Jangan isi data kerja sungguhan.`;}
function setSync(st,msg){SY.state=st;SY.msg=msg||'';footSync();if(!SY.ready)render();}
function syncScreen(){const err=SY.state==='error';
  return `<div class="sync-wait"><div class="card sync-card">${MARK}<h2>${err?'Database belum tersambung':'Menyiapkan data tim…'}</h2>
    <p>${err?'Cek isi <code>assets/config.js</code> (URL dan key Supabase), dan pastikan file <code>supabase/schema.sql</code> sudah dijalankan di SQL Editor Supabase.':'Mengambil data terbaru dari database.'}</p>
    ${err&&SY.msg?`<pre>${esc(SY.msg)}</pre>`:''}${err?'<button class="btn primary" data-act="sync-retry">Coba lagi</button>':'<span class="spin" aria-hidden="true"></span>'}</div></div>`;}
function flat(s){const o={};
  s.issues.forEach(i=>{o['issue:'+i.id]=i;});
  for(const k in s.handovers)o['ho:'+k]=s.handovers[k];
  s.maint.forEach(m=>{o['mt:'+m.id]=m;});
  for(const k in s.reports)o['rp:'+k]=s.reports[k];
  for(const k in s.auth.users)o['user:'+k]=s.auth.users[k];
  s.auth.audit.forEach((a,i)=>{if(!a.id)a.id=a.at.toString(36)+i.toString(36)+Math.random().toString(36).slice(2,5);o['audit:'+a.id]=a;});
  o.roster=s.roster;o.meta={settings:s.auth.settings,mention:s.mention,tpl:s.tpl,tplV:s.tplV,holidays:s.holidays};
  return o;}
function applyRow(k,d){const c=k.indexOf(':');const t=c<0?k:k.slice(0,c),id=c<0?'':k.slice(c+1);
  const arr=(list,f)=>{const i=list.findIndex(f);if(d==null){if(i>=0)list.splice(i,1);}else if(i>=0)list[i]=d;else list.push(d);};
  if(t==='issue')arr(S.issues,x=>x.id===id);
  else if(t==='mt')arr(S.maint,x=>x.id===id);
  else if(t==='audit')arr(S.auth.audit,x=>x.id===id);
  else if(t==='ho'){if(d==null)delete S.handovers[id];else S.handovers[id]=d;}
  else if(t==='rp'){if(d==null)delete S.reports[id];else S.reports[id]=d;}
  else if(t==='user'){if(d)S.auth.users[id]=d;}
  else if(t==='roster')S.roster=d||{};
  else if(t==='meta'&&d){S.auth.settings=d.settings||S.auth.settings;S.mention=d.mention||{};S.tpl=d.tpl;S.tplV=d.tplV;S.holidays=d.holidays||[];}}
const sortData=()=>{S.auth.audit.sort((a,b)=>a.at-b.at);S.maint.sort((a,b)=>(+a.id.split('-')[1]||0)-(+b.id.split('-')[1]||0));};
async function fetchRows(){const rows=[];
  for(let from=0;;from+=1000){const {data,error}=await SY.sb.from(TABLE).select('key,data').range(from,from+999);if(error)throw error;rows.push(...data);if(data.length<1000)break;}
  return rows;}
/* Ambil semua baris. Pertama kali: bangun data dari server (atau isi database kalau masih kosong). Setelah koneksi putus: samakan yang ketinggalan. */
async function pullAll(first){
  const rows=await fetchRows();
  if(first){const loc={session:S.session,me:S.me,desk:S.desk,viewShift:S.viewShift};
    if(!rows.length){S=Object.assign(freshData(),loc);S.now=Date.now();SY.snap={};SY.ready=true;await pushNow();return;}
    S=Object.assign({v:6,issues:[],handovers:{},roster:{},maint:[],reports:{},auth:{users:{},settings:{idle:30,maxFail:5,lockMin:15},audit:[]}},loc,{now:Date.now()});SY.snap={};
    rows.forEach(r=>{applyRow(r.key,r.data);SY.snap[r.key]=JSON.stringify(r.data);});
    migrate(S,true);sortData();if(S.session&&!S.auth.users[S.session.user])S.session=null;SY.ready=true;pushSoon();return;}
  const seen=new Set();let n=0;
  rows.forEach(r=>{seen.add(r.key);const j=JSON.stringify(r.data);if(SY.snap[r.key]!==j){SY.snap[r.key]=j;applyRow(r.key,r.data);n++;}});
  Object.keys(SY.snap).forEach(k=>{if(!seen.has(k)){delete SY.snap[k];applyRow(k,null);n++;}});
  if(n){sortData();remoteRender();}}
async function syncStart(){
  if(!(window.supabase&&window.supabase.createClient)){setSync('error','Library Supabase gagal dimuat (cek koneksi internet).');return;}
  // link dashboard (supabase.com/dashboard/project/<ref>/...) -> URL API (https://<ref>.supabase.co)
  const dash=/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i.exec(CFG.supabaseUrl);
  const url=dash?'https://'+dash[1]+'.supabase.co':String(CFG.supabaseUrl).trim().replace(/\/+(rest\/v1)?\/*$/,'');
  try{if(!SY.sb)SY.sb=window.supabase.createClient(url,CFG.supabaseKey,{auth:{persistSession:false,autoRefreshToken:false}});
    setSync('connecting');await pullAll(true);subscribe();SY.state='online';try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}render();}
  catch(e){console.error(e);setSync('error',(e&&(e.message||e.details))||String(e));}}
function subscribe(){
  SY.sb.channel('kv-'+SY.client).on('postgres_changes',{event:'*',schema:'public',table:TABLE},p=>{
    if(!SY.ready)return;
    if(p.eventType==='DELETE'){const k=p.old&&p.old.key;if(!k||!(k in SY.snap))return;delete SY.snap[k];applyRow(k,null);}
    else{const r=p.new;if(!r||r.client===SY.client)return;const j=JSON.stringify(r.data);if(SY.snap[r.key]===j)return;SY.snap[r.key]=j;applyRow(r.key,r.data);sortData();}
    try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}remoteRender();
  }).subscribe(st=>{
    if(st==='SUBSCRIBED'){if(SY.down){SY.down=false;pullAll(false).catch(()=>{});}setSync('online');}
    else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){SY.down=true;setSync('retry');}});}
function pushSoon(){if(!ONLINE||!SY.ready)return;clearTimeout(SY.t);SY.t=setTimeout(pushNow,400);}
async function pushNow(){clearTimeout(SY.t);if(!ONLINE||!SY.ready||!SY.sb)return;
  /* Baris baru (misalnya draft serah terima yang dibuat otomatis saat halaman dibuka) dikirim "kalau belum ada", supaya tidak menimpa
     isian orang lain yang lebih dulu tersimpan. Baris lama dikirim biasa (yang terakhir menyimpan yang dipakai). */
  const f=flat(S),ins=[],upd=[],del=[];const at=new Date().toISOString();
  for(const k in f){const j=JSON.stringify(f[k]);const old=SY.snap[k];if(old!==j){SY.snap[k]=j;(old===undefined?ins:upd).push({key:k,data:JSON.parse(j),client:SY.client,updated_at:at});}}
  for(const k in SY.snap)if(!(k in f)){delete SY.snap[k];del.push(k);}
  if(!ins.length&&!upd.length&&!del.length)return;
  const send=async rows=>{for(let i=0;i<rows.length;i+=200){const {error}=await SY.sb.from(TABLE).upsert(rows.slice(i,i+200),{onConflict:'key'});if(error)throw error;}};
  /* Baris baru yang ternyata sudah ada di server: pakai versi server */
  const sendNew=async rows=>{for(let i=0;i<rows.length;i+=200){const part=rows.slice(i,i+200);
    const {data,error}=await SY.sb.from(TABLE).upsert(part,{onConflict:'key',ignoreDuplicates:true}).select('key');if(error)throw error;
    const got=new Set((data||[]).map(r=>r.key));const miss=part.filter(r=>!got.has(r.key)).map(r=>r.key);if(!miss.length)continue;
    const {data:sv,error:e2}=await SY.sb.from(TABLE).select('key,data').in('key',miss);if(e2)throw e2;
    (sv||[]).forEach(r=>{SY.snap[r.key]=JSON.stringify(r.data);applyRow(r.key,r.data);});sortData();remoteRender();}};
  try{await sendNew(ins);await send(upd);
    if(del.length){const {error}=await SY.sb.from(TABLE).delete().in('key',del);if(error)throw error;}
    if(SY.state!=='online'&&!SY.down)setSync('online');}
  catch(e){console.error(e);ins.forEach(r=>{delete SY.snap[r.key];});upd.forEach(r=>{SY.snap[r.key]='';});del.forEach(k=>{SY.snap[k]='';});
    setSync('retry',e.message);clearTimeout(SY.t);SY.t=setTimeout(pushNow,5000);}}
/* Data dari orang lain: render ulang, tapi tunggu kalau kamu sedang mengetik supaya isian tidak hilang */
const isTyping=()=>{const a=document.activeElement;return !!a&&(a.tagName==='TEXTAREA'||a.tagName==='SELECT'||(a.tagName==='INPUT'&&!/^(checkbox|radio|button|submit)$/.test(a.type)));};
function remoteRender(){if(!S.session)return;if(isTyping()){SY.pending=true;return;}render();}
if(ONLINE){
  document.addEventListener('focusout',()=>setTimeout(()=>{if(SY.pending&&!isTyping()){SY.pending=false;if(S.session)render();}},150));
  /* Jam asli: perbarui tampilan tiap menit (pengingat maintenance, pergantian shift) */
  setInterval(()=>{S.now=Date.now();if(SY.ready&&S.session&&!isTyping())render();},60000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&SY.ready){S.now=Date.now();pullAll(false).catch(()=>{});}});
  window.addEventListener('pagehide',()=>{if(SY.ready)pushNow();});
}

/* ---------- render & events ---------- */
function render(){
  UI.arm=null;applyTheme();
  if(idleExpired())endSession('idle',idleMsg());
  if(ONLINE&&!SY.ready){document.body.classList.add('locked');const a=document.getElementById('auth');a.hidden=false;a.innerHTML=syncScreen();footSync();return;}
  if(S.session&&!(S.auth.users[S.session.user]&&S.auth.users[S.session.user].active))endSession('off','Akses akun ini sudah dicabut admin.');
  if(S.session&&S.auth.settings.revokedAt&&S.session.start<S.auth.settings.revokedAt)endSession('force','Semua sesi dikeluarkan admin. Silakan masuk lagi.');
  footSync();
  const ok=!!S.session;document.body.classList.toggle('locked',!ok);
  const au=document.getElementById('auth');
  if(!ok){renderAuth();return;}
  au.hidden=true;au.innerHTML='';clearInterval(demoT);
  S.me=S.session.user;renderTop();const band=document.getElementById('band-in');const v=document.getElementById('view');const r=route();
  if(r==='handover')renderHandover(band,v);else if(r==='issue')renderIssues(band,v);else if(r==='maint')renderMaint(band,v);else if(r==='laporan')renderReport(band,v);else if(r==='admin')renderAdmin(band,v);else renderHistory(band,v);
  playEnter([r,S.desk,AD.tab,UI.rpKey||'',UI.mtab||''].join('|'),['band-in','view']);
}
/* Ganti tema: warna berpindah halus, sorotan tombol meluncur, ikon baru muncul memantul, kartu login "bernapas" sedikit.
   Halaman tidak dirender ulang, jadi isian form tetap. */
function switchTheme(t){
  if(t===P.theme)return;
  const de=document.documentElement;de.classList.remove('theming');void de.offsetWidth;de.classList.add('theming');
  clearTimeout(UI.themeT);UI.themeT=setTimeout(()=>de.classList.remove('theming'),650);
  P.theme=t;saveP();applyTheme();
  if(S.session){renderTop();return;}
  document.querySelectorAll('.th-thumb').forEach(th=>th.style.setProperty('--i',THEME_ORDER.indexOf(t)));
  document.querySelectorAll('[data-theme-set]').forEach(b=>{const on=b.dataset.themeSet===t;b.setAttribute('aria-pressed',String(on));b.classList.remove('pop');if(on){void b.offsetWidth;b.classList.add('pop');}});
}
/* Animasi masuk hanya saat pindah halaman/tab/HP, bukan di setiap klik */
let enterT;
function playEnter(key,ids){if(UI.lastRk===key)return;UI.lastRk=key;
  ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;el.classList.remove('enter');void el.offsetWidth;el.classList.add('enter');});
  clearTimeout(enterT);enterT=setTimeout(()=>ids.forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('enter');}),1100);}
window.addEventListener('hashchange',()=>{UI.menu=false;render();window.scrollTo(0,0);});
let lastSv=0;
function activity(){if(ONLINE)S.now=Date.now();if(!S.session)return;if(idleExpired()){logout('idle',idleMsg());return;}S.session.last=Date.now();if(Date.now()-lastSv>15000){lastSv=Date.now();save();}}
document.addEventListener('pointerdown',activity,true);
document.addEventListener('keydown',activity,true);
setInterval(()=>{if(idleExpired())logout('idle',idleMsg());},20000);
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&UI.menu){UI.menu=false;renderTop();return;}const el=e.target.closest&&e.target.closest('[role="button"][data-open],[role="button"][data-view],[role="button"][data-mopen]');if(el&&el===e.target&&(e.key==='Enter'||e.key===' ')){e.preventDefault();el.click();}});
document.addEventListener('click',e=>{
  const q=s=>e.target.closest(s);let el;
  if(UI.menu&&!q('.menu')&&!q('[data-act="menu"]')){UI.menu=false;renderTop();}
  if(!S.session&&!q('#auth'))return;
  if(q('label.ack'))return;
  if((el=q('[data-pick]'))){const u=S.auth.users[el.dataset.pick];const a=document.getElementById('l-user'),b=document.getElementById('l-pass');if(a)a.value=u.username;if(b)b.value='demo';const s=document.querySelector('#login-form [type=submit]');if(s)s.focus();return;}
  if((el=q('[data-adtab]'))){AD.tab=el.dataset.adtab;render();return;}
  if((el=q('[data-week]'))){const w=+el.dataset.week;AD.week=w===0?0:AD.week+w;render();return;}
  if((el=q('[data-af]'))){AD.af=el.dataset.af;render();return;}
  if((el=q('[data-hotab]'))){UI.hoTab=el.dataset.hotab;UI.more=false;render();return;}
  if((el=q('[data-unlock]'))){const n=el.dataset.unlock;const u=S.auth.users[n];u.lockedUntil=0;u.failed=0;audit('admin','unlock','Buka kunci akun '+FULL[n]);save();render();toast('Akun '+n+' dibuka');return;}
  if((el=q('[data-mfareset]'))){const n=el.dataset.mfareset;if(UI.arm!=='mfa:'+n){UI.arm='mfa:'+n;el.textContent='Klik lagi untuk reset';return;}UI.arm=null;S.auth.users[n].mfa=null;audit('admin','mfa_reset','Reset authenticator '+FULL[n]);save();render();toast('Authenticator '+n+' direset');return;}
  if((el=q('[data-mw]'))){toggleMw(el.dataset.mw);return;}
  if((el=q('[data-mopen]'))){openMaint(el.dataset.mopen);return;}
  if((el=q('[data-mcat]'))){UI.mcat=el.dataset.mcat;render();return;}
  if((el=q('[data-mtab]'))){UI.mtab=el.dataset.mtab;render();return;}
  if((el=q('[data-mcatset]'))){syncMD();const d=UI.md,k=el.dataset.mcatset;d.cat=k;if(isDefAct(d.action,0))d.action=MDEF[k][0];if(isDefAct(d.actionEnd,1))d.actionEnd=MDEF[k][1];if(isDefTitle(d.title))d.title='Maintenance '+MCAT[k].label;renderMaintForm();return;}
  if((el=q('[data-mwdel]'))){syncMD();UI.md.windows.splice(+el.dataset.mwdel,1);renderMaintForm();return;}
  if((el=q('[data-rppick]'))){openPick(el.dataset.rppick);return;}
  if((el=q('[data-rpadd]'))){const l=el.dataset.rpadd;const rp=ensureReport(rpKey());rp[l].push({title:'',status:'',jira:'',major:false,src:null});save();render();
    const t=document.querySelector(`[data-rp="${l}|${rp[l].length-1}|title"]`);if(t)t.focus();return;}
  if((el=q('[data-rpdel]'))){const x=rpRef(el.dataset.rpdel);x.rp[x.l].splice(x.i,1);save();render();toast('Incident dihapus');return;}
  if((el=q('[data-rpmove]'))){const x=rpRef(el.dataset.rpmove);const to=x.l==='ongoing'?'resolved':'ongoing';x.rp[x.l].splice(x.i,1);x.rp[to].push(x.o);save();render();toast('Dipindah ke '+(to==='resolved'?'Resolved':'Ongoing'));return;}
  if((el=q('[data-rpshift]'))){const k=rpKey();UI.rpKey=shiftDays(k).a+'-'+el.dataset.rpshift;if(UI.rpKey===currentKey())UI.rpKey=null;render();return;}
  if((el=q('[data-rpday]'))){ensureReport(rpKey()).day=el.dataset.rpday;save();render();return;}
  if((el=q('[data-tpldel]'))){const [sid,k,i]=el.dataset.tpldel.split('|');const x=S.tpl[sid][k].splice(+i,1)[0];audit('admin','settings',`Template shift ${SHIFT[sid].name} (${KIND_L[k].toLowerCase()}): hapus "${x.t}"`);save();render();toast('Task dihapus dari template');return;}
  if((el=q('[data-holdel]'))){const x=S.holidays.splice(+el.dataset.holdel,1)[0];audit('admin','settings',`Hapus hari libur ${x.d} (${x.n})`);save();render();toast('Hari libur dihapus');return;}
  if((el=q('[data-rptdel]'))){const ts=ensureReport(rpKey()).tasks;const i=+el.dataset.rptdel;if(ts[i]&&ts[i].custom){ts.splice(i,1);save();render();toast('Task tambahan dihapus');}return;}
  if((el=q('[data-same]'))){markSame(el.dataset.same);return;}
  if((el=q('[data-open]'))){openDetail(el.dataset.open);return;}
  if((el=q('[data-desk]'))){S.desk=el.dataset.desk;S.viewShift=null;UI.ack.clear();UI.editPeople=false;UI.more=false;UI.fuMore=false;save();render();return;}
  if((el=q('[data-theme-set]'))){switchTheme(el.dataset.themeSet);return;}
  if((el=q('[data-view]'))){const h=S.handovers[el.dataset.view];if(h){S.desk=h.desk;S.viewShift=h.shift===currentKey()?null:h.shift;}UI.ack.clear();save();location.hash='handover';render();window.scrollTo(0,0);return;}
  if((el=q('[data-type]'))){UI.type=el.dataset.type;render();return;}
  if((el=q('[data-hist]'))){UI.histDesk=el.dataset.hist;render();return;}
  if((el=q('[data-tg]'))){const h=ensureHandover(currentKey(),S.desk);const f=el.dataset.tg,n=el.dataset.name;if(takenBy(currentKey(),f)[n]){toast(n+' sudah pegang HP lain');return;}h[f]=[n];save();render();return;}
  if((el=q('[data-setst]'))){const form=el.closest('form');form.querySelector('#u-status').value=el.dataset.setst;form.querySelectorAll('[data-setst]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));return;}
  if((el=q('[data-fu]'))){const inp=document.getElementById(el.dataset.for);const k=el.dataset.fu;let ms=null;
    if(k==='1h')ms=S.now+3600e3;else if(k==='next')ms=shiftRange(nextKey(currentKey())).start+30*60e3;else if(k==='tmr'){const d=new Date(S.now);d.setDate(d.getDate()+1);d.setHours(9,0,0,0);ms=d.getTime();}
    inp.value=toLocalInput(ms);return;}
  const a=q('[data-act]');if(!a)return;
  const act=a.dataset.act;const h=ensureHandover(currentKey(),S.desk);
  if(act!=='reset'&&UI.resetArm){UI.resetArm=false;document.getElementById('reset-btn').textContent=resetLabel();}
  if(act==='close')dlg.close();
  else if(act==='menu'){UI.menu=!UI.menu;renderTop();}
  else if(act==='more'){UI.more=!UI.more;render();}
  else if(act==='fumore'){UI.fuMore=!UI.fuMore;render();}
  else if(act==='logout')logout('user','Kamu sudah keluar.');
  else if(act==='pw-eye'){const p=document.getElementById('l-pass');if(p){const sh=p.type==='password';p.type=sh?'text':'password';a.innerHTML=ic(sh?'eyeoff':'eye',17);a.setAttribute('aria-label',sh?'Sembunyikan password':'Tampilkan password');}}
  else if(act==='au-back'){const u=AU.user&&S.auth.users[AU.user];resetAU({prefill:u?u.username:''});renderAuth();}
  else if(act==='au-backup'){AU.backup=!AU.backup;AU.err='';renderAuth();}
  else if(act==='au-done'){if(AU.user)finishLogin(AU.user,'authenticator baru');}
  else if(act==='copy-key'){if(AU.enroll)copyText(AU.enroll.secret,'Kunci disalin');}
  else if(act==='copy-codes'){if(AU.codes)copyText(AU.codes.map(c=>c.slice(0,4)+'-'+c.slice(4)).join('\n'),'Kode cadangan disalin');}
  else if(act==='roster-reset')rosterResetWeek();
  else if(act==='force-logout'){if(UI.arm!=='force'){UI.arm='force';a.textContent='Klik lagi untuk yakin';return;}audit('admin','force','Semua sesi dikeluarkan');S.auth.settings.revokedAt=Date.now();logout('force','Semua sesi sudah dikeluarkan. Silakan masuk lagi.');}
  else if(act==='sync-retry')syncStart();
  else if(act==='m-new')openMaint(null);
  else if(act==='m-parse')mParse();
  else if(act==='m-addwin'){syncMD();const l=UI.md.windows[UI.md.windows.length-1];UI.md.windows.push({who:'',start:l?l.start:null,end:l?l.end:null,startDone:null,endDone:null});renderMaintForm();const t=document.getElementById('mw-who-'+(UI.md.windows.length-1));if(t)t.focus();}
  else if(act==='m-del'){if(UI.arm!=='mdel'){UI.arm='mdel';a.textContent='Klik lagi untuk hapus';return;}UI.arm=null;const d=UI.md;S.maint=S.maint.filter(x=>x.id!==d.id);audit('maint','mt_del','Hapus maintenance: '+d.title);UI.md=null;save();dlg.close();render();toast('Maintenance dihapus');}
  else if(act==='rp-copy')copyReport();
  else if(act==='rp-now'){UI.rpKey=null;render();}
  else if(act==='rp-duty-reset'){const rp=ensureReport(rpKey());delete rp.duty;save();render();toast('Petugas dikembalikan sesuai jadwal');}
  else if(act==='rp-all'){const sk=rpKey();const rp=ensureReport(sk);const v=rp.tasks.filter(t=>taskOn(t,sk,rp));const all=v.every(t=>t.on);v.forEach(t=>t.on=!all);save();render();}
  else if(act==='rp-tpl'){const sk=rpKey();const rp=ensureReport(sk);if(rp.tasks.some(t=>t.custom)&&UI.arm!=='rptpl'){UI.arm='rptpl';a.textContent='Klik lagi, task tambahan manual akan hilang';return;}UI.arm=null;rp.tasks=tplTasks(sk,rp);save();render();toast('Task dikembalikan seperti template');}
  else if(act==='new')openNew();
  else if(act==='copy')openCopy();
  else if(act==='hide-tips'){P.tips=false;saveP();render();}
  else if(act==='do-copy'){const ta=document.getElementById('copy-ta');const msg=document.getElementById('copy-msg');
    const fb=()=>{ta.focus();ta.select();msg.textContent='Teks sudah diseleksi, tekan Ctrl+C.';};
    try{navigator.clipboard.writeText(ta.value).then(()=>{msg.textContent='Tersalin.';},fb);}catch(err){fb();}}
  else if(act==='back'){S.viewShift=null;UI.ack.clear();save();render();}
  else if(act==='edit-people'){UI.editPeople=!UI.editPeople;render();if(UI.editPeople)window.scrollTo({top:0,behavior:'smooth'});}
  else if(act==='submit'){if(!h.to.length)return;tick();Object.assign(h,{status:'submitted',submittedAt:S.now,submittedBy:S.me});audit('handover','submit',`Serahkan ${DESKS[S.desk].phone} ${shiftShort(currentKey())} ke ${h.to.join(', ')}`);UI.editPeople=false;save();render();toast('Diserahkan ke '+h.to.join(', '));}
  else if(act==='accept'){tick();Object.assign(h,{status:'accepted',ackAt:S.now,ackBy:S.me});audit('handover','accept',`Terima ${DESKS[S.desk].phone} ${shiftShort(currentKey())} dari ${h.from.join(', ')}`);UI.ack.clear();save();render();toast('Handover diterima');}
  else if(act==='advance'){const nk=nextKey(currentKey());const nxt=h.to[0];S.now=shiftRange(nk).start+4*60e3;S.viewShift=null;DESK_ORDER.forEach(d=>ensureHandover(nk,d));logout('shift',`Shift ${SHIFT[sidOf(nk)].name} sudah mulai. Masuk pakai akun petugas shift ini.`,nxt);}
  else if(act==='reset'){if(ONLINE&&!isAdmin()){toast('Reset data online hanya untuk admin');return;}
    if(!UI.resetArm){UI.resetArm=true;a.textContent=ONLINE?'Semua data tim akan dihapus. Klik sekali lagi':'Yakin? Klik sekali lagi';return;}UI.resetArm=false;a.textContent=a.id==='reset-btn'?resetLabel():'Reset data demo';
    if(ONLINE){const keep={roster:S.roster,tpl:S.tpl,holidays:S.holidays,mention:S.mention};S=Object.assign(freshData(),keep);}else S=seed();P.tips=true;saveP();UI.ack.clear();UI.menu=false;resetAU();save();if(dlg.open)dlg.close();render();toast('Data contoh dipulihkan');}
});
document.addEventListener('change',e=>{
  const ds=e.target.dataset||{};
  if(ds.roster){const [sk,dk]=ds.roster.split('|');const old=whoAt(sk,dk);const n=e.target.value;setRoster(sk,dk,n);audit('admin','roster',`Jadwal ${DESKS[dk].phone} ${shiftShort(sk)}: ${old} → ${n}`);save();render();toast('Jadwal disimpan');return;}
  if(ds.role){const n=ds.role,v=e.target.value;const u=S.auth.users[n];
    if(v!=='admin'&&u.role==='admin'&&TEAM.filter(x=>S.auth.users[x].role==='admin').length<=1){e.target.value='admin';toast('Minimal harus ada 1 admin');return;}
    u.role=v;audit('admin','role',`Peran ${FULL[n]} jadi ${v==='admin'?'Admin':'Anggota'}`);save();if(n===S.me&&v!=='admin')location.hash='handover';render();toast('Peran '+n+' diubah');return;}
  if(ds.active){const n=ds.active;const u=S.auth.users[n];u.active=e.target.checked;audit('admin','active',`${FULL[n]} ${u.active?'diaktifkan':'dinonaktifkan'}`);save();render();toast(n+(u.active?' diaktifkan':' dinonaktifkan'));return;}
  if(ds.set){const k=ds.set;const old=S.auth.settings[k];S.auth.settings[k]=+e.target.value;const L={idle:['Logout otomatis','menit'],maxFail:['Batas gagal login','kali'],lockMin:['Lama akun dikunci','menit']}[k];
    audit('admin','settings',`${L[0]}: ${old} → ${S.auth.settings[k]} ${L[1]}`);save();render();toast('Pengaturan disimpan');return;}
  if(e.target.id==='rp-date'){const v=e.target.value;if(/^\d{4}-\d{2}-\d{2}$/.test(v)){UI.rpKey=v+'-'+sidOf(rpKey());if(UI.rpKey===currentKey())UI.rpKey=null;render();}return;}
  if(ds.tplnb){const [sid,k,i]=ds.tplnb.split('|');const x=S.tpl[sid][k][+i];x.nb=e.target.checked;audit('admin','settings',`Template shift ${SHIFT[sid].name} (${KIND_L[k].toLowerCase()}): "${x.t}" ${x.nb?'hanya kalau besok hari kerja':'setiap shift'}`);save();toast('Template disimpan');return;}
  if(ds.tplt){const [sid,k,i]=ds.tplt.split('|');const x=S.tpl[sid][k][+i];const v=e.target.value.trim();if(v&&v!==x.t){audit('admin','settings',`Template shift ${SHIFT[sid].name} (${KIND_L[k].toLowerCase()}): ubah "${x.t}" jadi "${v}"`);x.t=v;save();toast('Template disimpan');}else e.target.value=x.t;return;}
  if(ds.rpmajor){const x=rpRef(ds.rpmajor);if(x.o)x.o.major=e.target.checked;save();render();return;}
  if(ds.rpduty){const [k,d]=ds.rpduty.split('|');const sk=rpKey();const rp=ensureReport(sk);const n=e.target.value;if(!TEAM.includes(n))return;
    const b=dutyBase(sk)[k].find(x=>x[0]===d)[1];if(!rp.duty)rp.duty={};if(!rp.duty[k])rp.duty[k]={};
    if(n===b)delete rp.duty[k][d];else rp.duty[k][d]=n;save();render();toast(`${k==='cur'?'Current':'Next'} on duty ${DESKS[d].phone}: ${n}`);return;}
  if(ds.rpmx){const rp=ensureReport(rpKey());const id=ds.rpmx;rp.mx=rp.mx.filter(m=>m!==id);if(!e.target.checked)rp.mx.push(id);save();render();return;}
  if(ds.rptask){const t=ensureReport(rpKey()).tasks[+ds.rptask];if(t)t.on=e.target.checked;save();render();return;}
  if(e.target.dataset&&e.target.dataset.ack){const id=e.target.dataset.ack;e.target.checked?UI.ack.add(id):UI.ack.delete(id);render();}
});
document.addEventListener('input',e=>{
  if(e.target.id==='ho-note'){ensureHandover(currentKey(),S.desk).note=e.target.value;save();}
  if(e.target.id==='mt-title'&&UI.md){const mg=document.getElementById('mt-merge');if(mg)UI.md.merge=!!mg.checked;UI.md.title=e.target.value;const b=document.getElementById('mt-merge-box');if(b)b.innerHTML=mergeHtml(UI.md);return;}
  if(e.target.id==='q'){UI.q=e.target.value;renderLanes();}
  const dt=e.target.dataset||{};
  if(dt.rp){const x=rpRef(dt.rp);if(x.o){x.o[x.f]=e.target.value;save();updatePreview();}return;}
  if(dt.mention){if(!S.mention)S.mention={};S.mention[dt.mention]=e.target.value.trim();save();updatePreview();return;}
  if(e.target.id==='rp-notes'){ensureReport(rpKey()).notes=e.target.value;save();updatePreview();return;}
  if(e.target.id==='otp'){const d=e.target.value.replace(/\D/g,'').slice(0,6);if(d!==e.target.value)e.target.value=d;if(d.length===6&&!AU.busy){const f=e.target.form;if(f&&f.requestSubmit)f.requestSubmit();}}
  if(e.target.id==='bk'){const c=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);const f=c.length>4?c.slice(0,4)+'-'+c.slice(4):c;if(f!==e.target.value)e.target.value=f;}
});
document.addEventListener('submit',e=>{e.preventDefault();const id=e.target.id;
  if(e.target.dataset&&e.target.dataset.tpladd){const [sid,k]=e.target.dataset.tpladd.split('|');const inp=e.target.querySelector('input[type=text]');const t=inp?inp.value.trim():'';if(!t)return;
    S.tpl[sid][k].push({t});audit('admin','settings',`Template shift ${SHIFT[sid].name} (${KIND_L[k].toLowerCase()}): tambah "${t}"`);save();render();toast('Task ditambahkan ke template');return;}
  if(id==='hol-form'){const d=val('hol-d'),n=val('hol-n');const msg=document.getElementById('hol-msg');
    if(!d||!n){if(msg)msg.textContent='Isi tanggal dan nama hari libur.';return;}if(S.holidays.some(h=>h.d===d)){if(msg)msg.textContent='Tanggal ini sudah ada.';return;}
    S.holidays.push({d,n});S.holidays.sort((x,y)=>x.d.localeCompare(y.d));audit('admin','settings',`Tambah hari libur ${d} (${n})`);save();render();toast('Hari libur ditambahkan');return;}
  if(id==='login-form')doLogin();else if(id==='otp-form')doOtp();else if(id==='enroll-form')doEnroll();else if(id==='backup-form')doBackup();
  else if(id==='upd-form')saveUpdate();else if(id==='new-form')createIssue();
  else if(id==='mt-form')saveMaint();else if(id==='pick-form')addPicked();
  else if(id==='rp-task-form'){const inp=document.getElementById('rp-task');const t=inp?inp.value.trim():'';if(!t)return;ensureReport(rpKey()).tasks.push({t,on:true,custom:true});save();render();const n=document.getElementById('rp-task');if(n)n.focus();}});
if(ONLINE){S.now=Date.now();setTimeout(syncStart,0);}
render();
})();
