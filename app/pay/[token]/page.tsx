import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig, getPublicAppUrl } from "@/lib/email/config";
import { absoluteAssetUrl, canCollectPayment, formatUsdAmount, publicPayUrl } from "@/lib/pay-links/money";
import { PayLinkPayButton } from "@/components/pay-links/PayLinkPayButton";

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

export default async function PublicPayLinkPage({ params }: Params) {
  const { token } = await params;
  const link = await loadLink(token);
  if (!link) notFound();
  const hotel = getHotelMailConfig();
  const expired = Boolean(link.expiresAt && link.expiresAt.getTime() <= Date.now());
  const collectable = canCollectPayment(link.paymentStatus, link.expiresAt) && !expired;
  const image = absoluteAssetUrl(link.imageUrl);

  return (
    <main className="min-h-screen bg-[#efe9dc] px-4 py-10">
      <div className="mx-auto max-w-xl overflow-hidden rounded-[28px] border border-[#d4af37] bg-[#fffdf8] shadow-[0_24px_70px_rgba(21,58,42,0.12)]">
        <div className="border-b-4 border-[#c5a059] bg-white px-8 py-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hotel.logoUrl} alt="Hotel Thamel Park" className="mx-auto h-16 w-auto" />
        </div>
        {image ? (
          <div className="relative aspect-[1200/630] bg-[#153a2a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={link.title} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="space-y-5 px-8 py-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c5a059]">
            Payment Request
          </p>
          <h1 className="text-center font-serif text-3xl text-[#153a2a]">{link.title}</h1>
          <dl className="space-y-2 text-sm text-[#5a635c]">
            <div className="flex justify-between gap-4">
              <dt>Customer</dt>
              <dd className="font-semibold text-[#153a2a]">{link.customerName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Reference</dt>
              <dd className="font-semibold text-[#153a2a]">{link.publicToken}</dd>
            </div>
          </dl>
          {link.description ? (
            <p className="text-sm leading-7 text-[#5a635c]">{link.description}</p>
          ) : null}
          <dl className="space-y-2 text-sm text-[#5a635c]">
            {link.cardFeeEnabled ? (
              <>
                <div className="flex justify-between gap-4">
                  <dt>Base Amount</dt>
                  <dd className="font-semibold text-[#153a2a]">{formatUsdAmount(link.subtotalAmountUsd)} USD</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Card Fee</dt>
                  <dd className="font-semibold text-[#153a2a]">{formatUsdAmount(link.cardFeeAmount)} USD</dd>
                </div>
              </>
            ) : (
              <div className="flex justify-between gap-4">
                <dt>Amount</dt>
                <dd className="font-semibold text-[#153a2a]">{formatUsdAmount(link.amountUsd)} USD</dd>
              </div>
            )}
          </dl>
          <p className="text-center font-serif text-5xl text-[#153a2a]">
            {formatUsdAmount(link.totalAmountUsd ?? link.amountUsd)}
            <span className="ml-2 text-lg text-[#7a8a82]">USD</span>
          </p>
          {link.cardFeeEnabled ? (
            <p className="text-center text-xs uppercase tracking-[0.16em] text-[#7a8a82]">Customer total</p>
          ) : null}
          {link.paymentStatus === "PAID" ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">
              This payment has already been completed. Thank you.
            </p>
          ) : collectable ? (
            <PayLinkPayButton token={link.publicToken} />
          ) : (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800">
              This payment link is no longer active.
            </p>
          )}
          <p className="flex items-center justify-center gap-2 text-center text-[11px] uppercase tracking-[0.16em] text-[#7a8a82]">
            Secure Himalayan Bank payment
          </p>
        </div>
      </div>
    </main>
  );
}
