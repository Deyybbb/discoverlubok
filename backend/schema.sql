-- =====================================================================
-- DISCOVER LOBOC · DATABASE PLAN (Supabase / PostgreSQL) — hardened
-- For going live. Not used in preview mode. Run once in Supabase > SQL Editor.
--
-- Security model: the website is public code, so it can never be trusted
-- to protect data. EVERY rule is enforced here, by the database, with
-- Row Level Security (RLS). The browser only asks; the server decides.
-- =====================================================================

-- ---------- accounts & roles ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text not null default '' check (length(name) <= 60),
  role text not null default 'tourist' check (role in ('tourist','pio','admin')),
  created timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Role lookup used by all policies. SECURITY DEFINER with a fixed search_path
-- so it cannot be hijacked by objects in other schemas.
create or replace function public.my_role() returns text
  language sql stable security definer set search_path = public as
$$ select coalesce((select role from public.profiles where id = auth.uid()), 'guest') $$;
revoke all on function public.my_role() from public;
grant execute on function public.my_role() to anon, authenticated;

-- Profiles: you see your own; Admin sees all. Only Admin changes roles.
create policy "read own profile" on public.profiles for select using (id = auth.uid() or my_role() = 'admin');
create policy "admin manages"    on public.profiles for update using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "admin deletes"    on public.profiles for delete using (my_role() = 'admin');
-- (no insert policy: profiles are created only by the trigger below)

-- New sign-ups always start as tourists (the role is never taken from the sign-up form).
create or replace function public.on_signup() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, lower(new.email), left(coalesce(new.raw_user_meta_data->>'name',''), 60));
  return new;
end $$;
create trigger t_signup after insert on auth.users for each row execute function public.on_signup();

-- Guard rails: nobody changes their own role, email can't be edited here, the last Admin can't be removed.
create or replace function public.guard_roles() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.id = auth.uid() and new.role <> old.role then raise exception 'You cannot change your own role'; end if;
    if new.email <> old.email then raise exception 'Email is managed by sign-in, not here'; end if;
  end if;
  if (tg_op = 'DELETE' and old.role = 'admin') or (tg_op = 'UPDATE' and old.role = 'admin' and new.role <> 'admin') then
    if (select count(*) from public.profiles where role = 'admin') <= 1 then raise exception 'There must always be at least one Admin'; end if;
  end if;
  return coalesce(new, old);
end $$;
create trigger t_guard_roles before update or delete on public.profiles for each row execute function public.guard_roles();

-- ---------- content tables ----------
-- "data" holds the fields edited in Admin. OPEN BROWSING: everyone (even without an account)
-- can read published content. Only the right role can write.
do $$ declare t text; begin
  foreach t in array array['highlights','places','activities','listings','guides','hotlines','transport','access','officials','brgys','faqs','gallery','timeline','events','news'] loop
    execute format('create table public.%I (id text primary key check (id ~ ''^[A-Za-z0-9_-]{1,60}$''), data jsonb not null check (jsonb_typeof(data) = ''object'' and pg_column_size(data) < 600000), updated timestamptz not null default now())', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
  -- published items: everyone; hidden (unpublished) items: Admin and PIO only
  foreach t in array array['highlights','places','activities','listings','guides','gallery'] loop
    execute format('create policy "public read" on public.%I for select using ((data->>''pub'') is distinct from ''false'' or my_role() in (''admin'',''pio''))', t);
  end loop;
  foreach t in array array['hotlines','transport','access','officials','brgys','faqs','timeline','events'] loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
  end loop;
  -- Admin edits everything except News & Events, which Admin and PIO share
  foreach t in array array['highlights','places','activities','listings','guides','hotlines','transport','access','officials','brgys','faqs','gallery','timeline'] loop
    execute format('create policy "admin insert" on public.%I for insert with check (my_role() = ''admin'')', t);
    execute format('create policy "admin update" on public.%I for update using (my_role() = ''admin'') with check (my_role() = ''admin'')', t);
    execute format('create policy "admin delete" on public.%I for delete using (my_role() = ''admin'')', t);
  end loop;
  foreach t in array array['news','events'] loop
    execute format('create policy "staff insert" on public.%I for insert with check (my_role() in (''admin'',''pio''))', t);
    execute format('create policy "staff update" on public.%I for update using (my_role() in (''admin'',''pio'')) with check (my_role() in (''admin'',''pio''))', t);
    execute format('create policy "staff delete" on public.%I for delete using (my_role() in (''admin'',''pio''))', t);
  end loop;
end $$;
-- News: drafts, archived, future and expired posts are not public
create policy "public read" on public.news for select using (
  my_role() in ('admin','pio') or (data->>'status' = 'Published'
  and coalesce(data->>'date','') <= to_char(now() at time zone 'Asia/Manila','YYYY-MM-DD')
  and (coalesce(data->>'expires','') = '' or data->>'expires' >= to_char(now() at time zone 'Asia/Manila','YYYY-MM-DD'))));
-- Barangays are fixed (28): they can be edited, never deleted
drop policy "admin delete" on public.brgys;
-- Officials' office contact numbers are private: never allowed in the public table
alter table public.officials add constraint no_private_contact check (not (data ? 'contact'));
create table public.officials_private (id text primary key references public.officials(id) on delete cascade, contact text check (length(contact) <= 100));
alter table public.officials_private enable row level security;
create policy "admin only" on public.officials_private for all using (my_role() = 'admin') with check (my_role() = 'admin');

create table public.settings (id int primary key default 1 check (id = 1), data jsonb not null check (pg_column_size(data) < 100000));
alter table public.settings enable row level security;
create policy "public read"  on public.settings for select using (true);
create policy "admin update" on public.settings for update using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "admin insert" on public.settings for insert with check (my_role() = 'admin');

-- ---------- reviews ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  target text not null, target_name text,
  rating int not null check (rating between 1 and 5),
  name text not null check (length(name) between 2 and 60 and name !~ '[<>{}\[\]\\/=@$%^*_|~`]'),
  email text not null check (email ~* '^[^@\s<>"'']{1,64}@[^@\s<>"'']{1,190}\.[a-z]{2,}$' and length(email) <= 254),
  text text not null check (length(text) between 10 and 600 and text !~* '(https?://|www\.)'),
  visit text check (visit in ('', 'Solo','Couple','Family','Friends','Group tour','Business')),
  user_id uuid references auth.users default auth.uid(),
  status text not null default 'Published' check (status in ('Published','Hidden')),
  created timestamptz not null default now()
);
alter table public.reviews enable row level security;
-- Logged-in users only, posting as themselves, as a normal review, for a real place.
create policy "post a review" on public.reviews for insert with check (
  auth.uid() is not null and user_id = auth.uid() and status = 'Published'
  and (exists (select 1 from public.places where id = target) or exists (select 1 from public.highlights where id = target)
       or exists (select 1 from public.activities where id = target) or exists (select 1 from public.listings where id = target)));
