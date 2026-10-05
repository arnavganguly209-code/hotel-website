import { ShieldCheck } from "lucide-react";
import { BRAND_VOUCHER_LOGO_PATH, brandAsset } from "@/lib/brand";

export function PayLinkPublicShell({
  hotelName,
  children,
}: {
  hotelName: string;
  logoUrl: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#F7F5EF] bg-gradient-to-b from-[#F7F5EF] via-[#F7F5EF] to-[#efe9dc] text-[#153a2a]">
      <header className="border-b border-[#e4dcc9] bg-[#F7F5EF]/95">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-12 lg:py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brandAsset(BRAND_VOUCHER_LOGO_PATH)}
            alt={hotelName}
            className="h-auto w-[min(100%,11.5rem)] max-w-[200px] bg-transparent object-contain object-left sm:w-[min(100%,15.5rem)] sm:max-w-[240px]"
          />
          <p className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#6f7a74] sm:text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#c5a059]" aria-hidden />
            <span className="hidden sm:inline">Secure Payment</span>
            <span className="sm:hidden">Secure</span>
          </p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-12">{children}</div>
    </div>
  );
}

export function PayLinkField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-[#ece6d8] py-3 last:border-b-0 sm:grid-cols-[8.5rem_1fr] sm:gap-6 sm:py-3.5">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a918b]">{label}</dt>
      <dd className="text-[15px] font-medium leading-6 text-[#153a2a]">{children}</dd>
    </div>
  );
}
