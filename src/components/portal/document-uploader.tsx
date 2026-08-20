"use client";

import { useActionState, useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import {
  attachDocument,
  prepareDocumentUpload,
  type PortalState,
} from "@/server/actions/portal";
import {
  ACCEPTED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/server/services/storage-constants";
import type { DocumentRequirement } from "@/domain/catalog/types";

const INITIAL: PortalState = { status: "idle" };

const KINDS = [
  { value: "passport", label: "Passport" },
  { value: "photo", label: "Passport photograph" },
  { value: "emirates-id", label: "Emirates ID" },
  { value: "degree", label: "Degree certificate" },
  { value: "marriage-certificate", label: "Marriage certificate" },
  { value: "birth-certificate", label: "Birth certificate" },
  { value: "salary-certificate", label: "Salary certificate" },
  { value: "bank-statement", label: "Bank statement" },
  { value: "employment-offer", label: "Employment offer" },
  { value: "tenancy-ejari", label: "Ejari tenancy contract" },
  { value: "title-deed", label: "Property title deed" },
  { value: "insurance", label: "Health insurance" },
  { value: "other", label: "Something else" },
] as const;

/** Which extra fields we need in order to actually check this kind of document. */
const FIELDS_BY_KIND: Record<
  string,
  ("expiry" | "name" | "attestation" | "photo" | "issue")[]
> = {
  passport: ["name", "expiry"],
  photo: ["photo"],
  "emirates-id": ["name", "expiry"],
  degree: ["name", "attestation"],
  "marriage-certificate": ["name", "attestation"],
  "birth-certificate": ["name", "attestation"],
  "salary-certificate": ["name", "issue"],
  "bank-statement": ["issue"],
  "employment-offer": ["name"],
  insurance: ["expiry"],
};

/**
 * Two-step upload: the file goes browser → storage directly, then a Server Action records
 * the metadata and runs validation.
 *
 * The extra fields are asked for rather than guessed. Without a vision model configured we
 * genuinely cannot read the document, and inventing an expiry date would be far worse than
 * asking for one — the whole product rests on these checks being right.
 */
export function DocumentUploader({
  applicationId,
  requirements,
}: {
  applicationId: string;
  requirements: DocumentRequirement[];
}) {
  const [state, action, pending] = useActionState(attachDocument, INITIAL);
  const [kind, setKind] = useState<string>(requirements[0]?.id ?? "passport");
  const [file, setFile] = useState<File | null>(null);
  const [storagePath, setStoragePath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const needed = FIELDS_BY_KIND[kind] ?? [];

  async function handleFile(selected: File | null) {
    setUploadError(null);
    setStoragePath("");
    setFile(selected);
    if (!selected) return;

    if (selected.size > MAX_UPLOAD_BYTES) {
      setUploadError(
        `That file is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. Most oversized uploads are unoptimised phone photos.`,
      );
      setFile(null);
      return;
    }

    setUploading(true);
    try {
      const target = await prepareDocumentUpload({
        applicationId,
        fileName: selected.name,
        size: selected.size,
        contentType: selected.type,
      });

      if (!target.ok) {
        setUploadError(target.reason);
        setFile(null);
        return;
      }

      // With storage configured the file goes straight there and never touches our
      // serverless functions. In demo mode there is nowhere to put it, so we record the
      // metadata only — validation runs on the fields either way.
      if (target.uploadUrl) {
        const response = await fetch(target.uploadUrl, {
          method: "PUT",
          body: selected,
          headers: { "Content-Type": selected.type },
        });
        if (!response.ok) {
          setUploadError("The upload didn't complete. Please try again.");
          setFile(null);
          return;
        }
      }

      setStoragePath(target.path);
    } catch {
      setUploadError("The upload didn't complete. Please try again.");
      setFile(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-display text-h3 flex items-center gap-2.5">
          <Upload className="text-primary size-5" />
          Upload a document
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Checked the moment you upload it — before any government fee is spent.
        </p>

        <form action={action} className="mt-6 space-y-5">
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="storagePath" value={storagePath} />
          <input type="hidden" name="fileName" value={file?.name ?? ""} />
          <input type="hidden" name="sizeBytes" value={file?.size ?? 0} />
          <input type="hidden" name="mimeType" value={file?.type ?? ""} />

          <Field label="What is this document?" htmlFor="kind">
            <Select
              id="kind"
              name="kind"
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            >
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Choose a file"
            htmlFor="file"
            hint={`PDF, JPEG, PNG or WebP. Up to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB. A clear colour scan beats a photo of a screen.`}
          >
            <input
              ref={inputRef}
              id="file"
              type="file"
              accept={ACCEPTED_MIME_TYPES.join(",")}
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              className="border-border bg-surface-raised file:bg-surface file:text-foreground w-full rounded-xl border px-4 py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-1.5 file:text-sm file:font-medium"
            />
          </Field>

          {uploading && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Uploading…
            </p>
          )}

          {uploadError && (
            <p role="alert" className="text-danger-600 dark:text-danger-500 text-sm">
              {uploadError}
            </p>
          )}

          {storagePath && !uploading && (
            <p className="text-success-600 flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4" />
              {file?.name} ready
            </p>
          )}

          {needed.length > 0 && storagePath && (
            <fieldset className="border-border space-y-4 rounded-xl border p-4">
              <legend className="px-1.5 text-sm font-medium">
                A few details so we can check it
              </legend>

              {needed.includes("name") && (
                <Field
                  label="Full name on the document"
                  htmlFor="fullName"
                  hint="We compare this across every document — a mismatch is a blocker."
                >
                  <Input id="fullName" name="fullName" />
                </Field>
              )}

              {needed.includes("expiry") && (
                <Field label="Expiry date" htmlFor="expiryDate">
                  <Input id="expiryDate" name="expiryDate" type="date" />
                </Field>
              )}

              {needed.includes("issue") && (
                <Field label="Issue date" htmlFor="issueDate">
                  <Input id="issueDate" name="issueDate" type="date" />
                </Field>
              )}

              {needed.includes("attestation") && (
                <Field
                  label="Which attestation stamps does it carry?"
                  htmlFor="attestationStamps"
                  hint="Tick everything already on the document. We'll tell you what's still missing."
                >
                  <div className="space-y-2">
                    {[
                      { value: "notary", label: "Notary or issuing authority" },
                      { value: "home-mofa", label: "Your country's foreign ministry" },
                      { value: "uae-embassy", label: "UAE embassy in that country" },
                      { value: "uae-mofa", label: "UAE Ministry of Foreign Affairs" },
                    ].map((stamp) => (
                      <label
                        key={stamp.value}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="attestationStamps"
                          value={stamp.value}
                          className="size-4 accent-[var(--accent)]"
                        />
                        {stamp.label}
                      </label>
                    ))}
                  </div>
                </Field>
              )}

              {needed.includes("photo") && (
                <Field
                  label="Is the background plain white?"
                  htmlFor="backgroundIsWhite"
                  hint="Cream, grey and patterned backgrounds are rejected."
                >
                  <Select
                    id="backgroundIsWhite"
                    name="backgroundIsWhite"
                    defaultValue="yes"
                  >
                    <option value="yes">Yes, plain white</option>
                    <option value="no">No, or I&rsquo;m not sure</option>
                  </Select>
                </Field>
              )}
            </fieldset>
          )}

          {state.message && (
            <p
              role={state.status === "error" ? "alert" : "status"}
              className={
                state.status === "error"
                  ? "text-danger-600 dark:text-danger-500 text-sm"
                  : "text-success-600 text-sm"
              }
            >
              {state.message}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={pending || uploading || !storagePath}
          >
            {pending ? "Checking…" : "Upload and check"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
