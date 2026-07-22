"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Sub {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export function OrbitNewsletterPanel() {
  const [items, setItems] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orbit/newsletter", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.success) setItems(data.subscribers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(id);
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Delete this subscriber from Admin as well?")) return;
    const res = await fetch(`/api/orbit/newsletter?id=${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Newsletter subscribers sync with Admin. Deletions remove the record from both systems.
      </p>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-white/50" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-luxury-gold/20">
          <table className="min-w-full text-sm text-white/85">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-luxury-gold/80">
              <tr>
                <th className="px-3 py-3 text-left">Email</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Joined</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="px-3 py-3">{s.email}</td>
                  <td className="px-3 py-3 capitalize">{s.status}</td>
                  <td className="px-3 py-3 text-xs">{String(s.createdAt).slice(0, 10)}</td>
                  <td className="px-3 py-3">
                    <Button type="button" variant="ghost" size="sm" onClick={() => void remove(s.id)}>
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-white/45">
                    No subscribers yet.
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
