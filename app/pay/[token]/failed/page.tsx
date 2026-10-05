import { notFound } from "next/navigation";
import Link from "next/link";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig } from "@/lib/email/config";

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
    <main className="min-h-screen bg-[#efe9dc] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-[28px] border border-[#d4af37] bg-white px-8 py-12 text-center shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hotel.logoUrl} alt={hotel.name} className="mx-auto h-14 w-auto" />
        <h1 className="mt-8 font-serif text-4xl text-[#153a2a]">Payment Unsuccessful</h1>
        <p className="mt-4 text-sm leading-7 text-[#5a635c]">
          We could not complete your payment. Please try again or contact Hotel Thamel Park.
        </p>
        {link.paymentStatus !== "PAID" ? (
          <Link
            href={`/pay/${link.publicToken}`}
            className="mt-8 inline-flex rounded-full bg-[#c5a059] px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </Link>
        ) : null}
        <p className="mt-8 text-xs uppercase tracking-[0.2em] text-[#c5a059]">Reference {link.publicToken}</p>
      </div>
    </main>
  );
}
