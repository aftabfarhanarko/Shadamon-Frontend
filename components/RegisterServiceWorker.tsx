'use client'

import { useEffect } from "react"

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // In dev, a previously-registered service worker can serve stale JS/CSS and
    // make the app look "unstyled". Avoid SW entirely outside production.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });

      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }

      return;
    }

    // Production: ensure we update the SW even if the browser/CDN caches `sw.js`.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        const activeUrl = registration.active?.scriptURL;
        if (!activeUrl) return;
        try {
          const pathname = new URL(activeUrl).pathname;
          if (pathname !== "/sw.js") registration.unregister();
        } catch {
          // ignore
        }
      });
    });

    navigator.serviceWorker
      // `updateViaCache` helps prevent a stale SW from keeping the app unstyled.
      .register("/sw.js", { updateViaCache: "none" as any })
      .then((registration) => registration.update?.())
      .catch(() => {
        // ignore
      });
  }, [])

  return null
}
