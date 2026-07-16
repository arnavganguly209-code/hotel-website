"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput, AdminTextarea } from "@/components/admin/AdminFields";

interface EventInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  eventType: string;
  guests: number;
  eventDate: string | null;
  eventTime: string;
  budget: string;
  specialRequest: string;
  attachmentUrl: string;
  status: string;
  adminReply: string;
  createdAt: string;
}

export function EventInquiriesPanel() {
  const [inquiries, setInquiries] = useState<EventInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/event-inquiries", { cache: "no-store" });
      const data = (await res.json()) as { inquiries?: EventInquiry[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load inquiries");
      setInquiries(data.inquiries ?? []);
      setReplyDrafts(
        Object.fromEntries((data.inquiries ?? []).map((item) => [item.id, item.adminReply || ""]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this inquiry?")) return;
    const res = await fetch(`/api/event-inquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    }
  }

  async function handleReply(id: number) {
    const adminReply = replyDrafts[id] ?? "";
    const res = await fetch(`/api/event-inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminReply, status: "replied" }),
    });
    if (res.ok) {
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, adminReply, status: "replied" } : item
        )
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading event inquiries…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">{inquiries.length} submission(s)</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() => void load()}
          >
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-luxury-gold/30 text-luxury-gold"
            onClick={() => {
              window.location.href = "/api/event-inquiries/export";
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {inquiries.length === 0 ? (
        <p className="text-sm text-white/50">No event inquiries yet.</p>
      ) : (
        inquiries.map((item) => (
          <div key={item.id} className="space-y-4 border border-luxury-gold/10 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg text-luxury-gold">{item.name}</p>
                <p className="text-sm text-white/70">{item.email}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/40">
                  {item.status} · {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => void handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              <p>
                <span className="text-white/40">Event:</span> {item.eventType}
              </p>
              <p>
                <span className="text-white/40">Guests:</span> {item.guests || "—"}
              </p>
              <p>
                <span className="text-white/40">Phone:</span> {item.phone || "—"}
              </p>
              <p>
                <span className="text-white/40">Country:</span> {item.country || "—"}
              </p>
              <p>
                <span className="text-white/40">Company:</span> {item.company || "—"}
              </p>
              <p>
                <span className="text-white/40">Budget:</span> {item.budget || "—"}
              </p>
              <p>
                <span className="text-white/40">Date:</span>{" "}
                {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "—"}
              </p>
              <p>
                <span className="text-white/40">Time:</span> {item.eventTime || "—"}
              </p>
            </div>

            {item.specialRequest ? (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Special Request
                </p>
                <p className="rounded-xl border border-luxury-gold/10 bg-black/20 p-3 text-sm text-white/70">
                  {item.specialRequest}
                </p>
              </div>
            ) : null}

            {item.attachmentUrl ? (
              <p className="text-sm">
                <span className="text-white/40">Attachment:</span>{" "}
                <a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="text-luxury-gold underline">
                  View file
                </a>
              </p>
            ) : null}

            <AdminTextarea
              label="Admin Reply"
              rows={3}
              value={replyDrafts[item.id] ?? ""}
              onChange={(e) =>
                setReplyDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
              }
            />
            <Button
              type="button"
              size="sm"
              className="bg-luxury-gold text-luxury-charcoal hover:bg-luxury-gold/90"
              onClick={() => void handleReply(item.id)}
            >
              Save Reply
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
