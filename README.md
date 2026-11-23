# Handover Ops

Prototype web untuk serah terima shift tim Ops: HP UA dan HP AB, 3 shift (Pagi 06–14, Siang 14–22, Malam 22–06).
Semua berjalan di browser tanpa server. Data tersimpan di `localStorage` browser yang dipakai.

## Struktur

```
project_handover/
├── index.html          kerangka halaman (header, area konten, drawer, toast)
├── assets/
│   ├── config.js       URL + key Supabase (kosong = mode lokal)
│   ├── styles.css      semua tampilan: token warna light/dark, layout, animasi
│   └── app.js          semua logika: data contoh, login + authenticator, halaman, sinkron Supabase
├── supabase/
│   └── schema.sql      tabel + izin + realtime, dijalankan sekali di Supabase
└── tests/
    ├── smoke.js        tes otomatis tanpa browser (stub DOM)
    ├── realtime.js     tes mode online pakai Supabase tiruan (2 browser)
    ├── samples.js      contoh broadcast BI-FAST & Rintis untuk tes parser
    └── contrast.js     cek kontras warna teks light/dark (WCAG)
```

## Menjalankan

Buka `index.html` di browser (klik dua kali, atau lewat ekstensi Live Server di VS Code).
Butuh internet untuk font Plus Jakarta Sans dan library QR code (`qrcodejs` dari cdnjs). Tanpa internet aplikasi tetap jalan.

### Akun demo

Password semua akun: `demo`. Username = `namadepan.namabelakang` dari nama lengkap.

| Nama | Username | Catatan |
|---|---|---|
| Sakti | `sakti.wardhana` | Admin, belum daftar authenticator (diminta scan QR saat login pertama) |
| Bayu | `bayu.hadi` | |
| Dimas | `dimas.saputra` | |
| Fajar | `fajar.nugroho` | |
| Kevin | `kevin.lubis` | |
| Leo | `leonardus.wibowo` | |
| Naufal | `naufal.pratama` | |
| Rafi | `rafi.siregar` | |
| Tegar | `tegar.simanjuntak` | |

Akun selain Sakti sudah punya authenticator. Kalau tidak memegang HP, buka "Nggak pegang HP? Lihat kode demo" di halaman kode.

Jam aplikasi adalah jam demo (mulai Senin 16 Nov 2026, 21:35) dan maju 2 menit setiap ada aksi. Tombol "Reset data contoh" di bawah halaman mengembalikan semua data awal.

## Mode lokal vs mode online

| | Lokal (default) | Online (Supabase) |
|---|---|---|
| Aktif kalau | `assets/config.js` kosong | `supabaseUrl` dan `supabaseKey` diisi |
| Data | di browser masing-masing | satu database untuk semua orang |
| Update orang lain | tidak kelihatan | langsung muncul (realtime) |
| Jam | jam demo (16 Nov 2026, maju 2 menit tiap aksi) | jam asli |
| Data awal | data contoh | kosong (atau contoh, lihat `startWith`) |

## Online: GitHub + Supabase + Netlify

### 1. Supabase (database + realtime)
1. Daftar di https://supabase.com lalu **New project** (region Singapore paling dekat). Simpan password database-nya.
2. Buka **SQL Editor → New query**, tempel isi [`supabase/schema.sql`](supabase/schema.sql), lalu **Run**.
3. Buka **Project Settings → API Keys** (atau **Data API**), salin:
   - **Project URL** → `https://xxxx.supabase.co`
   - key **anon public** / **publishable** (bukan `service_role` / secret)
4. Isi ke [`assets/config.js`](assets/config.js):
   ```js
   supabaseUrl: 'https://xxxx.supabase.co',
   supabaseKey: 'eyJ...atau sb_publishable_...',
   ```
5. Buka `index.html`. Di bawah halaman harus tertulis **Online · tersinkron realtime**. Coba buka di dua browser berbeda, ubah sesuatu di satu browser, lihat browser lain ikut berubah.

Browser pertama yang tersambung mengisi database (akun tim, jadwal, template). Semua akun mulai tanpa authenticator; tiap orang scan QR sendiri saat login pertama.

