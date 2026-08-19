import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { riskBandLabel } from "@/domain/documents/validation";
import type { RiskAssessment } from "@/domain/documents/types";

const BAND_TONE = {
  low: "success",
  moderate: "warning",
  high: "warning",
  critical: "danger",
} as const;

/**
 * The rejection-risk panel — the feature no competitor offers.
 *
 * Every finding carries a fix, never a bare error. A customer who is told "invalid
 * document" learns nothing; one who is told their passport needs six months of validity
 * beyond entry can act today.
 */
export function RiskPanel({ risk }: { risk: RiskAssessment }) {
  return (
    <Card
      className={risk.readyToSubmit ? "border-success-500/40" : "border-warning-500/50"}
    >
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-h3 flex items-center gap-2.5">
              <ShieldAlert className="text-primary size-5" />
              Rejection risk
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              We run the same checks the government&apos;s automated screening runs —
              before you pay any fee.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold tabular-nums">
              {risk.score}
              <span className="text-muted-foreground text-base">/100</span>
            </p>
            <Badge tone={BAND_TONE[risk.band]}>{riskBandLabel(risk.band)}</Badge>
          </div>
        </div>

        {risk.findings.length === 0 ? (
          <p className="border-success-500/40 bg-success-50 dark:bg-success-900/20 mt-6 flex items-center gap-2.5 rounded-xl border p-4 text-sm">
            <CheckCircle2 className="text-success-500 size-5 shrink-0" />
            Nothing flagged. Every document we can check has passed.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {risk.findings.map((finding, index) => (
              <li
                key={`${finding.code}-${index}`}
                className="border-border rounded-xl border p-4"
              >
                <p className="flex items-start gap-2.5 font-medium">
                  {finding.severity === "blocker" ? (
                    <XCircle className="text-danger-500 mt-0.5 size-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="text-warning-600 mt-0.5 size-4 shrink-0" />
                  )}
                  {finding.message}
                </p>
                <p className="text-muted-foreground mt-2 pl-6.5 text-sm">
                  {finding.fix}
                </p>
              </li>
            ))}
          </ul>
        )}

        {!risk.readyToSubmit && (
          <p className="text-muted-foreground mt-5 text-sm">
            We won&apos;t submit while a blocker is outstanding — submitting anyway
            would spend your government fee on an application we expect to be refused.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
