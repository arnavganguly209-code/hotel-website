import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { InnerPageHero } from "@/components/shared/InnerPageHero";
import { RoomDetailPage } from "@/sections/pages/RoomDetailPage";
import { bookingSearchFromParams } from "@/lib/booking/utils";

interface RoomDetailRouteProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: RoomDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const room = content.rooms.find((r) => r.id === slug);
  if (!room) return { title: "Room Not Found" };
  return {
    title: `${room.name} | ${content.hotel.name}`,
    description: room.description,
  };
}

export async function generateStaticParams() {
  const content = await getContent();
  return content.rooms.map((room) => ({ slug: room.id }));
}

export default async function RoomDetailRoute({ params, searchParams }: RoomDetailRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const content = await getContent();
  const room = content.rooms.find((r) => r.id === slug);
  if (!room) notFound();

  const search = bookingSearchFromParams(query);
  const hasSearch = Boolean(search.checkIn && search.checkOut);

  return (
    <>
      <InnerPageHero
        title={room.name}
        subtitle="Accommodations"
        description={room.description}
        imageSrc={room.imageSrc}
        overlay="gold"
        height="medium"
      />
      <RoomDetailPage room={room} booking={content.roomBooking} search={hasSearch ? search : undefined} />
    </>
  );
}
