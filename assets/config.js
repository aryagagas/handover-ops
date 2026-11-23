/* Pengaturan mode online (Supabase).
   - Biarkan supabaseUrl / supabaseKey kosong  -> app jalan LOKAL (data cuma di browser masing-masing, jam demo).
   - Isi keduanya                              -> app jalan ONLINE (data bersama + realtime, jam asli).

   Ambil dari Supabase: Project Settings -> API (atau Data API / API Keys)
     supabaseUrl : Project URL, contoh https://abcdefghijkl.supabase.co
     supabaseKey : key "anon public" atau "publishable" (sb_publishable_...)
   JANGAN pakai key "service_role" / "secret". Key yang di sini memang terlihat oleh siapa pun yang membuka web-nya.

   startWith (dipakai sekali, saat database masih kosong):
     'kosong' -> mulai tanpa issue/handover/maintenance, semua akun daftar authenticator sendiri saat login pertama
     'contoh' -> isi dengan data contoh yang ada di app.js */
window.HANDOVER_CONFIG = {
  supabaseUrl: 'https://supabase.com/dashboard/project/lrilnixxhqnxkpuutfsn',
  supabaseKey: 'sb_publishable_KxeSLglgsrCnhOtLeCcHmg_8BDe-zPu',
  table: 'handover_kv',
  startWith: 'kosong'
};
