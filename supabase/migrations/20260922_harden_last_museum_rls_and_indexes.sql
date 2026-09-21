-- Applied to production Supabase project on 2026-09-22.
-- Keep public helper functions out of PostgREST and cover FK columns used by cleanup/moderation.

revoke all on function public.rls_auto_enable() from public, anon, authenticated;

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "profiles self update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "profiles self delete" on public.profiles
  for delete to authenticated
  using ((select auth.uid()) = id);

create index if not exists visitor_notes_user_idx on public.visitor_notes(user_id);
create index if not exists saves_artwork_idx on public.saves(artwork_id);
create index if not exists reports_artwork_idx on public.reports(artwork_id);
create index if not exists reports_visitor_note_idx on public.reports(visitor_note_id);
create index if not exists reports_reporter_idx on public.reports(reporter_id);
