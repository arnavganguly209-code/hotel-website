import { NextResponse } from "next/server";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { generatePayLinkToken } from "@/lib/pay-links/token";
import { canEditPayLink, normalizeUsdAmount, publicPayUrl } from "@/lib/pay-links/money";

export const dynamic = "force-dynamic";

function serialize(link: {
  publicToken: string;
  rawInquiry?: unknown;
  rawCallback?: unknown;
  [key: string]: unknown;
}) {
  const { rawInquiry: _rawInquiry, rawCallback: _rawCallback, ...rest } = link;
  return {
    ...rest,
    publicUrl: publicPayUrl(link.publicToken),
  };
}

export async function GET() {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const links = await db.paymentLink.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(
    { success: true, links: links.map(serialize) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  try {
    const body = (await req.json()) as {
      customerName?: string;
      customerEmail?: string;
      amountUsd?: number | string;
      title?: string;
      description?: string;
      imageUrl?: string;
      internalReference?: string;
      expiresAt?: string;
    };
    const customerName = String(body.customerName || "").trim();
    const title = String(body.title || "").trim();
    const amountUsd = normalizeUsdAmount(body.amountUsd);
    if (!customerName || !title || amountUsd == null) {
      return NextResponse.json(
        { success: false, error: "Customer name, title, and a valid USD amount are required." },
        { status: 400 }
      );
    }
    const email = String(body.customerEmail || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    }

    let token = generatePayLinkToken();
    for (let i = 0; i < 5; i += 1) {
      const exists = await db.paymentLink.findUnique({ where: { publicToken: token } });
      if (!exists) break;
      token = generatePayLinkToken();
    }

    const link = await db.paymentLink.create({
      data: {
        publicToken: token,
        customerName,
        customerEmail: email,
        title,
        description: String(body.description || "").trim(),
        amountUsd,
        currency: "USD",
        imageUrl: String(body.imageUrl || "").trim(),
        internalReference: String(body.internalReference || "").trim(),
        createdBy: user.username,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        status: "CREATED",
        paymentStatus: "CREATED",
      },
    });

    return NextResponse.json({ success: true, link: serialize(link) });
  } catch (err) {
    console.error("[PayLinkCreate]", err);
    return NextResponse.json({ success: false, error: "Unable to create payment link" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }

  const body = (await req.json()) as {
    id?: string;
    action?: "cancel" | "update";
    customerName?: string;
    customerEmail?: string;
    amountUsd?: number | string;
    title?: string;
    description?: string;
    imageUrl?: string;
    internalReference?: string;
  };
  if (!body.id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }
  const existing = await db.paymentLink.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  if (body.action === "cancel") {
    if (existing.paymentStatus === "PAID") {
      return NextResponse.json({ success: false, error: "Paid links cannot be cancelled." }, { status: 400 });
    }
    const link = await db.paymentLink.update({
      where: { id: existing.id },
      data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
    });
    return NextResponse.json({ success: true, link: serialize(link) });
  }

  if (!canEditPayLink(existing.paymentStatus)) {
    return NextResponse.json({ success: false, error: "This payment link can no longer be edited." }, { status: 400 });
  }
  const data: Record<string, unknown> = {};
  if (body.customerName?.trim()) data.customerName = body.customerName.trim();
  if (body.title?.trim()) data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl.trim();
  if (typeof body.internalReference === "string") data.internalReference = body.internalReference.trim();
  if (typeof body.customerEmail === "string") data.customerEmail = body.customerEmail.trim();
  if (body.amountUsd != null) {
    const amount = normalizeUsdAmount(body.amountUsd);
    if (amount == null) {
      return NextResponse.json({ success: false, error: "Invalid USD amount." }, { status: 400 });
    }
    data.amountUsd = amount;
  }
  const link = await db.paymentLink.update({ where: { id: existing.id }, data });
  return NextResponse.json({ success: true, link: serialize(link) });
}

export async function DELETE(req: Request) {
  if (!isDatabaseAvailable()) {
    return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 });
  }
  const user = await getAdminSessionUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  const existing = await db.paymentLink.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (existing.paymentStatus === "PAID") {
    return NextResponse.json({ success: false, error: "Paid links cannot be deleted." }, { status: 400 });
  }
  await db.paymentLink.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
