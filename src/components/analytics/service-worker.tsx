"use client";

import { useEffect } from "react";

/**
 * Registers the service worker.
 *
 * Deferred until after load so it never competes with the first paint for bandwidth on a
 * slow connection — which is exactly the connection it exists to help.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* a failed registration must never surface to the user */
      });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
