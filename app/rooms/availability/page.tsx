import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getContent } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

interface AvailabilityRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: `Available Rooms | ${content.hotel.name}`,
    description: "Browse available luxury rooms and suites at Hotel Thamel Park.",
  };
}

export default async function AvailabilityRoute({ searchParams }: AvailabilityRouteProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value) query.set(key, value);
  }
  redirect(`/rooms${query.size ? `?${query.toString()}` : ""}`);
}
