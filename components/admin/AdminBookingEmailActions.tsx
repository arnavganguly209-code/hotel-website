"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type EmailLogRow = {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: string;
  error: string;
  retryCount: number;
  sentAt: string | null;
  deliveredAt?: string | null;
  createdAt: string;
};

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s === "sent") return "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (s === "failed") return "bg-red-50 text-red-800 border-red-200";
  if (s === "queued" || s === "sending" || s === "retrying") {
    return "bg-amber-50 text-amber-900 border-amber-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function AdminBookingEmailActions({ bookingId }: { bookingId: number }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<EmailLogRow[]>([]);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/admin/bookings/${bookingId}/emails`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok && data.success) setLogs(data.logs ?? []);
  }, [bookingId]);

  useEffect(() => {
    if (open) void loadHistory();
  }, [open, loadHistory]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setMessage("");
    try {
      await fn();
      await loadHistory();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy("");
    }
  };

  const sendConfirmation = () =>
    run("send", async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", template: "booking_confirmation" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Send failed");
      setMessage("Confirmation email sent (new PDF generated).");
    });

  const resendLog = (logId: string) =>
    run(`resend-${logId}`, async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", logId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Resend failed");
      setMessage("Email resent with a newly generated PDF and log entry.");
    });

  return (
    <div className="mt-2 space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] font-semibold uppercase tracking-wide text-[#9e7738] underline"
      >
        {open ? "Hide email tools" : "Email / PDF tools"}
      </button>

      {open ? (
        <div className="rounded-xl border border-[#c5a059]/25 bg-[#fbf7ef] p-3 text-xs text-[#3d5a4c]">
          <div className="flex flex-wrap gap-2">
            <ActionBtn busy={busy === "send"} onClick={() => void sendConfirmation()} label="Send Confirmation" />
            <a
              href={`/api/admin/bookings/${bookingId}/pdf?format=download`}
              className="rounded-full border border-[#c5a059]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f5edde]"
            >
              Download PDF
            </a>
            <a
              href={`/api/admin/bookings/${bookingId}/pdf?format=preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#c5a059]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f5edde]"
            >
              Preview PDF
            </a>
            <a
              href={`/api/admin/bookings/${bookingId}/pdf?format=print`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#c5a059]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f5edde]"
            >
              Print PDF
            </a>
            <a
              href={`/api/admin/bookings/${bookingId}/emails?preview=booking_confirmation`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#c5a059]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f5edde]"
            >
              Preview Email
            </a>
            <a
              href={`/api/admin/bookings/${bookingId}/emails?preview=hotel_new_booking`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#c5a059]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f5edde]"
            >
              Preview Admin Email
            </a>
          </div>

          {message ? <p className="mt-2 text-[11px] text-emerald-800">{message}</p> : null}

          <div className="mt-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a47e3e]">
              Email History
            </p>
            {logs.length === 0 ? (
              <p className="text-[11px] text-[#7a8a82]">No emails logged yet.</p>
            ) : (
              <ul className="max-h-56 space-y-2 overflow-auto">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-lg border border-[#e2d2a8]/70 bg-white/90 px-3 py-2 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[#0f2420]">{log.subject}</span>
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-[#7a8a82]">
                      To: {log.recipient}
                      {" · "}
                      {log.template}
                      {" · "}
                      {new Date(log.sentAt || log.createdAt).toLocaleString()}
                      {log.deliveredAt
                        ? ` · Delivered ${new Date(log.deliveredAt).toLocaleString()}`
                        : ""}
                    </p>
                    {log.error ? <p className="mt-1 text-[10px] text-red-700">{log.error}</p> : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={`/api/admin/bookings/${bookingId}/emails?preview=${encodeURIComponent(log.template)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[#c5a059]/35 px-2.5 py-1 text-[10px] font-medium hover:bg-[#f5edde]"
                      >
                        Open
                      </a>
                      <a
                        href={`/api/admin/bookings/${bookingId}/pdf?format=download`}
                        className="rounded-full border border-[#c5a059]/35 px-2.5 py-1 text-[10px] font-medium hover:bg-[#f5edde]"
                      >
                        Download PDF
                      </a>
                      <button
                        type="button"
                        onClick={() => void resendLog(log.id)}
                        disabled={busy === `resend-${log.id}`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#c5a059]/35 px-2.5 py-1 text-[10px] font-medium hover:bg-[#f5edde] disabled:opacity-50"
                      >
                        {busy === `resend-${log.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : null}
                        Resend Email
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  busy,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#c5a059]/40 bg-white px-3 py-1.5 font-medium hover:bg-[#f5edde] disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {label}
    </button>
  );
}
