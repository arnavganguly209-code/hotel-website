"use client";

import { useEffect } from "react";

/** Registers a media-safe service worker and purges stale media caches. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        registration.active?.postMessage({ type: "PURGE_MEDIA_CACHE" });
        // Drop any legacy SW caches that still hold /media assets
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("htp-static-") && key !== "htp-static-v3-no-media")
              .map((key) => caches.delete(key))
          );
        }
      } catch {
        // Silent — PWA is progressive enhancement
      }
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", () => void register(), { once: true });
    }
  }, []);

  return null;
}
