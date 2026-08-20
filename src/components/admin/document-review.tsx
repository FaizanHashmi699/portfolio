"use client";

import { useActionState } from "react";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { reviewDocument, type AdminActionState } from "@/server/actions/applications";
import type { DocumentRecord } from "@/domain/documents/types";
import { formatDate } from "@/lib/utils";

const INITIAL: AdminActionState = { status: "idle" };

/**
 * Human review of one document.
 *
 * Automated validation catches mechanical failures. It cannot judge whether a scan is
 * legible or a stamp looks genuine. Rejection requires a written reason, because a
 * rejection without one puts the customer straight back into the dark.
 */
export function DocumentReview({
  applicationId,
  document,
  downloadUrl,
}: {
  applicationId: string;
  document: DocumentRecord;
  downloadUrl?: string | null;
}) {
  const [state, action, pending] = useActionState(reviewDocument, INITIAL);

  return (
    <div className="border-border rounded-xl border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            <FileText className="text-muted-foreground size-4 shrink-0" />
            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary truncate underline underline-offset-4"
              >
                {document.fileName}
              </a>
            ) : (
              <span className="truncate">{document.fileName}</span>
            )}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {document.kind} · {(document.sizeBytes / 1024).toFixed(0)} KB · uploaded{" "}
            {formatDate(document.uploadedAt)}
          </p>
        </div>

        {document.reviewDecision === "accepted" && (
          <Badge tone="success">
            <CheckCircle2 /> Accepted
          </Badge>
        )}
        {document.reviewDecision === "rejected" && (
          <Badge tone="danger">
            <XCircle /> Rejected
          </Badge>
        )}
        {!document.reviewDecision && <Badge tone="neutral">Not yet reviewed</Badge>}
      </div>

      {document.reviewedAt && (
        <p className="text-muted-foreground border-border mt-3 border-t pt-3 text-sm">
          Reviewed by {document.reviewedBy} on {formatDate(document.reviewedAt)}
          {document.reviewNote && <> — &ldquo;{document.reviewNote}&rdquo;</>}
        </p>
      )}

      <details className="mt-3">
        <summary className="text-primary cursor-pointer text-sm font-medium">
          {document.reviewDecision ? "Change this review" : "Review this document"}
        </summary>

        <form action={action} className="mt-3 space-y-3">
          <input type="hidden" name="applicationId" value={applicationId} />
          <input type="hidden" name="documentId" value={document.id} />

          <label htmlFor={`note-${document.id}`} className="sr-only">
            Reason, shown to the customer
          </label>
          <Textarea
            id={`note-${document.id}`}
            name="note"
            rows={2}
            placeholder="What the customer needs to know. Required when rejecting."
          />

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

          <div className="flex flex-wrap gap-2.5">
            <Button
              type="submit"
              name="decision"
              value="accepted"
              variant="outline"
              size="sm"
              disabled={pending}
            >
              <CheckCircle2 className="size-4" />
              Accept
            </Button>
            <Button
              type="submit"
              name="decision"
              value="rejected"
              variant="outline"
              size="sm"
              className="border-danger-500/40 text-danger-600 dark:text-danger-500"
              disabled={pending}
            >
              <XCircle className="size-4" />
              Reject
            </Button>
          </div>
        </form>
      </details>
    </div>
  );
}
