export const adminField =
  "w-full rounded-sm border border-rule bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
export const adminLabel = "block text-[11px] uppercase tracking-[0.12em] text-ink-mute mb-1.5";

export function Stat({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "brand" | "accent";
}) {
  const valueTone =
    tone === "brand" ? "text-brand-deep" : tone === "accent" ? "text-accent" : "text-ink";
  return (
    <div className="rounded-sm border border-rule bg-surface p-5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <p className={`mt-1.5 font-display text-3xl font-medium tabular-nums ${valueTone}`}>{value}</p>
      {note && <p className="mt-1 text-xs leading-snug text-ink-soft">{note}</p>}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  new: "bg-accent-wash text-accent",
  contacted: "bg-brand-wash text-brand-deep",
  enrolled: "bg-brand text-white",
  closed: "bg-surface-2 text-ink-mute",
  pending: "bg-accent-wash text-accent",
  paid: "bg-brand text-white",
  failed: "bg-surface-2 text-ink-mute",
  cancelled: "bg-surface-2 text-ink-mute",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        STATUS_TONES[status] ?? "bg-surface-2 text-ink-mute"
      }`}
    >
      {status}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-rule bg-surface p-10 text-center text-sm text-ink-mute">
      {children}
    </div>
  );
}

export function PageTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-7">
      <h1 className="font-display text-3xl font-medium tracking-tight">{title}</h1>
      {note && <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">{note}</p>}
    </div>
  );
}
