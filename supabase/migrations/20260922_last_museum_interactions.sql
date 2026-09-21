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


-- Prototype exhibits used by the current front-end.
insert into public.artworks
  (slug, author_name, title, description, image_path, image_width, image_height, human_confirmed, status, published_at)
values
  ('sample-001','@human_001','half a taco // 12:41 pm','half a taco. no restoration planned.','seed/sample-001',300,390,true,'published','2026-08-16T12:41:00Z'),
  ('sample-002','@human_002','rock I kept for 11 years','a rock kept for eleven years for reasons lost to history.','seed/sample-002',220,290,true,'published','2026-09-01T00:00:00Z'),
  ('sample-003','@human_003','first terrible painting // age 9','first terrible painting. age nine. confidence intact.','seed/sample-003',280,210,true,'published','2026-07-04T00:00:00Z'),
  ('sample-004','@human_004','drawing from 2004 // survived somehow','drawing from 2004. survived every cleanup somehow.','seed/sample-004',300,500,true,'published','2004-06-12T00:00:00Z'),
  ('sample-005','@human_005','blurry moon // classic human error','blurry moon. classic human error.','seed/sample-005',250,250,true,'published','2026-08-21T00:00:00Z'),
  ('sample-006','@human_006','forgot why I took this','forgot why this was photographed. preserved anyway.','seed/sample-006',290,220,true,'published','2026-09-13T00:00:00Z'),
  ('sample-007','@human_007','wall near my house // no reason','wall near home. no reason.','seed/sample-007',210,300,true,'published','2026-06-02T00:00:00Z'),
  ('sample-008','@human_008','sock with structural damage','sock with structural damage.','seed/sample-008',280,360,true,'published','2026-09-08T00:00:00Z'),
  ('sample-009','@human_009','last dumpling // gone now','last dumpling. no longer extant.','seed/sample-009',240,180,true,'published','2026-09-10T00:00:00Z'),
  ('sample-010','@human_010','proof that today happened','proof that today happened.','seed/sample-010',260,340,true,'published','2026-09-21T00:00:00Z')
on conflict (slug) do update set
  author_name=excluded.author_name,
  title=excluded.title,
  description=excluded.description,
  image_path=excluded.image_path,
  image_width=excluded.image_width,
  image_height=excluded.image_height,
  human_confirmed=excluded.human_confirmed,
  status=excluded.status,
  published_at=excluded.published_at;

insert into public.visitor_notes (artwork_id, author_name, body, status, created_at)
select a.id, x.author_name, x.body, 'visible', x.created_at::timestamptz
from public.artworks a
join (values
  ('sample-001','museum visitor','this should not have survived lunch.','2026-09-20T12:11:00Z'),
  ('sample-001','human #41','finally, a serious work about impermanence.','2026-09-20T13:22:00Z'),
  ('sample-002','anonymous human','eleven years is long-term curation.','2026-09-19T09:10:00Z'),
  ('sample-003','museum visitor','the line work is fearless. mostly because the artist was nine.','2026-09-18T18:43:00Z')
) as x(slug,author_name,body,created_at) on x.slug=a.slug
where not exists (
  select 1 from public.visitor_notes n
  where n.artwork_id=a.id and n.author_name=x.author_name and n.body=x.body
);
