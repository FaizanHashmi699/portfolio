/*
 * Service worker.
 *
 * Scope is deliberately narrow. This caches the static shell and serves an offline page
 * when navigation fails — nothing more.
 *
 * It must never cache an authenticated response. A cached portal page would mean one
 * person's application data sitting in another person's browser storage on a shared
 * device, which is a realistic scenario for our customers. Requests to /portal, /admin
 * and /api are passed straight to the network and never touched.
 */

const VERSION = "maqam-v1";
const OFFLINE_URL = "/offline";

const PRECACHE = [OFFLINE_URL, "/icon.svg", "/icon-maskable.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isPrivate(url) {
  return (
    url.pathname.startsWith("/portal") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/sign-in") ||
    url.pathname.startsWith("/sign-up")
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url)) return;

  // Navigations: network first, offline page as the fallback. Serving a stale page
  // would be worse than saying plainly that the connection is down, because fees and
  // requirements change.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
      ),
    );
    return;
  }

  // Immutable build assets: cache first, since their URLs change when they change.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
