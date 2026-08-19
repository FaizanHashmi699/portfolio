-- ────────────────────────────────────────────────────────────────────────────
-- Maqam — initial schema
--
-- Authorization lives here, in row-level security, rather than only in
-- application code. This product stores passports, salary certificates and
-- identity documents: a bug in a route handler must not be sufficient to leak
-- one customer's file to another. Postgres refuses the read regardless of what
-- the application layer asks for.
-- ────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type application_status as enum (
    'draft',
    'documents-pending',
    'in-review',
    'submitted',
    'with-authority',
    'approved',
    'rejected',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type lead_source as enum ('eligibility', 'contact', 'quote');
exception when duplicate_object then null;
end $$;

-- ── Profiles ────────────────────────────────────────────────────────────────
-- Mirrors auth.users with the application-level role. Roles are NOT stored in
-- user-editable metadata, because a user who can edit their own role is not a
-- role at all.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer'
    check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- ── Applications ────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  service_slug text not null,
  status application_status not null default 'draft',
  applicant_name text not null,
  applicant_email text not null,
  quoted_total numeric(12, 2) not null default 0,
  current_stage integer not null default 0,
  -- Documents and timeline events are stored as JSONB. They are always read and
  -- written together with their parent application and are never queried across
  -- rows, so a document table would add joins without buying anything.
  documents jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_status_idx on public.applications (status);
create index if not exists applications_updated_at_idx on public.applications (updated_at desc);

-- ── Leads ───────────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  name text,
  phone text,
  service_slug text,
  message text,
  source lead_source not null,
  profile jsonb,
  report jsonb,
  marketing_consent boolean not null default false
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ── Audit log ───────────────────────────────────────────────────────────────
-- Append-only. No update or delete policy is granted to anyone, including staff.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor_id text not null,
  action text not null,
  subject text not null,
  detail text
);

create index if not exists audit_log_at_idx on public.audit_log (at desc);
create index if not exists audit_log_subject_idx on public.audit_log (subject);

-- ── Row-level security ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.leads enable row level security;
alter table public.audit_log enable row level security;

-- Profiles: you see yourself; staff see everyone.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  -- A user may edit their own profile but must not be able to promote themselves.
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Applications: a customer sees only their own rows. This single policy is what
-- makes a cross-tenant passport leak a database-level impossibility.
drop policy if exists "applications_select_own" on public.applications;
create policy "applications_select_own" on public.applications
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own" on public.applications
  for insert with check (user_id = auth.uid() or public.is_staff());

-- Customers may update their own application only while it is still theirs to
-- change. Once submitted, only staff may move it.
drop policy if exists "applications_update" on public.applications;
create policy "applications_update" on public.applications
  for update using (
    public.is_staff()
    or (user_id = auth.uid() and status in ('draft', 'documents-pending'))
  );

-- Leads are written by anonymous visitors and read only by staff.
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public" on public.leads
  for insert with check (true);

drop policy if exists "leads_select_staff" on public.leads;
create policy "leads_select_staff" on public.leads
  for select using (public.is_staff());

-- Audit log: staff may read, nobody may modify. Inserts happen through the
-- service role, which bypasses RLS by design.
drop policy if exists "audit_select_staff" on public.audit_log;
create policy "audit_select_staff" on public.audit_log
  for select using (public.is_staff());

-- ── Triggers ────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists applications_touch_updated_at on public.applications;
create trigger applications_touch_updated_at
  before update on public.applications
  for each row execute function public.touch_updated_at();

-- Create a profile row whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
