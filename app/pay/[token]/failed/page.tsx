import { notFound } from "next/navigation";
import Link from "next/link";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig } from "@/lib/email/config";
import { PayLinkField, PayLinkPublicShell } from "@/components/pay-links/PayLinkPublicShell";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export default async function PayLinkFailedPage({ params }: Params) {
  const { token } = await params;
  if (!isDatabaseAvailable()) notFound();
  const link = await db.paymentLink.findUnique({
    where: { publicToken: token.trim().toUpperCase() },
  });
  if (!link) notFound();
  const hotel = getHotelMailConfig();

  return (
    <PayLinkPublicShell hotelName={hotel.name} logoUrl={hotel.logoUrl}>
      <div className="mx-auto max-w-xl rounded-[16px] border border-[#e4dcc9] bg-[#fffdf8] px-6 py-10 sm:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#c5a059]">Payment Unsuccessful</p>
        <h1 className="mt-3 font-serif text-[clamp(1.85rem,3vw,2.4rem)] text-[#153a2a]">We could not complete your payment</h1>
        <p className="mt-4 text-sm leading-7 text-[#5a635c]">
          Please try again, or contact Hotel Thamel Park if you need assistance.
        </p>
        <dl className="mt-6">
          <PayLinkField label="Reference">
            <span className="font-mono tracking-wide">{link.publicToken}</span>
          </PayLinkField>
        </dl>
        {link.paymentStatus !== "PAID" ? (
          <Link
            href={`/pay/${link.publicToken}`}
            className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-[11px] bg-[#0f2420] px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#f7f5ef] transition hover:bg-[#16352e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a059]"
          >
            Try again
          </Link>
        ) : null}
      </div>
    </PayLinkPublicShell>
  );
}
