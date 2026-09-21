alter table public.artworks
  add column if not exists image_bytes bigint;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='artworks_image_bounds_check'
  ) then
    alter table public.artworks
      add constraint artworks_image_bounds_check
      check (
        (image_width is null or image_width between 1 and 1920)
        and (image_height is null or image_height between 1 and 1920)
        and (image_bytes is null or image_bytes between 1 and 1048576)
      );
  end if;
end $$;

update storage.buckets
set public=true,
    file_size_limit=1048576,
    allowed_mime_types=array['image/webp']
where id='artworks';

drop policy if exists "public optimized artwork uploads" on storage.objects;
create policy "public optimized artwork uploads"
on storage.objects
for insert
to anon
with check (
  bucket_id='artworks'
  and (storage.foldername(name))[1]='public'
  and lower(storage.extension(name))='webp'
);

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
);
