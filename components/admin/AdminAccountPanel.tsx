"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminInput } from "@/components/admin/AdminFields";

interface Account {
  username: string;
  createdAt: string;
  passwordChangedAt: string;
  lastLoginAt: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
  activeSessions: number;
}

interface LoginEvent {
  id: string;
  username: string;
  success: boolean;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export function AdminAccountPanel() {
  const [account, setAccount] = useState<Account | null>(null);
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orbit/admin-account", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load account");
      setAccount(data.account);
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin account");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setNotice({ type: "err", text: "All fields are required." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: "err", text: "New password and confirmation do not match." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/orbit/admin-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changePassword", currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice({ type: "err", text: data.error || "Unable to update password." });
        return;
      }
      setNotice({ type: "ok", text: data.message || "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      void load();
    } catch {
      setNotice({ type: "err", text: "Unable to update password." });
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    setResetting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/orbit/admin-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", confirm: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotice({ type: "err", text: data.error || "Unable to reset password." });
        return;
      }
      setNotice({ type: "ok", text: data.message || "Password reset to default." });
      setResetConfirmOpen(false);
      void load();
    } catch {
      setNotice({ type: "err", text: "Unable to reset password." });
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading admin account…
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="border border-luxury-gold/15 bg-black/20 p-6">
        <p className="font-display text-lg text-luxury-gold">Admin PMS Account</p>
        <p className="mt-1 text-xs text-white/40">
          Credentials used to sign in at <span className="text-white/60">/admin</span>.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">Username</dt>
            <dd className="mt-1 text-sm text-white/80">{account?.username}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">Active Sessions</dt>
            <dd className="mt-1 text-sm text-white/80">{account?.activeSessions ?? 0}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">Last Login</dt>
            <dd className="mt-1 text-sm text-white/80">
              {account?.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString() : "Never"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">Password Last Changed</dt>
            <dd className="mt-1 text-sm text-white/80">
              {account?.passwordChangedAt ? new Date(account.passwordChangedAt).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">Account Created</dt>
            <dd className="mt-1 text-sm text-white/80">
              {account?.createdAt ? new Date(account.createdAt).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-luxury-gold/70">Failed Attempts</dt>
            <dd className="mt-1 text-sm text-white/80">{account?.failedAttempts ?? 0}</dd>
          </div>
        </dl>
      </div>

      {notice ? (
        <p
          className={`border px-4 py-3 text-sm ${
            notice.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {notice.text}
        </p>
      ) : null}

      <form onSubmit={onChangePassword} className="space-y-4 border border-luxury-gold/15 bg-black/20 p-6">
        <p className="font-display text-lg text-luxury-gold">Change Password</p>
        <AdminInput
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <AdminInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <AdminInput
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" variant="gold" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update Password
        </Button>
      </form>

      <div className="space-y-4 border border-red-500/20 bg-red-500/5 p-6">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <p className="font-display text-lg text-red-300">Reset to Default Password</p>
        </div>
        <p className="text-xs text-white/50">
          Resets the admin password to the environment bootstrap default and signs out every active
          admin session. Use only if the current password has been lost.
        </p>
        {!resetConfirmOpen ? (
          <Button
            type="button"
            variant="outline"
            className="border-red-500/40 text-red-300"
            onClick={() => setResetConfirmOpen(true)}
          >
            Reset Password
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-red-300">Are you sure? This cannot be undone.</p>
            <Button
              type="button"
              variant="outline"
              className="border-red-500/50 text-red-300"
              disabled={resetting}
              onClick={() => void onReset()}
            >
              {resetting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Yes, Reset Now
            </Button>
            <Button type="button" variant="ghost" className="text-white/60" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="border border-luxury-gold/15 bg-black/20 p-6">
        <p className="font-display text-lg text-luxury-gold">Recent Login Activity</p>
        <div className="mt-4 space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-white/50">No login attempts recorded yet.</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-luxury-gold/10 py-2 text-sm"
              >
                <span className={event.success ? "text-emerald-300" : "text-red-300"}>
                  {event.success ? "Success" : "Failed"} · {event.username || "—"}
                </span>
                <span className="text-xs text-white/40">
                  {event.ip || "unknown ip"} · {new Date(event.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
