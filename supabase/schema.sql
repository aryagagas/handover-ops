-- Handover Ops: tabel untuk mode online.
-- Jalankan sekali di Supabase: SQL Editor -> New query -> tempel semua -> Run.
--
-- Satu baris = satu potong data (satu issue, satu serah terima, satu maintenance, satu laporan, satu akun, dst).
-- key  contoh: issue:UA-412, ho:2026-11-16-S|UA, mt:MT-3, rp:2026-11-16-S, user:Sakti, audit:<id>, roster, meta

create table if not exists public.handover_kv (
  key        text primary key,
  data       jsonb not null,
  client     text,
  updated_at timestamptz not null default now()
);

-- PROTOTYPE: siapa pun yang punya URL web + key boleh baca dan tulis.
-- Cukup untuk demo bareng teman, TIDAK untuk data kerja sungguhan.
alter table public.handover_kv enable row level security;

drop policy if exists "prototype read"   on public.handover_kv;
drop policy if exists "prototype insert" on public.handover_kv;
drop policy if exists "prototype update" on public.handover_kv;
drop policy if exists "prototype delete" on public.handover_kv;
create policy "prototype read"   on public.handover_kv for select to anon using (true);
create policy "prototype insert" on public.handover_kv for insert to anon with check (true);
create policy "prototype update" on public.handover_kv for update to anon using (true) with check (true);
create policy "prototype delete" on public.handover_kv for delete to anon using (true);

grant select, insert, update, delete on public.handover_kv to anon;

-- Aktifkan Realtime untuk tabel ini (perubahan langsung dikirim ke semua browser yang terbuka).
do $$
begin
  alter publication supabase_realtime add table public.handover_kv;
exception when duplicate_object then null;
end $$;

-- Kalau mau mulai dari nol lagi (hapus semua data tim):
--   delete from public.handover_kv;
