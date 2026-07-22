import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ensureAdminUser, getAdminSessionUser } from "@/lib/admin/auth";
import { isDatabaseAvailable } from "@/lib/db";
import { AdminShell } from "@/components/admin-pms/AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDatabaseAvailable()) {
    redirect("/admin");
  }
  await ensureAdminUser();
  const user = await getAdminSessionUser();
  if (!user) redirect("/admin");

  return <AdminShell username={user.username}>{children}</AdminShell>;
}