create policy "admin reads"   on public.reviews for select using (my_role() = 'admin');
create policy "admin hides"   on public.reviews for update using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "admin deletes" on public.reviews for delete using (my_role() = 'admin');
-- Server fills date/status; logged-in reviewers always post under their account; spam limits.
create or replace function public.review_rules() returns trigger
  language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  new.created := now(); new.status := 'Published'; new.email := lower(trim(new.email));
  if auth.uid() is null then raise exception 'Please log in to write a review'; end if;
  select * into p from public.profiles where id = auth.uid();
  new.user_id := auth.uid(); new.email := p.email; new.name := p.name;
  if exists (select 1 from public.reviews where target = new.target and email = new.email and created > now() - interval '1 day') then
    raise exception 'You already reviewed this place today'; end if;
  if (select count(*) from public.reviews where email = new.email and created > now() - interval '1 hour') >= 10 then
    raise exception 'Too many reviews. Please try again later'; end if;
  return new;
end $$;
create trigger t_review_rules before insert on public.reviews for each row execute function public.review_rules();
-- The public reads this view, which never includes emails.
create view public.reviews_public as
  select id, target, target_name, rating, name, text, visit, user_id, created from public.reviews where status = 'Published';
revoke all on public.reviews_public from anon, authenticated, public;
grant select on public.reviews_public to anon, authenticated;   -- everyone may read published reviews (never emails)

-- Numbers shown on the landing page (counts only, no content).
create or replace function public.landing_stats() returns json
  language sql stable security definer set search_path = public as $$
  select json_build_object(
    'destinations', (select count(*) from places where (data->>'pub') is distinct from 'false') + (select count(*) from highlights where (data->>'pub') is distinct from 'false'),
    'guides', (select count(*) from guides where (data->>'pub') is distinct from 'false'),
    'barangays', (select count(*) from brgys),
    'years', extract(year from now())::int - 1597) $$;
revoke all on function public.landing_stats() from public;
grant execute on function public.landing_stats() to anon, authenticated;

-- ---------- contact messages ----------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users default auth.uid(),
  name text, email text,
  subject text not null check (subject in ('General inquiry','Group visit / tour guide request','Accessibility request','Feedback','Report a concern')),
  body text not null check (length(body) between 10 and 1500),
  status text not null default 'New' check (status in ('New','Read','Replied','Archived')),
  replies jsonb not null default '[]',
  created timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "tourist sends"     on public.messages for insert with check (auth.uid() = user_id);
create policy "tourist reads own" on public.messages for select using (auth.uid() = user_id or my_role() = 'admin');
create policy "admin updates"     on public.messages for update using (my_role() = 'admin') with check (my_role() = 'admin');
create policy "admin deletes"     on public.messages for delete using (my_role() = 'admin');
-- Name and email always come from the verified account, so a reply can't be redirected to someone else.
create or replace function public.message_rules() returns trigger
  language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then raise exception 'Please log in'; end if;
  new.user_id := p.id; new.name := p.name; new.email := p.email; new.status := 'New'; new.replies := '[]'; new.created := now();
  if (select count(*) from public.messages where user_id = p.id and created > now() - interval '1 hour') >= 5 then
    raise exception 'Too many messages. Please wait for a reply'; end if;
  return new;
end $$;
create trigger t_message_rules before insert on public.messages for each row execute function public.message_rules();

-- ---------- realtime visitor counter ----------
create table public.site_stats (id int primary key default 1 check (id = 1), visits bigint not null default 0);
insert into public.site_stats values (1, 0);
alter table public.site_stats enable row level security;
create policy "public read" on public.site_stats for select using (true);
create or replace function public.hit_visit() returns bigint
  language sql security definer set search_path = public as
$$ update public.site_stats set visits = visits + 1 where id = 1 returning visits $$;
revoke all on function public.hit_visit() from public;
grant execute on function public.hit_visit() to anon, authenticated;
alter publication supabase_realtime add table public.site_stats;

-- ---------- photo storage ----------
-- Public bucket with a hard size limit and image types only (the site already compresses to WebP).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 2097152, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "public read photos"  on storage.objects for select using (bucket_id = 'photos');
create policy "staff upload photos" on storage.objects for insert with check (bucket_id = 'photos' and my_role() in ('admin','pio'));
create policy "staff delete photos" on storage.objects for delete using (bucket_id = 'photos' and my_role() in ('admin','pio'));
-- (no update policy: photos are replaced by uploading a new file, never overwritten)
