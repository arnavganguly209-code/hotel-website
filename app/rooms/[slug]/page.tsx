import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/cms/store";
import { RoomDetailPage } from "@/sections/pages/RoomDetailPage";
import { bookingSearchFromParams, roomPublicSlug } from "@/lib/booking/utils";
import { SITE_URL, generateHotelRoomSchema } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/seo/page-metadata";

/** Always render from latest CMS — never serve a stale statically generated room page. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RoomDetailRouteProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: RoomDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const room = content.rooms.find((r) => r.id === slug || roomPublicSlug(r) === slug);
  if (!room) return { title: "Room Not Found" };

  const title = room.seo?.metaTitle || `${room.name} | ${content.hotel.name}`;
  const description = room.seo?.metaDescription || room.description;
  const publicSlug = roomPublicSlug(room);
  const canonical = room.seo?.canonical || `/rooms/${publicSlug}`;
  const url = canonical.startsWith("http") ? canonical : `${SITE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`;
  const image = room.seo?.ogImage || room.imageSrc || content.seo.ogImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: content.hotel.name,
      type: "website",
      images: image ? [{ url: image, width: 1200, height: 630, alt: room.seo?.altText || room.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: room.seo?.twitterImage ? [room.seo.twitterImage] : image ? [image] : undefined,
    },
  };
}

export default async function RoomDetailRoute({ params, searchParams }: RoomDetailRouteProps) {
  const { slug } = await params;
  const query = await searchParams;
  const content = await getContent();
  const room = content.rooms.find((r) => r.id === slug || roomPublicSlug(r) === slug);
  if (!room) notFound();

  const search = bookingSearchFromParams(query);
  const hasSearch = Boolean(search.checkIn && search.checkOut);

  const roomSchema = generateHotelRoomSchema({
    name: room.name,
    description: room.description,
    slug: roomPublicSlug(room),
    image: room.imageSrc,
    price: room.price,
  });

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Rooms", url: "/rooms" },
    { name: room.name, url: `/rooms/${roomPublicSlug(room)}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <RoomDetailPage
        room={room}
        search={hasSearch ? search : undefined}
        suggestedRooms={content.rooms.filter((candidate) => candidate.id !== room.id)}
        reviews={content.reviews}
      />
    </>
  );
}
