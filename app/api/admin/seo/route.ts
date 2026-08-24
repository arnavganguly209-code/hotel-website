import { NextResponse } from "next/server";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { getContent, saveContent } from "@/lib/cms/store";
import { revalidateSiteContent } from "@/lib/cms/revalidate";
import { resolveSiteContact } from "@/lib/cms/contact";
import { applyRouteSeo, listPublicSeo, PUBLIC_SEO_PAGES } from "@/lib/seo/page-catalog";
import { roomPublicSlug } from "@/lib/booking/utils";
import type { PageSeo } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const content = await getContent();
  const pages = listPublicSeo(content);
  const rooms = content.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    slug: roomPublicSlug(room),
    seo: {
      metaTitle: room.seo?.metaTitle || "",
      metaDescription: room.seo?.metaDescription || "",
      canonical: room.seo?.canonical || `/rooms/${roomPublicSlug(room)}`,
      ogImage: room.seo?.ogImage || room.imageSrc || "",
      ogTitle: room.seo?.ogTitle || "",
      ogDescription: room.seo?.ogDescription || "",
      robots: room.seo?.robots || "index,follow",
      altText: room.seo?.altText || "",
    },
  }));
  const articles = content.articles
    .filter((a) => a.status !== "trash")
    .map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
      seo: a.seo,
    }));

  return NextResponse.json({
    success: true,
    pages,
    rooms,
    articles,
    contact: resolveSiteContact(content),
    social: content.hotel.social,
    globalSeo: content.seo,
    catalog: PUBLIC_SEO_PAGES,
  });
}

export async function PUT(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      section?: "page" | "room" | "contact" | "global";
      path?: string;
      roomId?: string;
      seo?: PageSeo & { metaTitle?: string; metaDescription?: string; altText?: string };
      contact?: Record<string, string>;
      social?: Record<string, string>;
      globalSeo?: { title?: string; description?: string; ogImage?: string; robotsAllow?: boolean };
    };

    let content = await getContent();

    if (body.section === "page" && body.path && body.seo) {
      content = applyRouteSeo(content, body.path, {
        title: body.seo.title || "",
        description: body.seo.description || "",
        canonical: body.seo.canonical,
        ogImage: body.seo.ogImage,
        ogTitle: body.seo.ogTitle,
        ogDescription: body.seo.ogDescription,
        robots: body.seo.robots || "index,follow",
      });
    }

    if (body.section === "room" && body.roomId && body.seo) {
      const index = content.rooms.findIndex((r) => r.id === body.roomId);
      if (index === -1) {
        return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
      }
      const room = content.rooms[index];
      const slug = roomPublicSlug(room);
      content.rooms[index] = {
        ...room,
        seo: {
          metaTitle: body.seo.metaTitle || body.seo.title || "",
          metaDescription: body.seo.metaDescription || body.seo.description || "",
          canonical: body.seo.canonical || `/rooms/${slug}`,
          ogImage: body.seo.ogImage || room.imageSrc || "",
          twitterImage: room.seo?.twitterImage || "",
          altText: body.seo.altText || room.seo?.altText || room.name,
          ogTitle: body.seo.ogTitle,
          ogDescription: body.seo.ogDescription,
          robots: body.seo.robots || "index,follow",
        },
      };
    }

    if (body.section === "contact" && body.contact) {
      const c = body.contact;
      content.hotel = {
        ...content.hotel,
        phone: c.phone ?? content.hotel.phone,
        mobile: c.mobile ?? content.hotel.mobile,
        email: c.email ?? content.hotel.email,
        reservationEmail: c.reservationEmail ?? content.hotel.reservationEmail,
        enquiryEmail: c.enquiryEmail ?? content.hotel.enquiryEmail,
        whatsapp: c.whatsapp ?? content.hotel.whatsapp,
        address: c.address ?? content.hotel.address,
        hours: c.hours ?? content.hotel.hours,
        social: {
          ...content.hotel.social,
          ...(body.social || {}),
        },
      };
      content.header = { ...content.header, phone: content.hotel.phone };
      content.footer = {
        ...content.footer,
        contact: {
          ...content.footer.contact,
          phone: content.hotel.phone,
          email: content.hotel.email,
          location: content.hotel.address,
        },
        social: {
          ...content.footer.social,
          facebook: content.hotel.social.facebook || content.footer.social.facebook,
          instagram: content.hotel.social.instagram || content.footer.social.instagram,
        },
      };
      content.contactPage = {
        ...content.contactPage,
        phone: content.hotel.phone,
        email: content.hotel.email,
        whatsapp: content.hotel.whatsapp || content.contactPage.whatsapp,
        address: content.hotel.address,
      };
    }

    if (body.section === "global" && body.globalSeo) {
      content.seo = {
        ...content.seo,
        title: body.globalSeo.title ?? content.seo.title,
        description: body.globalSeo.description ?? content.seo.description,
        ogImage: body.globalSeo.ogImage ?? content.seo.ogImage,
        robotsAllow:
          typeof body.globalSeo.robotsAllow === "boolean"
            ? body.globalSeo.robotsAllow
            : content.seo.robotsAllow,
      };
    }

    await saveContent(content);
    revalidateSiteContent();

    return NextResponse.json({
      success: true,
      pages: listPublicSeo(content),
      contact: resolveSiteContact(content),
      globalSeo: content.seo,
    });
  } catch (error) {
    console.error("[AdminSEO]", error);
    return NextResponse.json({ success: false, error: "Unable to save" }, { status: 500 });
  }
}
