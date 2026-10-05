import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db, isDatabaseAvailable } from "@/lib/db";
import { assertSameOrigin, getAdminSessionUser } from "@/lib/admin/auth";
import { generatePayLinkToken } from "@/lib/pay-links/token";
import {
  ACTIVE_PAY_LINK_ATTEMPT_STATUSES,
  canEditFinancialFields,
  canEditNonFinancial,
  computePayLinkQuote,
  publicPayUrl,
  sanitizePayLinkImageUrl,
  type PayLinkQuote,
} from "@/lib/pay-links/money";

export const dynamic = "force-dynamic";

function serialize(link: {
  publicToken: string;
  paymentStatus?: string;
  rawInquiry?: unknown;
  rawCallback?: unknown;
  attempts?: { id: string }[];
  [key: string]: unknown;
}) {
  const { rawInquiry: _rawInquiry, rawCallback: _rawCallback, attempts, ...rest } = link;
  const active = Array.isArray(attempts) && attempts.length > 0;
  return {
    ...rest,
    publicUrl: publicPayUrl(link.publicToken),
    financialLocked: !canEditFinancialFields(String(link.paymentStatus || ""), active),
  };
}

function moneyFromBody(body: {
  amountUsd?: number | string;
  cardFeeEnabled?: boolean;
  cardFeeType?: string;
  cardFeeValue?: number | string;
}) {
  return computePayLinkQuote({
    baseAmount: body.amountUsd,
    cardFeeEnabled: Boolean(body.cardFeeEnabled),
    cardFeeType: body.cardFeeType,
    cardFeeValue: body.cardFeeValue,
  });
}

function quoteToData(quote: PayLinkQuote) {
  return {
    amountUsd: new Prisma.Decimal(quote.subtotalUsd),
    subtotalAmountUsd: new Prisma.Decimal(quote.subtotalUsd),
    cardFeeEnabled: quote.cardFeeEnabled,
    cardFeeType: quote.cardFeeType,
    cardFeeValue: new Prisma.Decimal(quote.cardFeeValue),
    cardFeeAmount: new Prisma.Decimal(quote.feeUsd),
    totalAmountUsd: new Prisma.Decimal(quote.totalUsd),
    currency: "USD" as const,
  };
}

async function hasActiveAttempt(paymentLinkId: string) {
  const row = await db.paymentLinkAttempt.findFirst({
    where: {
      paymentLinkId,
      status: { in: [...ACTIVE_PAY_LINK_ATTEMPT_STATUSES] },
    },
    select: { id: true },
  });
  return Boolean(row);
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
    include: {
      attempts: {
        where: { status: { in: [...ACTIVE_PAY_LINK_ATTEMPT_STATUSES] } },
        select: { id: true },
        take: 1,
      },
    },
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
      cardFeeEnabled?: boolean;
      cardFeeType?: string;
      cardFeeValue?: number | string;
    };
    const customerName = String(body.customerName || "").trim();
    const title = String(body.title || "").trim();
    const quote = moneyFromBody(body);
    if (!customerName || !title || !quote.ok) {
      return NextResponse.json(
        { success: false, error: !quote.ok ? quote.error : "Customer name, title, and a valid USD amount are required." },
        { status: 400 }
      );
    }
    const email = String(body.customerEmail || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    }
    const imageUrl = sanitizePayLinkImageUrl(String(body.imageUrl || "").trim());
    if (imageUrl == null) {
      return NextResponse.json({ success: false, error: "Upload a hotel image using the file picker." }, { status: 400 });
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
        ...quoteToData(quote.quote),
        imageUrl,
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
    cardFeeEnabled?: boolean;
    cardFeeType?: string;
    cardFeeValue?: number | string;
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
    await db.paymentLinkAttempt.updateMany({
      where: { paymentLinkId: existing.id, status: { in: ["initiated", "redirected"] } },
      data: { status: "cancelled" },
    });
    return NextResponse.json({ success: true, link: serialize(link) });
  }

  if (existing.paymentStatus === "PAID") {
    return NextResponse.json({ success: false, error: "Paid links cannot be edited." }, { status: 400 });
  }
  if (!canEditNonFinancial(existing.paymentStatus) && existing.paymentStatus !== "CANCELLED") {
    return NextResponse.json({ success: false, error: "This payment link can no longer be edited." }, { status: 400 });
  }
  if (existing.paymentStatus === "CANCELLED") {
    return NextResponse.json({ success: false, error: "Cancelled links cannot be edited." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.customerName?.trim()) data.customerName = body.customerName.trim();
  if (body.title?.trim()) data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (typeof body.internalReference === "string") data.internalReference = body.internalReference.trim();
  if (typeof body.customerEmail === "string") data.customerEmail = body.customerEmail.trim();
  if (typeof body.imageUrl === "string") {
    const imageUrl = sanitizePayLinkImageUrl(body.imageUrl.trim());
    if (imageUrl == null) {
      return NextResponse.json({ success: false, error: "Upload a hotel image using the file picker." }, { status: 400 });
    }
    data.imageUrl = imageUrl;
  }

  const moneyTouched =
    body.amountUsd != null ||
    body.cardFeeEnabled != null ||
    body.cardFeeType != null ||
    body.cardFeeValue != null;
  if (moneyTouched) {
    const active = await hasActiveAttempt(existing.id);
    if (!canEditFinancialFields(existing.paymentStatus, active)) {
      return NextResponse.json(
        { success: false, error: "Amounts are locked while a Himalayan Bank payment is in progress." },
        { status: 400 }
      );
    }
    const quote = moneyFromBody({
      amountUsd: body.amountUsd ?? existing.subtotalAmountUsd.toString(),
      cardFeeEnabled: body.cardFeeEnabled ?? existing.cardFeeEnabled,
      cardFeeType: body.cardFeeType ?? existing.cardFeeType,
      cardFeeValue: body.cardFeeValue ?? existing.cardFeeValue.toString(),
    });
    if (!quote.ok) {
      return NextResponse.json({ success: false, error: quote.error }, { status: 400 });
    }
    Object.assign(data, quoteToData(quote.quote));
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
