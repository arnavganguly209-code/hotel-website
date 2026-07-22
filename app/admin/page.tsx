import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionUser, ensureAdminUser } from "@/lib/admin/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { AdminLoginForm } from "@/components/admin-pms/AdminLoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin Portal | Hotel Thamel Park",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (isDatabaseAvailable()) {
    await ensureAdminUser();
    const user = await getAdminSessionUser();
    if (user) redirect("/admin/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cream + soft sky + green luxury atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -8%, rgba(168,205,230,0.55), transparent 58%), radial-gradient(ellipse 60% 40% at 85% 20%, rgba(197,160,89,0.14), transparent 50%), linear-gradient(165deg, #eaf4f9 0%, #f8f3ea 38%, #edf3ee 72%, #e7efe9 100%)",
        }}
      />
      {/* Soft floating light orbs */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-[#c5a059]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 animate-[pulse_11s_ease-in-out_infinite] rounded-full bg-[#7eb6d4]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-32 left-1/3 h-64 w-64 animate-[pulse_9s_ease-in-out_infinite] rounded-full bg-[#2f5d4a]/08 blur-3xl" />

      {/* Mountain silhouette */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46vh] opacity-[0.38]"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(15,36,32,0.08), transparent 70%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23244638' fill-opacity='0.22' d='M0 224l80-21.3C160 181 320 139 480 144s320 59 480 64 320-21 400-32l80-10.7V320H0z'/%3E%3Cpath fill='%2314352c' fill-opacity='0.28' d='M0 256l96-16c96-16 288-48 480-37.3 192 10.3 384 64.3 576 69.3s384-27 480-42l96-16v106H0z'/%3E%3C/svg%3E\") bottom center / cover no-repeat",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-14">
        {/* Transparent logo — PNG alpha only, no box / no fill behind it */}
        <div className="mb-9 flex w-full max-w-[380px] items-center justify-center bg-transparent p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/admin-login-logo.png?v=alpha-20260722b"
            alt="Hotel Thamel Park & Spa"
            width={720}
            height={360}
            className="mx-auto h-auto w-full max-w-[360px] bg-transparent object-contain"
            style={{ backgroundColor: "transparent", backgroundImage: "none" }}
          />
        </div>

        <div className="w-full max-w-[440px] rounded-[28px] border border-white/60 bg-white/40 p-8 shadow-[0_40px_100px_rgba(15,36,32,0.14)] backdrop-blur-2xl sm:p-10">
          <p className="text-center font-[family-name:var(--font-jost)] text-[10px] font-medium uppercase tracking-[0.32em] text-[#b8934a]">
            Enterprise Hospitality Console
          </p>
          <h1 className="mt-3 text-center font-[family-name:var(--font-cormorant)] text-[2rem] font-light leading-tight tracking-wide text-[#0f2420]">
            Hotel Management
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-center font-[family-name:var(--font-jost)] text-[13px] leading-relaxed text-[#5a635c]">
            Secure access for reservations, inventory, and guest operations.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>

        <p className="mt-12 text-center font-[family-name:var(--font-jost)] text-[11px] tracking-wide text-[#5a635c]">
          Software Developed by{" "}
          <a
            href="https://theglobalorbit.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#c5a059] underline-offset-4 transition hover:underline"
          >
            Global Orbit
          </a>
        </p>
      </div>
    </div>
  );
}
