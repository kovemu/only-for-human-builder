-- The project was created with "Automatically expose new tables" disabled,
-- so PostgREST roles need explicit table privileges. RLS remains the security boundary.

revoke all privileges on table public.artworks from anon, authenticated;
revoke all privileges on table public.profiles from anon, authenticated;
revoke all privileges on table public.visitor_notes from anon, authenticated;
revoke all privileges on table public.saves from anon, authenticated;
revoke all privileges on table public.reports from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select, insert on table public.artworks to anon;
grant select, insert, update, delete on table public.artworks to authenticated;

grant select on table public.profiles to anon;
grant select, insert, update, delete on table public.profiles to authenticated;

grant select, insert on table public.visitor_notes to anon;
grant select, insert, delete on table public.visitor_notes to authenticated;

grant select, insert, delete on table public.saves to authenticated;

grant insert on table public.reports to anon, authenticated;
