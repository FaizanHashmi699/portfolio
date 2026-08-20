/**
 * Upload constraints shared by the browser and the server.
 *
 * Kept out of `storage.ts` because that module imports `server-only`, and the uploader is
 * a Client Component. The server still enforces every one of these — the client copy is a
 * courtesy that saves a round trip, never the check that matters.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
