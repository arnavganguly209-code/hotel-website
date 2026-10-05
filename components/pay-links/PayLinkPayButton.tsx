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
        disabled={disabled || busy}
        onClick={() => void pay()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c5a059] px-8 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_40px_rgba(197,160,89,0.35)] transition hover:bg-[#b08d45] disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        Pay Securely
      </button>
      {error ? <p className="text-center text-sm text-red-800">{error}</p> : null}
    </div>
  );
}
