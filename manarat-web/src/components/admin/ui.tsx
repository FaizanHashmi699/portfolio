export const adminField =
  "w-full rounded-[10px] border border-rule bg-surface px-4 py-2.5 text-[0.92rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-brand focus:ring-4 focus:ring-brand/15";
export const adminLabel =
  "mb-2 block text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink-mute";
export const adminButton =
  "inline-flex items-center justify-center gap-2 rounded-chip bg-brand px-5 py-2.5 text-[0.88rem] font-bold text-white shadow-brand transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-55 disabled:shadow-none";
export const adminButtonQuiet =
  "inline-flex items-center justify-center gap-2 rounded-chip border border-rule bg-surface px-5 py-2.5 text-[0.88rem] font-bold text-brand-deep transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-brand hover:shadow-sm";

/** One card treatment for every admin panel. */
export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-rule bg-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: string;
  /** `attention` marks a figure that wants someone to act on it. */
  tone?: "default" | "brand" | "accent";
}) {
  const attention = tone === "accent";
  return (
    <div
      className={`relative overflow-hidden rounded-card border bg-surface p-6 shadow-sm ${
        attention ? "border-brand" : "border-rule"
      }`}
    >
      {attention && <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-brand" />}
      <p className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-ink-mute">{label}</p>
      <p
        className={`mt-2 font-display text-[2.1rem] font-extrabold leading-none tabular-nums tracking-tight ${
          tone === "default" ? "text-ink" : "text-brand-deep"
        }`}
      >
        {value}
      </p>
      {note && <p className="mt-2 text-xs leading-[1.6] text-ink-soft">{note}</p>}
    </div>
  );
}

/**
 * Status colours stay inside the brand palette, so weight and fill carry the
 * meaning instead of hue: solid = done, outlined = needs attention, grey = closed.
 */
const STATUS_TONES: Record<string, string> = {
  new: "border border-brand bg-brand-wash text-brand-deep",
  contacted: "border border-rule bg-brand-wash text-brand-mid",
  enrolled: "border border-brand bg-brand text-white",
  closed: "border border-rule bg-surface-2 text-ink-mute",
  pending: "border border-brand bg-brand-wash text-brand-deep",
  processing: "border border-rule bg-brand-wash text-brand-mid",
  paid: "border border-brand bg-brand text-white",
  failed: "border border-rule bg-surface-2 text-ink-soft",
  cancelled: "border border-rule bg-surface-2 text-ink-mute",
  refunded: "border border-rule bg-surface-2 text-ink-soft",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-chip px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${
        STATUS_TONES[status] ?? "border border-rule bg-surface-2 text-ink-mute"
      }`}
    >
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-rule bg-surface p-12 text-center text-sm leading-[1.7] text-ink-mute">
      {children}
    </div>
  );
}

export function PageTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-8 border-b border-rule pb-6">
      <h1 className="font-display text-[clamp(1.7rem,3.4vw,2.2rem)] font-extrabold tracking-tight text-brand-deep">
        {title}
      </h1>
      {note && <p className="mt-2.5 max-w-2xl text-[0.95rem] leading-[1.7] text-ink-soft">{note}</p>}
    </div>
  );
}

/**
 * The one table shell used across the admin. `minWidth` keeps columns legible
 * on narrow screens; the wrapper scrolls rather than the page.
 */
export function AdminTable({
  head,
  children,
  minWidth = 560,
}: {
  head: { label: string; align?: "left" | "right" }[];
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-card border border-rule bg-surface shadow-sm">
      <table className="w-full text-[0.9rem]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-rule bg-surface-2/60 text-left text-[0.62rem] uppercase tracking-[0.14em] text-ink-mute">
            {head.map((h) => (
              <th
                key={h.label}
                scope="col"
                className={`px-5 py-3.5 font-bold ${h.align === "right" ? "text-right" : ""}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const adminRow =
  "border-b border-rule-soft transition-colors last:border-0 hover:bg-surface-2/50";
export const adminCell = "px-5 py-3.5 align-middle";
