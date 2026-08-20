-- ────────────────────────────────────────────────────────────────────────────
-- Notification preferences on profiles.
--
-- Stored as JSONB rather than columns because the set of preferences will change
-- as channels are added (WhatsApp is planned), and a JSONB default avoids a
-- migration every time. They are always read and written as a whole.
-- ────────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists notification_preferences jsonb not null default
    '{"emailStatusUpdates": true, "emailExpiryReminders": true, "emailProductUpdates": false}'::jsonb;

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists nationality text;
