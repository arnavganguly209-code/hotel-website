"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BedDouble,
  CalendarOff,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
  Utensils,
  Users,
  Warehouse,
  X,
  ClipboardList,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/blocks", label: "Date Blocking", icon: CalendarOff },
  { href: "/admin/bookings/online", label: "Online Bookings", icon: ClipboardList },
  { href: "/admin/bookings/offline", label: "Offline Bookings", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/inquiries/contact", label: "Contact Inquiries", icon: MessageSquare },
  { href: "/admin/inquiries/restaurant", label: "Restaurant", icon: Utensils },
  { href: "/admin/inquiries/spa", label: "Spa", icon: Sparkles },
  { href: "/admin/inquiries/meetings", label: "Meetings", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/admin/dashboard/stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!alive || !d.success) return;
          setPending(Number(d.stats?.pendingBooking || 0) + Number(d.stats?.todaysInquiries || 0));
        })
        .catch(() => null);
    };
    load();
    const id = window.setInterval(load, 20000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen text-[#0f2420]"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(197,160,89,0.08), transparent 45%), linear-gradient(180deg, #f7f2e9 0%, #eef3ef 55%, #f3eee6 100%)",
      }}
    >
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-[#c5a059]/15 bg-[#0c1f1b] text-[#f7f1e6] shadow-[8px_0_40px_rgba(12,31,27,0.2)] transition lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-[4.5rem] items-center justify-between border-b border-white/10 px-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-[#c5a059]">Hotel Thamel Park</p>
              <p className="mt-0.5 font-[family-name:var(--font-cormorant)] text-xl font-light tracking-wide">
                Operations
              </p>
            </div>
            <button type="button" className="rounded-lg p-1.5 hover:bg-white/5 lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 pb-24">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition",
                    active
                      ? "bg-gradient-to-r from-[#c5a059]/25 to-transparent text-[#f0dfb0]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active && "text-[#c5a059]")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <p className="truncate text-[11px] uppercase tracking-[0.16em] text-white/40">{username}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex items-center gap-2 text-sm text-[#c5a059] transition hover:text-[#e8d5a3]"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-[#0c1f1b]/45 backdrop-blur-[2px] lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-[4.5rem] items-center gap-3 border-b border-[#c5a059]/15 bg-[#fbf8f1]/85 px-4 backdrop-blur-xl lg:px-8">
            <button
              type="button"
              className="rounded-lg border border-[#c5a059]/25 bg-white/70 p-2 lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-[family-name:var(--font-cormorant)] text-xl tracking-wide text-[#0f2420]">
                Management Console
              </p>
              <p className="hidden text-[11px] text-[#7a8a82] sm:block">Live hotel operations · synced with Orbit</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/25 bg-white/80 px-3 py-1.5 text-[11px] text-[#3d5a4c]">
                <Bell className="h-3.5 w-3.5 text-[#c5a059]" />
                {pending > 0 ? `${pending} alerts` : "All clear"}
              </span>
              <span className="hidden rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1.5 text-[11px] text-emerald-800 sm:inline">
                Secure session
              </span>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
