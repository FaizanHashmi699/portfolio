import type { ReactNode } from "react";

// The locale layout owns <html>; this root layout only passes through.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
