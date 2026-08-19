import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/server/repositories/types";

/**
 * Status copy is written from the customer's point of view, not the operator's.
 * "With the authority" tells them what is happening; "SUBMITTED_PENDING_REVIEW" does not.
 */
const STATUS: Record<
  ApplicationStatus,
  {
    label: string;
    tone: "neutral" | "brand" | "accent" | "success" | "warning" | "danger";
  }
> = {
  draft: { label: "Draft", tone: "neutral" },
  "documents-pending": { label: "Waiting on you", tone: "warning" },
  "in-review": { label: "We're reviewing", tone: "brand" },
  submitted: { label: "Submitted", tone: "brand" },
  "with-authority": { label: "With the authority", tone: "accent" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Refused", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = STATUS[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

export function statusLabel(status: ApplicationStatus): string {
  return STATUS[status].label;
}
