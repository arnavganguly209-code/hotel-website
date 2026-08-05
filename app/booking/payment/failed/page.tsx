import Link from "next/link";

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string }>;
}) {
  const { orderNo } = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#a47e3e]">Payment</p>
      <h1 className="mt-3 font-display text-4xl text-[#173a2b]">Payment failed</h1>
      <p className="mt-4 text-sm leading-7 text-[#657169]">
        The payment could not be completed. Your room hold may still be pending. You can try again or choose Pay at
        Hotel.
      </p>
      {orderNo ? <p className="mt-3 text-xs text-[#7a8a82]">Reference: {orderNo}</p> : null}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/rooms" className="inline-flex rounded-lg bg-[#c5a059] px-5 py-2.5 text-sm font-semibold text-white">
          Try another booking
        </Link>
        <Link href="/contact" className="inline-flex rounded-lg border border-[#c5a059]/40 px-5 py-2.5 text-sm text-[#173a2b]">
          Contact reservations
        </Link>
      </div>
    </main>
  );
}
