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
} from "lucide-react";
import { useState } from "react";
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

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f3eee6] text-[#0f2420]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 border-r border-[#c5a059]/20 bg-[#0f2420] text-[#f7f1e6] transition lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059]">Thamel Park</p>
              <p className="font-serif text-lg font-light">Admin PMS</p>
            </div>
            <button type="button" className="lg:hidden" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 8rem)" }}>
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-[#c5a059]/20 text-[#e8d5a3]"
                      : "text-white/75 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
            <p className="truncate text-xs text-white/50">{username}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex items-center gap-2 text-sm text-[#c5a059] hover:text-[#e8d5a3]"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[#c5a059]/15 bg-[#fbf8f1]/90 px-4 backdrop-blur lg:px-8">
            <button type="button" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg text-[#0f2420]">Hotel Management Console</p>
            </div>
            <span className="hidden rounded-full border border-[#c5a059]/30 bg-white/70 px-3 py-1 text-xs text-[#3d5a4c] sm:inline">
              Secure session
            </span>
          </header>
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
