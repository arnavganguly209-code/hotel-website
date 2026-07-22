import type { Metadata } from "next";
import Image from "next/image";
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
    <div className="relative min-h-screen overflow-hidden bg-[#f4efe6]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(135,180,210,0.45), transparent 55%), linear-gradient(160deg, #e8f2f8 0%, #f7f1e6 42%, #e6efe8 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] opacity-40"
        style={{
          background:
            "linear-gradient(to top, rgba(15,36,32,0.12), transparent), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 300'%3E%3Cpath fill='%23244638' fill-opacity='0.18' d='M0 220 L180 140 L320 190 L480 100 L640 170 L820 90 L1000 160 L1200 110 L1200 300 L0 300Z'/%3E%3Cpath fill='%2314352c' fill-opacity='0.22' d='M0 250 L220 180 L400 230 L580 150 L760 210 L960 140 L1200 200 L1200 300 L0 300Z'/%3E%3C/svg%3E\") bottom/cover no-repeat",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 w-full max-w-[320px]">
          <Image
            src="/brand/admin-login-logo.png"
            alt="Hotel Thamel Park & Spa"
            width={640}
            height={240}
            className="mx-auto h-auto w-full object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            priority
          />
        </div>

        <div className="w-full max-w-[420px] rounded-3xl border border-white/50 bg-white/45 p-8 shadow-[0_30px_80px_rgba(15,36,32,0.12)] backdrop-blur-xl sm:p-10">
          <p className="text-center font-sans text-[11px] uppercase tracking-[0.28em] text-[#c5a059]">
            Enterprise Portal
          </p>
          <h1 className="mt-2 text-center font-serif text-2xl font-light text-[#0f2420]">
            Hotel Management
          </h1>
          <p className="mt-2 text-center text-sm text-[#5a635c]">
            Sign in to continue to your secure dashboard.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-[#5a635c]">
          Software Developed by{" "}
          <a
            href="https://theglobalorbit.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#c5a059] underline-offset-4 transition hover:underline"
          >
            Global Orbit
          </a>
        </p>
      </div>
    </div>
  );
}
