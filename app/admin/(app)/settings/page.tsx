"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setNotice({ type: "err", text: "All fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: "err", text: "New password and confirmation do not match." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice({ type: "err", text: data.error || "Unable to update password." });
        return;
      }
      setNotice({ type: "ok", text: data.message || "Password updated. Please sign in again." });
      setTimeout(() => {
        router.replace("/admin");
        router.refresh();
      }, 1500);
    } catch {
      setNotice({ type: "err", text: "Unable to update password." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#c5a059]">Account</p>
        <h1 className="mt-1 font-serif text-3xl font-light text-[#0f2420]">Settings</h1>
        <p className="mt-2 text-sm text-[#5a635c]">Update your Admin PMS password.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-[#c5a059]/20 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,36,32,0.04)]"
      >
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Current Password
          </p>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            New Password
          </p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#3d5a4c]">
            Confirm New Password
          </p>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-[#c5a059]/35 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#c5a059]"
          />
        </div>

        {notice ? (
          <p className={`text-sm ${notice.type === "err" ? "text-red-600" : "text-emerald-700"}`}>
            {notice.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-[#0f2420] px-6 py-2.5 text-sm font-medium text-[#e8d5a3] disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update Password
        </button>
      </form>
    </div>
  );
}
