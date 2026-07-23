"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePerformanceSettings } from "@/components/shared/PerformanceProvider";

const POLL_MS = 12_000;

/**
 * Keeps open public tabs in sync with Orbit mediaRevision.
 * When Orbit uploads/replaces/deletes (revision bumps), refreshes RSC tree
 * so deleted media never sticks in an open tab.
 */
export function MediaLiveSync() {
  const router = useRouter();
  const perf = usePerformanceSettings();
  const known = useRef(perf.mediaRevision || "");

  useEffect(() => {
    known.current = perf.mediaRevision || "";
  }, [perf.mediaRevision]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const schedule = () => {
      if (cancelled) return;
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(run, POLL_MS);
    };

    const run = async () => {
      try {
        const res = await fetch("/api/media-revision", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { mediaRevision?: string };
        const next = String(data.mediaRevision || "");
        if (next && next !== known.current) {
          known.current = next;
          router.refresh();
        }
      } catch {
        /* network blip — retry next interval */
      } finally {
        schedule();
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void run();
    };

    schedule();
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}
