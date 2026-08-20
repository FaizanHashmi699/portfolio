import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-foreground block text-sm font-medium", className)}
      {...props}
    />
  );
}

const controlBase =
  "w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-[0.95rem] text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-ring disabled:opacity-50";

export function Input({
  className,
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement>;
}) {
  return <input ref={ref} className={cn(controlBase, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlBase, "min-h-28", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlBase, "h-11 pr-10", className)} {...props} />;
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-danger-600 dark:text-danger-500 mt-1.5 text-sm">
      {children}
    </p>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {hint && <p className="text-muted-foreground mt-1 text-sm">{hint}</p>}
      <div className="mt-2">{children}</div>
      <FieldError>{error}</FieldError>
    </div>
  );
}
