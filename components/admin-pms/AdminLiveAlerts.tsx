"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { playAdminAlertSound } from "@/lib/admin/alert-sound";

type AlertToast = {
  id: string;
  title: string;
  detail: string;
  href: string;
};

const STORAGE_KEY = "htp-admin-alert-fingerprint";

/**
 * Polls dashboard stats; when new bookings/inquiries arrive, shows a toast
 * and plays a short alert sound (desktop + mobile admin).
 */
export function AdminLiveAlerts() {
  const [toast, setToast] = useState<AlertToast | null>(null);
  const primed = useRef(false);
  const lastFp = useRef<string>("");

  useEffect(() => {
    try {
      lastFp.current = sessionStorage.getItem(STORAGE_KEY) || "";
    } catch {
      lastFp.current = "";
    }

    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/stats", { cache: "no-store" });
        const data = await res.json();
        if (!alive || !data.success || !data.stats) return;

        const s = data.stats as Record<string, number>;
        const pendingBooking = Number(s.pendingBooking || 0);
        const restaurantBookings = Number(s.restaurantBookings || 0);
        const spaBookings = Number(s.spaBookings || 0);
        const meetingBookings = Number(s.meetingBookings || 0);
        const todaysInquiries = Number(s.todaysInquiries || 0);
        const todaysBookings = Number(s.todaysBookings || 0);
        const newDining = Number(s.newDiningReservations || 0);

        const fingerprint = [
          pendingBooking,
          restaurantBookings,
          spaBookings,
          meetingBookings,
          todaysInquiries,
          todaysBookings,
          newDining,
        ].join("|");

        if (!primed.current) {
          primed.current = true;
          lastFp.current = fingerprint;
          try {
            sessionStorage.setItem(STORAGE_KEY, fingerprint);
          } catch {
            /* ignore */
          }
          return;
        }

        if (fingerprint === lastFp.current) return;

        const prev = lastFp.current.split("|").map((n) => Number(n) || 0);
        lastFp.current = fingerprint;
        try {
          sessionStorage.setItem(STORAGE_KEY, fingerprint);
        } catch {
          /* ignore */
        }

        const rose = (idx: number, next: number) => next > (prev[idx] ?? 0);

        let title = "New hotel activity";
        let detail = "A new booking or inquiry just arrived.";
        let href = "/admin/dashboard";

        if (rose(6, newDining) || rose(1, restaurantBookings)) {
          title = "New table reservation";
          detail = "A guest submitted Reserve Your Table. Open Restaurant to review full details.";
          href = "/admin/inquiries/restaurant";
        } else if (rose(0, pendingBooking) || rose(5, todaysBookings)) {
          title = "New room booking";
          detail = "A new room booking needs attention.";
          href = "/admin/bookings/online";
        } else if (rose(2, spaBookings)) {
          title = "New spa inquiry";
          detail = "A spa inquiry just arrived.";
          href = "/admin/inquiries/spa";
        } else if (rose(3, meetingBookings)) {
          title = "New event inquiry";
          detail = "A meetings & events inquiry just arrived.";
          href = "/admin/inquiries/meetings";
        } else if (rose(4, todaysInquiries)) {
          title = "New inquiry";
          detail = "A new guest inquiry arrived today.";
          href = "/admin/inquiries/contact";
        }

        playAdminAlertSound();
        setToast({
          id: `${Date.now()}`,
          title,
          detail,
          href,
        });
      } catch {
        /* ignore transient network errors */
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 12000);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 12000);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[80] flex justify-center px-3 sm:top-24 sm:justify-end sm:px-6">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[#c5a059]/40 bg-[#0c1f1b] p-4 text-[#f7f1e6] shadow-[0_20px_50px_rgba(12,31,27,0.45)]">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c5a059]/20 text-[#c5a059]">
            <Bell className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#c5a059]">Live alert</p>
            <p className="mt-1 font-[family-name:var(--font-cormorant)] text-lg leading-snug">
              {toast.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">{toast.detail}</p>
            <Link
              href={toast.href}
              className="mt-3 inline-flex text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c5a059] hover:text-[#e8d5a3]"
              onClick={() => setToast(null)}
            >
              View details →
            </Link>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Dismiss alert"
            onClick={() => setToast(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
