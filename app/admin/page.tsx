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
    <div className="relative h-dvh max-h-dvh overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/admin-login-bg.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />
      {/* Light wash so the photo stays faint and the form stays readable */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(248,243,234,0.78) 0%, rgba(242,236,224,0.72) 45%, rgba(232,239,233,0.8) 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-4 py-3 sm:py-5">
        <div className="mb-3 flex w-full max-w-[280px] items-center justify-center bg-transparent p-0 sm:mb-4 sm:max-w-[300px]">
          <style
            dangerouslySetInnerHTML={{
              __html: `.admin-login-logo{background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important}`,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/htp-admin-mark.png?v=nobox-4"
            alt="Hotel Thamel Park & Spa"
            width={600}
            height={300}
            className="admin-login-logo mx-auto h-auto max-h-[12vh] w-full bg-transparent object-contain sm:max-h-[14vh]"
            style={{
              background: "transparent",
              backgroundColor: "transparent",
              backgroundImage: "none",
            }}
          />
        </div>

        <div className="w-full max-w-[400px] rounded-[22px] border border-white/70 bg-white/55 p-5 shadow-[0_24px_70px_rgba(15,36,32,0.12)] backdrop-blur-xl sm:max-w-[420px] sm:rounded-[26px] sm:p-7">
          <p className="text-center font-[family-name:var(--font-jost)] text-[10px] font-medium uppercase tracking-[0.28em] text-[#b8934a]">
            Enterprise Hospitality Console
          </p>
          <h1 className="mt-1.5 text-center font-[family-name:var(--font-cormorant)] text-[1.65rem] font-light leading-tight tracking-wide text-[#0f2420] sm:text-[1.85rem]">
            Hotel Management
          </h1>
          <p className="mx-auto mt-1 max-w-sm text-center font-[family-name:var(--font-jost)] text-[12px] leading-snug text-[#5a635c] sm:text-[13px]">
            Secure access for reservations, inventory, and guest operations.
          </p>
          <div className="mt-4 sm:mt-5">
            <AdminLoginForm />
          </div>
        </div>

        <p className="mt-3 shrink-0 text-center font-[family-name:var(--font-jost)] text-[10px] tracking-wide text-[#5a635c] sm:mt-4 sm:text-[11px]">
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
