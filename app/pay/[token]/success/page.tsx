import { notFound } from "next/navigation";
import { db, isDatabaseAvailable } from "@/lib/db";
import { getHotelMailConfig } from "@/lib/email/config";
import { formatUsdAmount } from "@/lib/pay-links/money";
import { PayLinkConfirmingRefresh } from "@/components/pay-links/PayLinkConfirmingRefresh";
import { PayLinkField, PayLinkPublicShell } from "@/components/pay-links/PayLinkPublicShell";

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
  const amount = formatUsdAmount(link.paidAmount || link.totalAmountUsd || link.amountUsd);

  return (
    <PayLinkPublicShell hotelName={hotel.name} logoUrl={hotel.logoUrl}>
      <div className="mx-auto max-w-xl rounded-[16px] border border-[#e4dcc9] bg-[#fffdf8] px-6 py-10 sm:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#c5a059]">
          {paid ? "Payment Completed" : "Confirming Payment"}
        </p>
        <h1 className="mt-3 font-serif text-[clamp(1.85rem,3vw,2.4rem)] text-[#153a2a]">
          {paid ? "Your payment has been successfully received." : "Payment received — confirming"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#5a635c]">Thank you, {link.customerName}.</p>
        <dl className="mt-6">
          <PayLinkField label="Reference">
            <span className="font-mono tracking-wide">{link.publicToken}</span>
          </PayLinkField>
          <PayLinkField label={paid ? "Amount Paid" : "Amount"}>{amount} USD</PayLinkField>
        </dl>
        {!paid ? <PayLinkConfirmingRefresh /> : null}
      </div>
    </PayLinkPublicShell>
  );
}
