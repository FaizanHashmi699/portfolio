import { Card, CardContent } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-8 pb-8">
        <h1 className="font-display text-h2">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        )}
        <div className="mt-7">{children}</div>
        {footer && (
          <div className="border-border text-muted-foreground mt-7 border-t pt-5 text-sm">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
