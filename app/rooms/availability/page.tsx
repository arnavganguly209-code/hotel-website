import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { RoomAvailabilityPage } from "@/sections/pages/RoomAvailabilityPage";
import { bookingSearchFromParams } from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

interface AvailabilityRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: `Available Rooms | ${content.hotel.name}`,
    description: "Browse available luxury rooms and suites at Hotel Thamel Park & Spa.",
  };
}

export default async function AvailabilityRoute({ searchParams }: AvailabilityRouteProps) {
  const content = await getContent();
  const params = await searchParams;
  const search = bookingSearchFromParams(params);

  return (
    <>
      <InnerPageHero
        title="Select Your Room"
        subtitle="Reservations"
        description="Discover our collection of refined accommodations, curated for an exceptional stay in Kathmandu."
        imageSrc={content.rooms[0]?.imageSrc ?? "/media/rooms/super-deluxe.jpg"}
        overlay="gold"
        height="medium"
      />
      <RoomAvailabilityPage rooms={content.rooms} search={search} />
    </>
  );
}
