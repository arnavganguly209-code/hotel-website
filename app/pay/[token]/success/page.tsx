import { notFound } from "next/navigation";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig } from "@/lib/email/config";
import { formatUsdAmount } from "@/lib/pay-links/money";
import { PayLinkConfirmingRefresh } from "@/components/pay-links/PayLinkConfirmingRefresh";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

export default async function PayLinkSuccessPage({ params }: Params) {
  const { token } = await params;
  if (!isDatabaseAvailable()) notFound();
  const link = await db.paymentLink.findUnique({
    where: { publicToken: token.trim().toUpperCase() },
  });
  if (!link) notFound();
  const hotel = getHotelMailConfig();
  const paid = link.paymentStatus === "PAID";

  return (
    <main className="min-h-screen bg-[#efe9dc] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-[28px] border border-[#d4af37] bg-white px-8 py-12 text-center shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hotel.logoUrl} alt={hotel.name} className="mx-auto h-14 w-auto" />
        <h1 className="mt-8 font-serif text-4xl text-[#153a2a]">
          {paid ? "Payment Successful" : "Payment received — confirming"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#5a635c]">
          Thank you, {link.customerName}.
          <br />
          Your payment of{" "}
          <strong>{formatUsdAmount(link.paidAmount || link.totalAmountUsd || link.amountUsd)} USD</strong>{" "}
          {paid ? "has been successfully received." : "is being confirmed."}
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#c5a059]">Reference {link.publicToken}</p>
        {!paid ? <PayLinkConfirmingRefresh /> : null}
        <p className="mt-10 text-sm text-[#7a8a82]">{hotel.name}</p>
      </div>
    </main>
  );
}
