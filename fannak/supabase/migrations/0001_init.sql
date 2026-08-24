-- ===========================================================================
-- Fannak — initial schema
--
-- Design rules carried from Step 2 (research/step-2-tech-stack.md):
--   §6.1  every business table carries tenant_id; RLS on every table
--   §6.3  credit_ledger is append-only; messages logs every outbound send
--   §6.4  assign + debit happen in ONE transaction, in the database
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role       as enum ('admin', 'owner', 'staff');
create type tenant_status   as enum ('pending', 'active', 'suspended');
create type lead_status     as enum ('new', 'assigned', 'accepted', 'declined', 'completed', 'cancelled');
create type lead_outcome    as enum ('won', 'lost', 'no_show');
create type message_status  as enum ('queued', 'sent', 'failed');

-- ---------------------------------------------------------------------------
-- Geography. Cities and districts are DATA, not code — expanding beyond
-- Riyadh is an insert, never a deploy.
-- ---------------------------------------------------------------------------
create table cities (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_ar     text not null,
  name_en     text not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table districts (
  id          uuid primary key default gen_random_uuid(),
  city_id     uuid not null references cities(id) on delete cascade,
  slug        text not null,
  name_ar     text not null,
  name_en     text not null,
  created_at  timestamptz not null default now(),
  unique (city_id, slug)
);

-- ---------------------------------------------------------------------------
-- Service taxonomy. Seeded with AC first (Step 1 §04 ranked it the best
-- consumer wedge) but deliberately generic.
-- ---------------------------------------------------------------------------
create table services (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  category      text not null,
  name_ar       text not null,
  name_en       text not null,
  description_ar text,
  description_en text,
  typical_price_min numeric(10,2),
  typical_price_max numeric(10,2),
  is_recurring  boolean not null default false,
  sort_order    int not null default 0,
  is_active     boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Tenants = the licensed service companies. This is the directory row.
-- ---------------------------------------------------------------------------
create table tenants (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_ar         text not null,
  name_en         text not null,
  about_ar        text,
  about_en        text,
  phone           text,
  whatsapp        text,
  city_id         uuid references cities(id),

  -- Compliance / trust. Verified against Wathq, not self-declared.
  cr_number       text,
  cr_verified_at  timestamptz,
  wathq_payload   jsonb,

  status          tenant_status not null default 'pending',
  credit_balance  integer not null default 0,   -- mirror of credit_ledger; ledger is truth
  branding        jsonb not null default '{}'::jsonb,  -- white-label hook (Step 2 §6.1)
  rating          numeric(2,1),
  jobs_completed  integer not null default 0,
  created_at      timestamptz not null default now()
);

create index tenants_city_idx   on tenants (city_id) where status = 'active';
create index tenants_search_idx on tenants using gin ((name_ar || ' ' || name_en) gin_trgm_ops);

-- Which districts a provider will actually travel to. Drives "near me".
create table tenant_districts (
  tenant_id   uuid not null references tenants(id) on delete cascade,
  district_id uuid not null references districts(id) on delete cascade,
  primary key (tenant_id, district_id)
);

-- What each provider offers, and at what price.
create table partner_services (
  tenant_id     uuid not null references tenants(id) on delete cascade,
  service_id    uuid not null references services(id) on delete cascade,
  price_sar     numeric(10,2),
  price_note_ar text,
  price_note_en text,
  capacity_note text,
  primary key (tenant_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Users. Profile rows mirroring auth.users. Auth in v1 is email magic link:
-- phone OTP needs a CITC-approved sender ID, which needs a local entity.
-- ---------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid references tenants(id) on delete cascade,
  role        user_role not null default 'staff',
  full_name   text,
  email       text,
  locale      text not null default 'ar',
  created_at  timestamptz not null default now()
);

create index profiles_tenant_idx on profiles (tenant_id);

-- ---------------------------------------------------------------------------
-- Leads. Customers never authenticate — they submit a form.
-- ---------------------------------------------------------------------------
create table leads (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique default ('L-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 6))),
  customer_name  text not null,
  phone          text not null,
  service_id     uuid references services(id),
  city_id        uuid references cities(id),
  district_id    uuid references districts(id),
  address        text,
  notes          text,
  scheduled_for  timestamptz,
  status         lead_status not null default 'new',
  source         text not null default 'web',
  preferred_tenant_id uuid references tenants(id),  -- set when the customer picked a provider from the directory
  created_at     timestamptz not null default now()
);

create index leads_status_idx on leads (status, created_at desc);

create table lead_assignments (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references leads(id) on delete cascade,
  tenant_id       uuid not null references tenants(id) on delete cascade,
  credits_charged integer not null default 1,
  sent_at         timestamptz not null default now(),
  accepted_at     timestamptz,
  declined_at     timestamptz,
  outcome         lead_outcome,
  outcome_note    text,
  unique (lead_id, tenant_id)
);

create index lead_assignments_tenant_idx on lead_assignments (tenant_id, sent_at desc);

-- ---------------------------------------------------------------------------
-- credit_ledger — APPEND-ONLY. The first partner dispute will be about
-- credits, so the balance must always be reconstructable from history.
-- ---------------------------------------------------------------------------
create table credit_ledger (
  id             bigserial primary key,
  tenant_id      uuid not null references tenants(id) on delete cascade,
  delta          integer not null,
  reason         text not null,
  ref            text,
  balance_after  integer not null,
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

create index credit_ledger_tenant_idx on credit_ledger (tenant_id, id desc);

create or replace function forbid_mutation() returns trigger
language plpgsql as $$
begin
  raise exception 'credit_ledger is append-only: % is not permitted', tg_op;
end;
$$;

create trigger credit_ledger_no_update before update on credit_ledger
  for each row execute function forbid_mutation();
create trigger credit_ledger_no_delete before delete on credit_ledger
  for each row execute function forbid_mutation();

-- ---------------------------------------------------------------------------
-- Outbound message log. Settles "you never sent me that lead".
-- ---------------------------------------------------------------------------
create table messages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete set null,
  lead_id     uuid references leads(id) on delete set null,
  channel     text not null default 'whatsapp',
  recipient   text not null,
  template    text,
  payload     jsonb,
  status      message_status not null default 'queued',
  error       text,
  created_at  timestamptz not null default now()
);

create index messages_tenant_idx on messages (tenant_id, created_at desc);

create table audit_log (
  id          bigserial primary key,
  actor       uuid references auth.users(id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- assign_lead — the ONLY transactional path that matters (Step 2 §6.4).
-- Assign + debit must be atomic. Never do this across two application calls.
-- ===========================================================================
create or replace function assign_lead(
  p_lead_id   uuid,
  p_tenant_id uuid,
  p_credits   integer default 1
) returns lead_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance    integer;
  v_assignment lead_assignments;
begin
  -- Lock the tenant row so two concurrent assignments cannot both pass the
  -- balance check and drive the account negative.
  select credit_balance into v_balance
    from tenants where id = p_tenant_id for update;

  if v_balance is null then
    raise exception 'tenant % not found', p_tenant_id;
  end if;

  if v_balance < p_credits then
    raise exception 'insufficient credits: tenant % has %, needs %',
      p_tenant_id, v_balance, p_credits;
  end if;

  insert into lead_assignments (lead_id, tenant_id, credits_charged)
  values (p_lead_id, p_tenant_id, p_credits)
  returning * into v_assignment;

  update tenants
     set credit_balance = credit_balance - p_credits
   where id = p_tenant_id;

  insert into credit_ledger (tenant_id, delta, reason, ref, balance_after, created_by)
  values (p_tenant_id, -p_credits, 'lead_assigned', p_lead_id::text,
          v_balance - p_credits, auth.uid());

  update leads set status = 'assigned' where id = p_lead_id;

  return v_assignment;
end;
$$;

-- Top-up counterpart. Also writes the ledger, also atomic.
create or replace function add_credits(
  p_tenant_id uuid,
  p_credits   integer,
  p_reason    text default 'bank_transfer',
  p_ref       text default null
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_credits <= 0 then
    raise exception 'credits must be positive';
  end if;

  update tenants
     set credit_balance = credit_balance + p_credits
   where id = p_tenant_id
   returning credit_balance into v_balance;

  if v_balance is null then
    raise exception 'tenant % not found', p_tenant_id;
  end if;

  insert into credit_ledger (tenant_id, delta, reason, ref, balance_after, created_by)
  values (p_tenant_id, p_credits, p_reason, p_ref, v_balance, auth.uid());

  return v_balance;
end;
$$;

-- ===========================================================================
-- Row Level Security. On every table, no exceptions (Step 2 §6.1).
-- ===========================================================================
create or replace function current_tenant_id() returns uuid
language sql stable security definer set search_path = public as $$
  select tenant_id from profiles where id = auth.uid();
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

alter table cities            enable row level security;
alter table districts         enable row level security;
alter table services          enable row level security;
alter table tenants           enable row level security;
alter table tenant_districts  enable row level security;
alter table partner_services  enable row level security;
alter table profiles          enable row level security;
alter table leads             enable row level security;
alter table lead_assignments  enable row level security;
alter table credit_ledger     enable row level security;
alter table messages          enable row level security;
alter table audit_log         enable row level security;

-- Public reference data: readable by anyone (this is the directory).
create policy "public read" on cities   for select using (true);
create policy "public read" on districts for select using (true);
create policy "public read" on services for select using (is_active);
create policy "public read active tenants" on tenants
  for select using (status = 'active' or id = current_tenant_id() or is_admin());
create policy "public read" on tenant_districts for select using (true);
create policy "public read" on partner_services for select using (true);

-- Own profile, or admin.
create policy "own profile" on profiles
  for select using (id = auth.uid() or is_admin());

-- Tenants see only their own assignments; admins see all.
create policy "own assignments" on lead_assignments
  for select using (tenant_id = current_tenant_id() or is_admin());
create policy "own assignments update" on lead_assignments
  for update using (tenant_id = current_tenant_id() or is_admin());

-- A partner may read only the leads actually assigned to them.
create policy "assigned leads" on leads
  for select using (
    is_admin() or exists (
      select 1 from lead_assignments la
       where la.lead_id = leads.id and la.tenant_id = current_tenant_id()
    )
  );

create policy "own ledger" on credit_ledger
  for select using (tenant_id = current_tenant_id() or is_admin());
create policy "own messages" on messages
  for select using (tenant_id = current_tenant_id() or is_admin());
create policy "admin only" on audit_log
  for select using (is_admin());

-- Anonymous lead submission: the public request form inserts, nothing else.
create policy "anon can submit lead" on leads
  for insert with check (true);

-- NOTE: admin writes (create tenant, top up credits, assign lead) run
-- server-side with the service role, which bypasses RLS by design.
