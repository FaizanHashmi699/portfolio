import "server-only";
import { env, features } from "@/server/env";

/**
 * Document storage.
 *
 * Uploads go browser → Supabase Storage directly, never through our serverless functions.
 * That keeps large files out of request bodies, avoids the platform's body-size limit, and
 * means a passport scan never transits (or gets logged by) our compute.
 *
 * Object keys are namespaced `{userId}/{applicationId}/{filename}`. The storage policies
 * key off that first path segment, so tenancy is enforced by the storage layer itself
 * rather than by our code remembering to check.
 */

import { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES } from "./storage-constants";

export const BUCKET = "documents";
export { ACCEPTED_MIME_TYPES, MAX_UPLOAD_BYTES };

export interface UploadTarget {
  /** Where the browser should PUT the file. Absent in demo mode. */
  uploadUrl?: string;
  /** Opaque token some storage backends require alongside the URL. */
  token?: string;
  /** The object key to record against the document. */
  path: string;
  /** True when no storage backend is configured and the upload is simulated. */
  simulated: boolean;
}

/** Strips anything that could escape the intended prefix or confuse a storage backend. */
export function safeFileName(fileName: string): string {
  const cleaned = fileName
    .replace(/[/\\]/g, "-")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-120);
  return cleaned || "document";
}

export function objectPath(
  userId: string,
  applicationId: string,
  fileName: string,
): string {
  return `${userId}/${applicationId}/${Date.now()}-${safeFileName(fileName)}`;
}

export function validateUpload(file: {
  size: number;
  type: string;
}): { ok: true } | { ok: false; reason: string } {
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      reason: `That file is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. Most oversized uploads are unoptimised phone photos — try exporting as PDF.`,
    };
  }
  if (
    !ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])
  ) {
    return {
      ok: false,
      reason: "Government portals reliably accept only PDF, JPEG, PNG and WebP.",
    };
  }
  return { ok: true };
}

async function serviceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Mint a one-shot upload target. The caller must have already authorised the user
 * against the application — this function trusts its inputs by design.
 */
export async function createUploadTarget(
  userId: string,
  applicationId: string,
  fileName: string,
): Promise<UploadTarget> {
  const path = objectPath(userId, applicationId, fileName);

  if (!features.database) {
    return { path, simulated: true };
  }

  const supabase = await serviceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(
      `Could not prepare the upload: ${error?.message ?? "unknown error"}`,
    );
  }

  return { uploadUrl: data.signedUrl, token: data.token, path, simulated: false };
}

/**
 * Short-lived signed URL for reading a document back.
 *
 * Deliberately short: a link that leaks from an email or a screenshot should stop working
 * quickly. Ten minutes is long enough to open a file and short enough to be useless later.
 */
export async function createDownloadUrl(
  path: string,
  expiresInSeconds = 600,
): Promise<string | null> {
  if (!features.database) return null;

  const supabase = await serviceClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) return null;
  return data.signedUrl;
}

export async function deleteObject(path: string): Promise<void> {
  if (!features.database) return;
  const supabase = await serviceClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
