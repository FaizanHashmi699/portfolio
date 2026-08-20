-- ────────────────────────────────────────────────────────────────────────────
-- Messages, invoices and notifications.
--
-- Each carries its own row-level security policy keyed to the owning application
-- or user, so the tenancy boundary holds at the database for these tables too.
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'void');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type notification_kind as enum ('status', 'document', 'message', 'invoice', 'reminder');
exception when duplicate_object then null;
end $$;

-- ── Messages ────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  at timestamptz not null default now(),
  author_id text not null,
  author_name text not null,
  author_role text not null check (author_role in ('customer', 'staff')),
  body text not null check (length(body) between 1 and 4000),
  read_by_customer boolean not null default false,
  read_by_staff boolean not null default false
);

create index if not exists messages_application_id_idx on public.messages (application_id, at);

-- ── Invoices ────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  issued_at timestamptz not null default now(),
  due_at timestamptz not null,
  status invoice_status not null default 'draft',
  paid_at timestamptz,
  -- The same itemised lines the quote was built from. An invoice that cannot be
  -- reconciled against the published quote would defeat the entire positioning.
  lines jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0,
  vat numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  description text not null
);

create index if not exists invoices_user_id_idx on public.invoices (user_id, issued_at desc);
create index if not exists invoices_application_id_idx on public.invoices (application_id);

-- ── Notifications ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  kind notification_kind not null
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, at desc);

-- ── Row-level security ──────────────────────────────────────────────────────
alter table public.messages enable row level security;
alter table public.invoices enable row level security;
alter table public.notifications enable row level security;

-- Messages belong to whoever owns the application they hang off.
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.applications a
      where a.id = messages.application_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages
  for insert with check (
    public.is_staff()
    or exists (
      select 1 from public.applications a
      where a.id = messages.application_id and a.user_id = auth.uid()
    )
  );

-- Read receipts are the only field a participant may change; the body is immutable
-- so neither side can rewrite what was said after the fact.
drop policy if exists "messages_update_read_flags" on public.messages;
create policy "messages_update_read_flags" on public.messages
  for update using (
    public.is_staff()
    or exists (
      select 1 from public.applications a
      where a.id = messages.application_id and a.user_id = auth.uid()
    )
  );

-- Invoices are readable by their owner, writable only by staff. A customer who could
-- mark their own invoice paid would be a bookkeeping problem at best.
drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own" on public.invoices
  for select using (user_id = auth.uid() or public.is_staff());

drop policy if exists "invoices_write_staff" on public.invoices;
create policy "invoices_write_staff" on public.invoices
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());
