-- ────────────────────────────────────────────────────────────────────────────
-- Document storage
--
-- The bucket is private. Files are reached exclusively through short-lived
-- signed URLs issued after a server-side authorization check, never by a
-- guessable public path.
--
-- Object keys are namespaced by user id: `{user_id}/{application_id}/{file}`.
-- The policies below key off that first path segment, so the storage layer
-- enforces the same tenancy boundary the applications table does.
-- ────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760, -- 10 MB; larger uploads are almost always an unoptimised phone photo
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

drop policy if exists "documents_insert_own" on storage.objects;
create policy "documents_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_select_own" on storage.objects;
create policy "documents_select_own" on storage.objects
  for select using (
    bucket_id = 'documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
  );

drop policy if exists "documents_delete_own" on storage.objects;
create policy "documents_delete_own" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
