"use client";

import { useEffect, useState } from "react";

type Stats = Record<string, number>;

const LABELS: { key: keyof Stats | string; label: string }[] = [
  { key: "todaysBookings", label: "Today's Booking" },
  { key: "pendingBooking", label: "Pending Booking" },
  { key: "confirmedBooking", label: "Confirmed Booking" },
  { key: "cancelledBooking", label: "Cancelled Booking" },
  { key: "offlineBooking", label: "Offline Booking" },
  { key: "onlineBooking", label: "Online Booking" },
  { key: "todaysRevenue", label: "Today's Revenue" },
  { key: "monthlyRevenue", label: "Monthly Revenue" },
  { key: "roomOccupancy", label: "Room Occupancy %" },
  { key: "availableRooms", label: "Available Rooms" },
  { key: "blockedRooms", label: "Active Date Blocks" },
  { key: "pendingPayments", label: "Pending Payments" },
  { key: "paidPayments", label: "Paid Payments" },
  { key: "websiteVisitors", label: "Website Visitors (Today)" },
  { key: "todaysInquiries", label: "Today's Inquiries" },
  { key: "restaurantBookings", label: "Restaurant Bookings" },
  { key: "spaBookings", label: "Spa Bookings" },
  { key: "meetingBookings", label: "Meeting Bookings" },
  { key: "newsletterSubscribers", label: "Newsletter Subscribers" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<
    Array<{
      id: number;
      name: string;
      roomName: string;
      status: string;
      source: string;
      totalAmount: number;
      createdAt: string;
    }>
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          setError("Unable to load dashboard");
          return;
        }
        setStats(d.stats);
        setRecent(d.recent || []);
      })
      .catch(() => setError("Unable to load dashboard"));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Overview</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Dashboard</h1>
        <p className="mt-2 text-sm text-[#5a635c]">
          Live operations snapshot for Hotel Thamel Park.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {LABELS.map((item) => {
          const raw = stats?.[item.key as string];
          const isMoney = item.key.toString().toLowerCase().includes("revenue");
          const value =
            stats == null
              ? "—"
              : isMoney
                ? `$${(raw ?? 0).toLocaleString()}`
                : String(raw ?? 0);
          return (
            <div
              key={item.key.toString()}
              className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
            >
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#7a8a82]">{item.label}</p>
              <p className="mt-3 font-serif text-3xl font-light text-[#0f2420]">{value}</p>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6">
        <h2 className="font-serif text-xl text-[#0f2420]">Recent Activity</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#7a8a82]">
              <tr>
                <th className="pb-3 pr-4">Guest</th>
                <th className="pb-3 pr-4">Room</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-[#5a635c]">
                    No recent bookings yet.
                  </td>
                </tr>
              ) : (
                recent.map((row) => (
                  <tr key={row.id} className="border-t border-[#c5a059]/10">
                    <td className="py-3 pr-4">{row.name}</td>
                    <td className="py-3 pr-4">{row.roomName || "—"}</td>
                    <td className="py-3 pr-4 capitalize">{row.status.replace(/_/g, " ")}</td>
                    <td className="py-3 pr-4 capitalize">{row.source}</td>
                    <td className="py-3">${row.totalAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
