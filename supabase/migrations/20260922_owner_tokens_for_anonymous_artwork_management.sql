alter table public.artworks
  add column if not exists owner_token_hash text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='artworks_owner_token_hash_check'
  ) then
    alter table public.artworks
      add constraint artworks_owner_token_hash_check
      check (
        owner_token_hash is null
        or owner_token_hash ~ '^[0-9a-f]{64}$'
      );
  end if;
end $$;

drop policy if exists "public artwork intake" on public.artworks;
create policy "public artwork intake"
on public.artworks
for insert
to anon
with check (
  user_id is null
  and author_name='anonymous human'
  and human_confirmed=true
  and status='published'
  and image_path like 'public/%'
  and image_width between 1 and 1920
  and image_height between 1 and 1920
  and image_bytes between 1 and 1048576
  and owner_token_hash ~ '^[0-9a-f]{64}$'
);
