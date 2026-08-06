import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { LuxuryBookingCheckout } from "@/components/booking/LuxuryBookingCheckout";
import { bookingSearchFromParams, roomPublicSlug } from "@/lib/booking/utils";
import { buildBreadcrumbSchema, buildPageMetadata } from "@/lib/seo/page-metadata";
import { roomDetailPath } from "@/lib/navigation";

export const dynamic = "force-dynamic";

interface ReserveRouteProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: ReserveRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const room = content.rooms.find((r) => r.id === slug || roomPublicSlug(r) === slug);
  if (!room) return { title: "Reserve" };

  const publicSlug = roomPublicSlug(room);
  const path = `/rooms/${publicSlug}/reserve`;

  return buildPageMetadata(
    {
      title: `Reserve ${room.name} | ${content.hotel.name}`,
      description: `Complete your reservation for ${room.name} at ${content.hotel.name}. Secure online or pay-at-hotel options.`,
      canonical: path,
    },
    path,
    content.hotel.name
  );
}

export default async function ReserveRoute({ params, searchParams }: ReserveRouteProps) {
  const content = await getContent();
  const { slug } = await params;
  const room = content.rooms.find((r) => r.id === slug || roomPublicSlug(r) === slug);
  if (!room) notFound();

  const paramsResolved = await searchParams;
  const search = bookingSearchFromParams(paramsResolved);
  const publicSlug = roomPublicSlug(room);

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Rooms", url: "/rooms" },
    { name: room.name, url: roomDetailPath(publicSlug) },
    { name: "Reserve", url: `/rooms/${publicSlug}/reserve` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
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
