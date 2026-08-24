import type { Metadata } from "next";

export const ROBOTS_OPTIONS = [
  "index,follow",
  "noindex,follow",
  "index,nofollow",
  "noindex,nofollow",
] as const;

export type RobotsValue = (typeof ROBOTS_OPTIONS)[number];

export function parseRobots(value?: string | null): Metadata["robots"] {
  const raw = (value || "index,follow").toLowerCase().replace(/\s+/g, "");
  return {
    index: !raw.includes("noindex"),
    follow: !raw.includes("nofollow"),
  };
}
