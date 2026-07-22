import { db, isDatabaseAvailable } from "@/lib/db";

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Fire-and-forget daily visit counter. Never throws — safe to call without awaiting
 * from a Server Component render path.
 */
export function trackSiteVisit(): void {
  if (!isDatabaseAvailable()) return;
  const day = startOfDay();
  db.siteVisitDay
    .upsert({
      where: { day },
      create: { day, count: 1 },
      update: { count: { increment: 1 } },
    })
    .catch(() => {
      /* ignore analytics failures */
    });
}
