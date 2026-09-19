import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { metadataForPath } from "@/lib/seo/page-catalog";
import { RoomsPage } from "@/sections/pages/RoomsPage";
import {
  bookingSearchFromParams,
  isLiveRoomCategory,
  isRoomAvailableForSearch,
  roomPublicSlug,
} from "@/lib/booking/utils";
import { getAvailableCount } from "@/lib/admin/availability";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();
  return metadataForPath(content, "/rooms");
}

interface RoomsRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RoomsRoute({ searchParams }: RoomsRouteProps) {
  const content = await getContent();
  const params = await searchParams;
  const search = bookingSearchFromParams(params);
  const hasSearch = Boolean(search.checkIn || search.checkOut);
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Rooms", url: "/rooms" },
  ]);

  const roomQty = Math.max(1, Number(search.rooms) || 1);
  let rooms = content.rooms;
  let unavailableMessage = "";

  if (hasSearch && search.checkIn && search.checkOut) {
    const withStock = await Promise.all(
      content.rooms.map(async (room) => {
        if (!isLiveRoomCategory(room) || !isRoomAvailableForSearch(room, search)) {
          return { room, stockOk: false };
        }
        const stock = await getAvailableCount({
          roomSlug: roomPublicSlug(room),
          checkIn: search.checkIn!,
          checkOut: search.checkOut!,
        });
        return { room, stockOk: stock.available >= roomQty };
      })
    );
    rooms = withStock.filter((r) => r.stockOk).map((r) => r.room);
    if (rooms.length === 0) {
      unavailableMessage = `No rooms available for ${search.checkIn} – ${search.checkOut}. Please try other dates.`;
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <RoomsPage
        rooms={rooms}
        page={content.roomsPage}
        search={search}
        hasSearch={hasSearch}
        unavailableMessage={unavailableMessage}
      />
    </>
  );
}
