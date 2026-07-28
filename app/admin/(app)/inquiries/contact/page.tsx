"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Download,
  Loader2,
  Mail,
  MailOpen,
  Search,
  Star,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

interface ContactEnquiry {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  bookingType: string;
  message: string;
  specialRequest: string;
  status: string;
  isRead: boolean;
  starred: boolean;
  replied: boolean;
  sourcePage: string;
  ipAddress: string;
  userAgent: string;
  adminNotes: string;
  createdAt: string;
}

type Folder = "inbox" | "unread" | "starred" | "archived" | "spam" | "trash";

const FOLDERS: { id: Folder; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
  { id: "archived", label: "Archived" },
  { id: "spam", label: "Spam" },
  { id: "trash", label: "Trash" },
];

export default function AdminContactMessagesPage() {
  const [items, setItems] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [folder, setFolder] = useState<Folder>("inbox");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        folder,
        page: String(page),
        pageSize: "20",
        sort: "desc",
      });
      if (q.trim()) params.set("q", q.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/admin/inquiries/contact?${params}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      setItems(data.inquiries ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setCounts(data.counts ?? {});
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [folder, page, q, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [folder, q, from, to]);

  const active = useMemo(
    () => items.find((i) => i.id === activeId) || null,
    [items, activeId]
  );

  useEffect(() => {
    setNotesDraft(active?.adminNotes || "");
  }, [active?.id, active?.adminNotes]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/inquiries/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete(ids: number[]) {
    if (!ids.length) return;
    if (!confirm(`Permanently delete ${ids.length} message(s)?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/inquiries/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      if (activeId && ids.includes(activeId)) setActiveId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function openMessage(item: ContactEnquiry) {
    setActiveId(item.id);
    if (!item.isRead) {
      await patch({ id: item.id, action: "mark_read" });
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selected.length === items.length) setSelected([]);
    else setSelected(items.map((i) => i.id));
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Subject",
      "Type",
      "Message",
      "Status",
      "Read",
      "Starred",
      "Replied",
      "Source",
      "IP",
      "Created At",
    ];
    const rows = items.map((i) =>
      [
        i.id,
        i.fullName,
        i.email,
        i.phone,
        i.subject,
        i.bookingType,
        i.message || i.specialRequest,
        i.status,
        i.isRead,
        i.starred,
        i.replied,
        i.sourcePage,
        i.ipAddress,
        i.createdAt,
      ]
        .map((v) => {
          const s = v == null ? "" : String(v);
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-messages-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const bulkIds = selected.length ? selected : activeId ? [activeId] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Message Center</p>
          <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Contact Messages</h1>
          <p className="mt-2 text-sm text-[#5a635c]">
            All website contact submissions saved in PostgreSQL.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-[#c5a059]/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#0f2420] hover:bg-[#c5a059]/10"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFolder(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition ${
              folder === f.id
                ? "bg-[#14352C] text-[#D4AF37]"
                : "border border-[#c5a059]/30 text-[#5a635c] hover:bg-[#c5a059]/10"
            }`}
          >
            {f.label}
            {typeof counts[f.id] === "number" ? (
              <span className="ml-1.5 opacity-70">({counts[f.id]})</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">Search</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8a82]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, email, subject, message…"
              className="w-full rounded-lg border border-[#c5a059]/35 bg-white py-2.5 pl-10 pr-3 text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">From</p>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">To</p>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#c5a059]/25 bg-[#fbf8f1] px-4 py-3 text-xs">
          <span className="font-medium text-[#0f2420]">{selected.length} selected</span>
          <button type="button" disabled={busy} onClick={() => void patch({ ids: selected, action: "mark_read" })} className="rounded-full border border-[#c5a059]/35 px-3 py-1 hover:bg-white">
            Mark Read
          </button>
          <button type="button" disabled={busy} onClick={() => void patch({ ids: selected, action: "archive" })} className="rounded-full border border-[#c5a059]/35 px-3 py-1 hover:bg-white">
            Archive
          </button>
          <button type="button" disabled={busy} onClick={() => void patch({ ids: selected, action: "trash" })} className="rounded-full border border-[#c5a059]/35 px-3 py-1 hover:bg-white">
            Trash
          </button>
          <button type="button" disabled={busy} onClick={() => void hardDelete(selected)} className="rounded-full border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50">
            Delete Forever
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div className="overflow-hidden rounded-2xl border border-[#c5a059]/20 bg-white/80">
          <div className="flex items-center gap-3 border-b border-[#c5a059]/15 px-4 py-3 text-xs text-[#5a635c]">
            <input
              type="checkbox"
              checked={items.length > 0 && selected.length === items.length}
              onChange={toggleSelectAll}
              aria-label="Select all"
            />
            <span>
              {total} message{total === 1 ? "" : "s"} · Page {page} of {pages}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 px-4 py-10 text-[#5a635c]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-sm text-[#5a635c]">No messages in this folder.</p>
          ) : (
            <ul className="divide-y divide-[#c5a059]/10">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-[#fbf8f1] ${
                    activeId === item.id ? "bg-[#f7f2ea]" : ""
                  } ${!item.isRead ? "font-semibold" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select message ${item.id}`}
                    className="mt-1"
                  />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => void openMessage(item)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm text-[#0f2420]">
                        {!item.isRead ? <Mail className="mr-1 inline h-3.5 w-3.5 text-[#c5a059]" /> : null}
                        {item.fullName}
                        {item.starred ? <Star className="ml-1 inline h-3.5 w-3.5 fill-[#c5a059] text-[#c5a059]" /> : null}
                      </p>
                      <span className="shrink-0 text-[10px] font-normal text-[#7a8a82]">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-normal text-[#5a635c]">
                      {item.subject || item.bookingType} · {item.email}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs font-normal text-[#7a8a82]">
                      {item.message || item.specialRequest || "—"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between border-t border-[#c5a059]/15 px-4 py-3 text-xs">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-[#c5a059]/30 px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="rounded-full border border-[#c5a059]/30 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-[#c5a059]/20 bg-white/80 p-5">
          {!active ? (
            <p className="text-sm text-[#5a635c]">Select a message to view details.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-serif text-xl text-[#0f2420]">#{active.id} · {active.fullName}</p>
                <p className="mt-1 text-xs text-[#7a8a82]">
                  {new Date(active.createdAt).toLocaleString()}
                </p>
              </div>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Email</dt><dd>{active.email}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Phone</dt><dd>{active.phone || "—"}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Subject</dt><dd>{active.subject || "—"}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Type</dt><dd>{active.bookingType}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Message</dt><dd className="whitespace-pre-wrap text-[#3d5a4c]">{active.message || active.specialRequest || "—"}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Source Page</dt><dd className="break-all text-xs">{active.sourcePage || "—"}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">Status</dt><dd className="capitalize">{active.status} · {active.isRead ? "Read" : "Unread"} · {active.replied ? "Replied" : "No reply"}</dd></div>
                <div><dt className="text-[10px] uppercase tracking-wider text-[#c5a059]">IP / Device</dt><dd className="break-all text-xs text-[#7a8a82]">{active.ipAddress || "—"} · {active.userAgent || "—"}</dd></div>
              </dl>

              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, action: active.isRead ? "mark_unread" : "mark_read" })} className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                  {active.isRead ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                  {active.isRead ? "Unread" : "Read"}
                </button>
                <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, action: active.starred ? "unstar" : "star" })} className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                  <Star className={`h-3.5 w-3.5 ${active.starred ? "fill-[#c5a059] text-[#c5a059]" : ""}`} /> Star
                </button>
                <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, action: "archive" })} className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                  <Archive className="h-3.5 w-3.5" /> Archive
                </button>
                <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, action: "spam" })} className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" /> Spam
                </button>
                <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, action: "trash" })} className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                  <Trash2 className="h-3.5 w-3.5" /> Trash
                </button>
                {active.status !== "inbox" ? (
                  <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, action: "restore" })} className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                ) : null}
                <button type="button" disabled={busy} onClick={() => void patch({ id: active.id, replied: !active.replied })} className="rounded-full border border-[#c5a059]/35 px-3 py-1.5 text-xs">
                  {active.replied ? "Clear Reply" : "Mark Replied"}
                </button>
                <button type="button" disabled={busy} onClick={() => void hardDelete(bulkIds.length ? bulkIds : [active.id])} className="rounded-full border border-red-300 px-3 py-1.5 text-xs text-red-700">
                  Delete Forever
                </button>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-[#c5a059]">Admin Notes</p>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void patch({ id: active.id, adminNotes: notesDraft })}
                  className="mt-2 rounded-full bg-[#14352C] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#D4AF37]"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
