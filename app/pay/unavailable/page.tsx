import { getHotelMailConfig } from "@/lib/email/config";

export const dynamic = "force-dynamic";

export default function PayUnavailablePage() {
  const hotel = getHotelMailConfig();
  return (
    <main className="min-h-screen bg-[#efe9dc] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-[28px] border border-[#d4af37] bg-white px-8 py-12 text-center">
        <h1 className="font-serif text-3xl text-[#153a2a]">Payment link unavailable</h1>
        <p className="mt-4 text-sm text-[#5a635c]">
          This payment page could not be found. Please contact {hotel.name}.
        </p>
      </div>
    </main>
  );
}
