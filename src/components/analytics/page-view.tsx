"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reports a page view.
 *
 * Uses `sendBeacon` where available so the request survives the page being closed and
 * never delays navigation. Fails silently: an analytics outage must never be visible to a
 * customer, and there is no retry queue because a lost pageview costs nothing.
 */
export function PageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const payload = JSON.stringify({
      path: pathname,
      locale: document.documentElement.lang || undefined,
    });

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/analytics",
          new Blob([payload], { type: "application/json" }),
        );
      } else {
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* analytics must never surface to the user */
    }
  }, [pathname]);

  return null;
}
