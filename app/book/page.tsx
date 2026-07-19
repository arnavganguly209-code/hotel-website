import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { LuxuryBookingCheckout } from "@/components/booking/LuxuryBookingCheckout";
import { bookingSearchFromParams, roomPublicSlug } from "@/lib/booking/utils";

export const dynamic = "force-dynamic";

interface BookRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return {
    title: `Book Your Stay | ${content.hotel.name}`,
    description: "Complete your luxury room reservation at Hotel Thamel Park.",
  };
}

export default async function BookRoute({ searchParams }: BookRouteProps) {
  const content = await getContent();
  const params = await searchParams;
  const slug = Array.isArray(params.room) ? params.room[0] : params.room;
  const room = content.rooms.find((r) => r.id === slug || roomPublicSlug(r) === slug);
  if (!room) notFound();

  const search = bookingSearchFromParams(params);

  return (
    <>
      <InnerPageHero
        title="Reserve Your Stay"
        subtitle="Booking"
        description={`Complete your reservation for the ${room.name}.`}
        imageSrc={room.imageSrc}
        overlay="gold"
        height="medium"
      />
      <section className="section-padding bg-gradient-to-b from-luxury-cream-light to-luxury-sage/20">
        <LuxuryBookingCheckout room={room} booking={content.roomBooking} search={search} />
      </section>
    </>
  );
}
