"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Trash2,
  X,
} from "lucide-react";
import { FileUpload } from "@/components/admin/FileUpload";

type PayLink = {
  id: string;
  publicToken: string;
  publicUrl: string;
  customerName: string;
  customerEmail: string;
  title: string;
  description: string;
  amountUsd: number;
  currency: string;
  imageUrl: string;
  internalReference: string;
  paymentStatus: string;
  status: string;
  gatewayTxnId: string | null;
  gatewayReference: string | null;
  createdAt: string;
  paidAt: string | null;
  createdBy: string;
};

const emptyForm = {
  customerName: "",
  customerEmail: "",
  amountUsd: "",
  title: "",
  description: "",
  imageUrl: "",
  internalReference: "",
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CREATED: "border-amber-200 bg-amber-50 text-amber-900",
    PENDING: "border-amber-200 bg-amber-50 text-amber-900",
    PROCESSING: "border-sky-200 bg-sky-50 text-sky-900",
    PAID: "border-emerald-200 bg-emerald-50 text-emerald-800",
    FAILED: "border-red-200 bg-red-50 text-red-800",
    CANCELLED: "border-zinc-200 bg-zinc-50 text-zinc-700",
    EXPIRED: "border-orange-200 bg-orange-50 text-orange-900",
  };
  const label: Record<string, string> = {
    CREATED: "🟡 Pending",
    PENDING: "🟡 Pending",
    PROCESSING: "🟡 Processing",
    PAID: "🟢 Paid",
    FAILED: "🔴 Failed",
    CANCELLED: "⚪ Cancelled",
    EXPIRED: "⌛ Expired",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[status] || map.CREATED}`}>
      {label[status] || status}
    </span>
  );
}

function shareMessage(link: PayLink) {
  return `Hello ${link.customerName},

Please use the secure payment link below to complete your payment to Hotel Thamel Park.

Payment:
${link.title}
Amount:
$${Number(link.amountUsd).toFixed(2)} USD
Payment Link:
${link.publicUrl}

