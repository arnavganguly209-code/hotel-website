"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Item {
  id: number;
  fullName: string;
  email: string;
  treatment: string;
  status: string;
  createdAt: string;
}

export function OrbitSpaInquiriesPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orbit/spa-inquiries", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(id);
  }, [load]);

  async function remove(id: number) {
    if (!confirm("Delete this spa inquiry from Admin as well?")) return;
    const res = await fetch(`/api/orbit/spa-inquiries?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">Spa inquiries sync with Admin PMS. Delete removes both views.</p>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-white/50" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-luxury-gold/20">
          <table className="min-w-full text-sm text-white/85">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-luxury-gold/80">
              <tr>
                <th className="px-3 py-3 text-left">Guest</th>
                <th className="px-3 py-3 text-left">Treatment</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <div>{i.fullName}</div>
                    <div className="text-xs text-white/45">{i.email}</div>
                  </td>
                  <td className="px-3 py-3">{i.treatment || "—"}</td>
                  <td className="px-3 py-3 capitalize">{i.status}</td>
                  <td className="px-3 py-3">
                    <Button type="button" variant="ghost" size="sm" onClick={() => void remove(i.id)}>
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-white/45">
                    No spa inquiries.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
