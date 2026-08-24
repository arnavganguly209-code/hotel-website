import type { Metadata } from "next";
import { getContent } from "@/lib/cms/store";
import { buildBreadcrumbSchema } from "@/lib/seo/page-metadata";
import { metadataForPath } from "@/lib/seo/page-catalog";
import { RoomsPage } from "@/sections/pages/RoomsPage";
import { bookingSearchFromParams } from "@/lib/booking/utils";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <RoomsPage
        rooms={content.rooms}
        page={content.roomsPage}
        search={search}
        hasSearch={hasSearch}
      />
    </>
  );
}
