import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/cms/auth";
import { getContent } from "@/lib/cms/store";
import { OrbitDashboard } from "@/components/admin/OrbitDashboard";

export const metadata = {
  title: "Dashboard | Orbit Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrbitDashboardPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/orbit");
  }

  const content = await getContent();

  return <OrbitDashboard initialContent={content} />;
}
