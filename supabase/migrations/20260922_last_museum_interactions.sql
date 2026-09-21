create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique default ('ex-' || substr(replace(gen_random_uuid()::text,'-',''),1,12)),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'anonymous human',
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  image_path text not null,
  image_width integer check (image_width is null or image_width > 0),
  image_height integer check (image_height is null or image_height > 0),
  human_confirmed boolean not null default false,
  status text not null default 'pending' check (status in ('pending','published','rejected','hidden')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.visitor_notes (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'anonymous human' check (char_length(author_name) <= 60),
  body text not null check (char_length(body) between 1 and 180),
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references public.artworks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artwork_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references public.artworks(id) on delete cascade,
  visitor_note_id uuid references public.visitor_notes(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null check (char_length(reason) between 1 and 240),
  created_at timestamptz not null default now(),
  check (artwork_id is not null or visitor_note_id is not null)
);

create index if not exists artworks_status_created_idx on public.artworks(status, created_at desc);
create index if not exists artworks_user_idx on public.artworks(user_id);
create index if not exists visitor_notes_artwork_created_idx on public.visitor_notes(artwork_id, created_at);
create index if not exists saves_user_created_idx on public.saves(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.artworks enable row level security;
alter table public.visitor_notes enable row level security;
alter table public.saves enable row level security;
alter table public.reports enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "published artworks public read" on public.artworks;
create policy "published artworks public read" on public.artworks for select to anon, authenticated using (status='published' or (select auth.uid()) = user_id);
drop policy if exists "users create own artworks" on public.artworks;
create policy "users create own artworks" on public.artworks for insert to authenticated with check ((select auth.uid()) = user_id and human_confirmed = true);
drop policy if exists "users update own artworks" on public.artworks;
create policy "users update own artworks" on public.artworks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "users delete own artworks" on public.artworks;
create policy "users delete own artworks" on public.artworks for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "visible notes public read" on public.visitor_notes;
create policy "visible notes public read" on public.visitor_notes for select to anon, authenticated using (status='visible');
drop policy if exists "humans leave notes" on public.visitor_notes;
create policy "humans leave notes" on public.visitor_notes for insert to anon, authenticated
with check (
  status='visible'
  and char_length(body) between 1 and 180
  and ((select auth.uid()) is null or user_id is null or user_id=(select auth.uid()))
);
drop policy if exists "users delete own notes" on public.visitor_notes;
create policy "users delete own notes" on public.visitor_notes for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "users read own saves" on public.saves;
create policy "users read own saves" on public.saves for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users create own saves" on public.saves;
create policy "users create own saves" on public.saves for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users delete own saves" on public.saves;
create policy "users delete own saves" on public.saves for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "anyone can report" on public.reports;
create policy "anyone can report" on public.reports for insert to anon, authenticated with check (char_length(reason) between 1 and 240);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('artworks','artworks',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "artworks public storage read" on storage.objects;
create policy "artworks public storage read" on storage.objects for select to public using (bucket_id='artworks');

drop policy if exists "users upload own artwork files" on storage.objects;
create policy "users upload own artwork files" on storage.objects for insert to authenticated
with check (bucket_id='artworks' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "users update own artwork files" on storage.objects;
create policy "users update own artwork files" on storage.objects for update to authenticated
using (bucket_id='artworks' and (storage.foldername(name))[1]=(select auth.uid())::text);

drop policy if exists "users delete own artwork files" on storage.objects;
create policy "users delete own artwork files" on storage.objects for delete to authenticated
using (bucket_id='artworks' and (storage.foldername(name))[1]=(select auth.uid())::text);