### 2. GitHub
Pakai **repo private**: kode ini berisi nama anggota tim dan data contoh dari pekerjaan.
1. Di https://github.com/new buat repo, pilih **Private**, jangan centang "Add a README".
2. Dari folder ini (PowerShell / terminal VS Code):
   ```
   git init
   git add .
   git commit -m "Handover Ops prototype"
   git branch -M main
   git remote add origin https://github.com/USERNAME/handover-ops.git
   git push -u origin main
   ```

### 3. Netlify (link untuk dishare)
1. Login https://app.netlify.com pakai akun GitHub → **Add new site → Import an existing project → GitHub** → pilih repo tadi.
2. Build command: kosongkan. Publish directory: `.` (titik). **Deploy**.
3. Dapat link `https://nama-situs.netlify.app`. Ganti nama di **Site configuration → Change site name**.
4. Setiap `git push` berikutnya otomatis ter-deploy.

Alternatif: Vercel atau Cloudflare Pages (caranya mirip, juga bisa dari repo private). GitHub Pages gratis hanya untuk repo public.

### Keamanan prototype online
- Siapa pun yang punya link bisa membaca dan mengubah data (key Supabase di `config.js` memang terlihat di browser). Bagikan link hanya ke tim.
- Login masih simulasi: password semua akun `demo`, secret authenticator tersimpan di database yang sama.
- **Jangan isi data kerja sungguhan.** Untuk dipakai beneran, login dan verifikasi harus lewat server (LDAP + TOTP di server) dan aksesnya dibatasi.
- Hapus semua data: admin klik **Hapus semua data tim** di bawah halaman, atau jalankan `delete from public.handover_kv;` di SQL Editor.

## Fitur

- **Serah terima** per HP per shift: daftar item belum/sudah dicek, wajib baca, follow up, catatan shift, serahkan → terima.
- **Issue**: papan per status (Nunggu, Perlu FU, Simpen, Resolved), issue bisa tampil di dua HP sekaligus.
- **Maintenance**: tempel broadcast (BI-FAST, switching, internal), jadwal dibaca otomatis, pengingat 3 jam sebelum mulai dan setelah selesai.
- **Laporan atasan**: form SUMMARY REPORT per shift (tab Shift 1/2/3 + tanggal), petugas dipilih lewat dropdown (otomatis dari jadwal), task dari template weekdays atau weekend/tanggal merah, tombol salin teks. Nama @ untuk chat diatur di Admin → Anggota.
- **Riwayat** serah terima.
- **Admin**: jadwal shift, anggota & peran, template laporan + daftar tanggal merah, audit log, pengaturan keamanan.
- Light / dark mode, tampilan HP dan desktop.

## Tes

Tanpa browser, pakai Node.js 18 ke atas:

```
node tests/smoke.js          # tes alur login, authenticator, semua halaman, parser broadcast, laporan, template task
node tests/realtime.js       # tes mode online: sinkron & realtime antar 2 browser (Supabase tiruan)
node tests/contrast.js       # kontras warna teks light & dark
```

Kalau Node belum terpasang, Electron bawaan VS Code bisa dipakai (PowerShell):

```
$env:ELECTRON_RUN_AS_NODE="1"; & "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe" tests\smoke.js
```

`smoke.js` harus berakhir dengan `ALL OK`.

## Sebelum dipakai sungguhan

Ini prototype. Yang perlu diganti sebelum dipakai tim:

- **Login**: sekarang password dicek di browser. Versi asli harus cek ke LDAP lewat server, dan hanya grup `OPS-HANDOVER` yang boleh masuk.
- **Authenticator**: secret TOTP dan kode cadangan sekarang disimpan di browser. Versi asli harus disimpan terenkripsi di server dan diverifikasi di server.
- **Data**: pindahkan dari `localStorage` ke database bersama supaya semua orang melihat data yang sama.
- **Jam**: ganti jam demo dengan jam asli.
- **Pengingat maintenance**: sekarang hanya tampil di aplikasi. Notifikasi ke HP butuh server (push notification atau bot chat).
