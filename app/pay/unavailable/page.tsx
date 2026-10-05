import { getHotelMailConfig } from "@/lib/email/config";
import { PayLinkPublicShell } from "@/components/pay-links/PayLinkPublicShell";

export const dynamic = "force-dynamic";

export default function PayUnavailablePage() {
  const hotel = getHotelMailConfig();
  return (
    <PayLinkPublicShell hotelName={hotel.name} logoUrl={hotel.logoUrl}>
      <div className="mx-auto max-w-xl rounded-[16px] border border-[#e4dcc9] bg-[#fffdf8] px-6 py-10 sm:px-10">
        <h1 className="font-serif text-[clamp(1.75rem,3vw,2.25rem)] text-[#153a2a]">Payment link unavailable</h1>
        <p className="mt-4 text-sm leading-7 text-[#5a635c]">
          This payment page could not be found. Please contact {hotel.name}.
        </p>
      </div>
    </PayLinkPublicShell>
  );
}
