import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig, getPublicAppUrl } from "@/lib/email/config";
import { absoluteAssetUrl, canCollectPayment, formatUsdAmount, publicPayUrl } from "@/lib/pay-links/money";
import { PayLinkPayButton } from "@/components/pay-links/PayLinkPayButton";
import { PayLinkField, PayLinkPublicShell } from "@/components/pay-links/PayLinkPublicShell";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

async function loadLink(token: string) {
  if (!isDatabaseAvailable()) return null;
  return db.paymentLink.findUnique({ where: { publicToken: token.trim().toUpperCase() } });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const link = await loadLink(token);
  if (!link) return { title: "Payment | Hotel Thamel Park" };
  const hotel = getHotelMailConfig();
  const url = publicPayUrl(link.publicToken);
  const ogImage = `${getPublicAppUrl()}/pay/${encodeURIComponent(link.publicToken)}/opengraph-image`;
  const title = `${link.title} | Hotel Thamel Park`;
  const description = `${formatUsdAmount(link.totalAmountUsd ?? link.amountUsd)} USD — ${link.description || link.title}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Hotel Thamel Park",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${hotel.name} — ${link.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function statusCopy(status: string, expired: boolean) {
  if (expired || status === "EXPIRED") return { label: "Expired", tone: "muted" as const };
  if (status === "PAID") return { label: "Paid", tone: "success" as const };
  if (status === "FAILED") return { label: "Unsuccessful", tone: "alert" as const };
  if (status === "CANCELLED") return { label: "Cancelled", tone: "muted" as const };
  if (status === "PROCESSING") return { label: "Confirming", tone: "info" as const };
  if (status === "PENDING") return { label: "Pending", tone: "info" as const };
  return { label: "Ready", tone: "info" as const };
}

export default async function PublicPayLinkPage({ params }: Params) {
  const { token } = await params;
  const link = await loadLink(token);
  if (!link) notFound();
  const hotel = getHotelMailConfig();
  const expired = Boolean(link.expiresAt && link.expiresAt.getTime() <= Date.now());
  const collectable = canCollectPayment(link.paymentStatus, link.expiresAt) && !expired;
  const image = absoluteAssetUrl(link.imageUrl);
  const total = formatUsdAmount(link.totalAmountUsd ?? link.amountUsd);
  const paidAmount = formatUsdAmount(link.paidAmount || link.totalAmountUsd || link.amountUsd);
  const status = statusCopy(link.paymentStatus, expired);

  return (
    <PayLinkPublicShell hotelName={hotel.name} logoUrl={hotel.logoUrl}>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:gap-12 xl:gap-16">
        <section className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#c5a059]">Payment Request</p>
          <h1 className="mt-2 font-serif text-[clamp(1.75rem,2.4vw,2.5rem)] leading-tight text-[#153a2a]">{link.title}</h1>

          {image ? (
            <div className="mt-6 overflow-hidden rounded-[14px] bg-[#153a2a]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={link.title} className="aspect-video w-full object-cover" />
            </div>
          ) : null}

          <dl className="mt-6">
            <PayLinkField label="Customer">{link.customerName}</PayLinkField>
            {link.customerEmail ? <PayLinkField label="Email">{link.customerEmail}</PayLinkField> : null}
            <PayLinkField label="Reference">
              <span className="font-mono tracking-wide">{link.publicToken}</span>
            </PayLinkField>
            {link.description ? <PayLinkField label="Description">{link.description}</PayLinkField> : null}
            <PayLinkField label="Status">
              <span
                className={
                  status.tone === "success"
                    ? "text-emerald-800"
                    : status.tone === "alert"
                      ? "text-[#7a2e24]"
                      : status.tone === "muted"
                        ? "text-[#6f7a74]"
                        : "text-[#153a2a]"
                }
              >
                {status.label}
              </span>
            </PayLinkField>
          </dl>
        </section>

        <aside className="lg:sticky lg:top-8">
          <div className="rounded-[16px] border border-[#e4dcc9] bg-[#fffdf8] px-5 py-6 sm:px-7 sm:py-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a918b]">
              {link.paymentStatus === "PAID" ? "Amount Paid" : "Amount Due"}
            </p>
            <p className="mt-3 font-serif text-[clamp(2.25rem,4vw,3.25rem)] leading-none text-[#153a2a]">
              {link.paymentStatus === "PAID" ? paidAmount : total}
              <span className="ml-2 align-middle font-sans text-base font-medium tracking-[0.12em] text-[#7a8a82]">
                USD
              </span>
            </p>

            {link.cardFeeEnabled ? (
              <dl className="mt-6 space-y-2.5 border-t border-[#ece6d8] pt-5 text-sm text-[#5a635c]">
                <div className="flex justify-between gap-4">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-[#153a2a]">{formatUsdAmount(link.subtotalAmountUsd)} USD</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Card processing fee</dt>
                  <dd className="font-medium text-[#153a2a]">{formatUsdAmount(link.cardFeeAmount)} USD</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-[#ece6d8] pt-3 text-[#153a2a]">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-semibold">{total} USD</dd>
                </div>
              </dl>
            ) : null}

            <div className="mt-7">
              {link.paymentStatus === "PAID" ? (
                <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                  <p className="font-semibold">Payment Completed</p>
                  <p className="mt-1">Your payment has been successfully received.</p>
                </div>
              ) : collectable ? (
                <PayLinkPayButton token={link.publicToken} />
              ) : (
                <p className="rounded-[12px] border border-[#ead8d4] bg-[#fbf4f2] px-4 py-4 text-sm leading-6 text-[#7a2e24]">
                  This payment link is no longer active.
                </p>
              )}
            </div>

            {collectable && link.paymentStatus !== "PAID" ? (
              <p className="mt-5 flex items-start gap-2 text-[12px] leading-5 text-[#6f7a74]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#c5a059]" aria-hidden />
                <span>
                  Secure payment. Your payment is processed through Himalayan Bank. Hotel Thamel Park never stores card
                  details on this page.
                </span>
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </PayLinkPublicShell>
  );
}