Thank you,
Hotel Thamel Park`;
}

export default function AdminPayLinkPage() {
  const [form, setForm] = useState(emptyForm);
  const [links, setLinks] = useState<PayLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [created, setCreated] = useState<PayLink | null>(null);
  const [copied, setCopied] = useState("");
  const [detail, setDetail] = useState<PayLink | null>(null);
  const [sendEmail, setSendEmail] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pay-links", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      setLinks(data.links || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/admin/pay-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amountUsd: Number(form.amountUsd),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Unable to create");
      setCreated(data.link);
      setSendEmail(data.link.customerEmail || "");
      setForm(emptyForm);
      setNotice("Payment link created.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create");
    } finally {
      setSaving(false);
    }
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1600);
  }

  async function mutate(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/pay-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this unpaid payment link?")) return;
    const res = await fetch(`/api/admin/pay-links?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || "Delete failed");
      return;
    }
    await load();
  }

  async function sendInvite(id: string, email: string) {
    const res = await fetch("/api/admin/pay-links/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      setError(data.error || "Unable to send email");
      return;
    }
    setNotice("Payment link email sent.");
  }

  const createdShare = useMemo(() => (created ? shareMessage(created) : ""), [created]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Payments</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Payment Link</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#5a635c]">
          Create a secure Himalayan Bank payment URL for deposits, packages, or custom charges. This
          is separate from room bookings.
        </p>
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
      {notice ? (
        <p className="rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 px-4 py-3 text-sm text-[#3d5a4c]">{notice}</p>
      ) : null}

      <form
        onSubmit={create}
        className="grid gap-5 rounded-2xl border border-[#c5a059]/20 bg-white p-6 shadow-[0_12px_40px_rgba(15,36,32,0.05)] lg:grid-cols-2"
      >
        <div className="lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c5a059]">
            Create payment link
          </p>
        </div>
        <label className="text-xs text-[#5a635c]">
          Customer Name
          <input
            required
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c5a059]/30 px-3 py-2.5 text-sm text-[#0f2420]"
            placeholder="John Smith"
          />
        </label>
        <label className="text-xs text-[#5a635c]">
          Customer Email
          <input
            type="email"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c5a059]/30 px-3 py-2.5 text-sm text-[#0f2420]"
            placeholder="guest@email.com"
          />
        </label>
        <label className="text-xs text-[#5a635c]">
          Amount (USD)
          <input
            required
            type="number"
            min="0.5"
            step="0.01"
            value={form.amountUsd}
            onChange={(e) => setForm({ ...form, amountUsd: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c5a059]/30 px-3 py-2.5 text-sm text-[#0f2420]"
            placeholder="450.00"
          />
        </label>
        <label className="text-xs text-[#5a635c]">
          Payment Title
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c5a059]/30 px-3 py-2.5 text-sm text-[#0f2420]"
            placeholder="Everest Trek Booking Deposit"
          />
        </label>
        <label className="text-xs text-[#5a635c] lg:col-span-2">
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c5a059]/30 px-3 py-2.5 text-sm text-[#0f2420]"
            placeholder="Deposit payment for Everest Base Camp Trek package."
          />
        </label>
        <label className="text-xs text-[#5a635c]">
          Internal Reference
          <input
            value={form.internalReference}
            onChange={(e) => setForm({ ...form, internalReference: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#c5a059]/30 px-3 py-2.5 text-sm text-[#0f2420]"
            placeholder="Optional staff note"
          />
        </label>
        <div className="text-xs text-[#5a635c]">
          Image
          <div className="mt-1">
            <FileUpload
              folder="pay-links"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              label="Upload preview image"
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#0f2420] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create payment link"}
          </button>
        </div>
      </form>

      {created ? (
        <div className="space-y-4 rounded-2xl border border-[#c5a059]/30 bg-[#fbf8f1] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c5a059]">
            Payment link created
          </p>
          <p className="break-all font-medium text-[#0f2420]">{created.publicUrl}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copy(created.publicUrl, "url")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-white px-4 py-2 text-xs font-medium"
            >
              {copied === "url" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Link
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(createdShare)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={`mailto:${encodeURIComponent(created.customerEmail || "")}?subject=${encodeURIComponent(`Payment request — ${created.title}`)}&body=${encodeURIComponent(createdShare)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-white px-4 py-2 text-xs font-medium"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
            <button
              type="button"
              onClick={() => void copy(createdShare, "msg")}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-white px-4 py-2 text-xs font-medium"
            >
              Copy Message
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <input
              type="email"
              value={sendEmail}
              onChange={(e) => setSendEmail(e.target.value)}
              placeholder="Send payment link to email"
              className="min-w-[16rem] flex-1 rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void sendInvite(created.id, sendEmail)}
              className="rounded-full bg-[#1e5a9a] px-4 py-2 text-xs font-medium text-white"
            >
              Send Payment Link
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f7f2ea] text-[10px] uppercase tracking-[0.16em] text-[#7a8a82]">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Paid At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-[#5a635c]">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-[#5a635c]">
                    No payment links yet.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="border-t border-[#c5a059]/10">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0f2420]">{link.customerName}</p>
                      <p className="text-xs text-[#7a8a82]">{link.customerEmail || "—"}</p>
                    </td>
                    <td className="px-4 py-3">{link.title}</td>
                    <td className="px-4 py-3 font-medium">${Number(link.amountUsd).toFixed(2)} USD</td>
                    <td className="px-4 py-3">{statusBadge(link.paymentStatus)}</td>
                    <td className="px-4 py-3 text-xs">{link.publicToken}</td>
                    <td className="px-4 py-3 text-xs">{new Date(link.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs">
                      {link.paidAt ? new Date(link.paidAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" className="rounded-md px-2 py-1 text-[11px] text-[#1e5a9a]" onClick={() => setDetail(link)}>
                          {link.paymentStatus === "PAID" ? "Details" : "View / Edit"}
                        </button>
                        <button type="button" className="rounded-md px-2 py-1 text-[11px] text-[#1e5a9a]" onClick={() => void copy(link.publicUrl, link.id)}>
                          Copy
                        </button>
                        <a
                          className="rounded-md px-2 py-1 text-[11px] text-[#1e5a9a]"
                          href={`https://wa.me/?text=${encodeURIComponent(shareMessage(link))}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Share
                        </a>
                        {link.paymentStatus !== "PAID" ? (
                          <button
                            type="button"
                            className="rounded-md px-2 py-1 text-[11px] text-red-700"
                            onClick={() => void mutate({ id: link.id, action: "cancel" })}
                          >
                            Cancel
                          </button>
                        ) : null}
                        {link.paymentStatus !== "PAID" ? (
                          <button type="button" className="rounded-md p-1 text-red-700" onClick={() => void remove(link.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between">
              <h2 className="font-serif text-2xl text-[#0f2420]">Payment details</h2>
              <button type="button" onClick={() => setDetail(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Customer</dt><dd>{detail.customerName}</dd></div>
              <div className="flex justify-between"><dt>Email</dt><dd>{detail.customerEmail || "—"}</dd></div>
              <div className="flex justify-between"><dt>Title</dt><dd>{detail.title}</dd></div>
              <div className="flex justify-between"><dt>Amount</dt><dd>${Number(detail.amountUsd).toFixed(2)} USD</dd></div>
              <div className="flex justify-between"><dt>Status</dt><dd>{detail.paymentStatus}</dd></div>
              <div className="flex justify-between"><dt>Reference</dt><dd>{detail.publicToken}</dd></div>
              <div className="flex justify-between"><dt>Gateway</dt><dd>{detail.gatewayTxnId || "—"}</dd></div>
              <div className="flex justify-between"><dt>Approval</dt><dd>{detail.gatewayReference || "—"}</dd></div>
            </dl>
            <p className="mt-4 break-all text-xs text-[#1e5a9a]">{detail.publicUrl}</p>
            {detail.paymentStatus !== "PAID" && detail.paymentStatus !== "CANCELLED" ? (
              <form
                className="mt-5 space-y-3 border-t border-[#c5a059]/20 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  void mutate({
                    id: detail.id,
                    customerName: String(data.get("customerName") || ""),
                    customerEmail: String(data.get("customerEmail") || ""),
                    title: String(data.get("title") || ""),
                    description: String(data.get("description") || ""),
                    amountUsd: Number(data.get("amountUsd") || detail.amountUsd),
                    internalReference: String(data.get("internalReference") || ""),
                  }).then(() => setDetail(null));
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c5a059]">Edit (unpaid)</p>
                <input name="customerName" defaultValue={detail.customerName} className="w-full rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm" />
                <input name="customerEmail" defaultValue={detail.customerEmail} className="w-full rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm" />
                <input name="title" defaultValue={detail.title} className="w-full rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm" />
                <textarea name="description" defaultValue={detail.description} className="w-full rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm" />
                <input name="amountUsd" type="number" step="0.01" min="0.5" defaultValue={detail.amountUsd} className="w-full rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm" />
                <input name="internalReference" defaultValue={detail.internalReference} className="w-full rounded-lg border border-[#c5a059]/30 px-3 py-2 text-sm" />
                <button type="submit" className="rounded-full bg-[#0f2420] px-4 py-2 text-xs font-medium text-white">
                  Save changes
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
