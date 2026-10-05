"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

export function PayLinkPayButton({ token, disabled }: { token: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    if (disabled || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/pay-links/${encodeURIComponent(token)}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success || !data.redirectUrl) {
        throw new Error(data.error || "Unable to start payment.");
      }
      window.location.assign(data.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-label="Pay securely with Himalayan Bank"
        aria-busy={busy}
        disabled={disabled || busy}
        onClick={() => void pay()}
        className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[11px] bg-[#0f2420] px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#f7f5ef] transition hover:bg-[#16352e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5a059] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[56px]"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4 text-[#c5a059]" aria-hidden />}
        {busy ? "Connecting…" : "Pay Securely"}
      </button>
      {error ? (
        <p className="text-center text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
