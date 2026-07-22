"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, remember }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#3d5a4c]">
          Username
        </label>
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border border-[#c5a059]/35 bg-white/70 px-4 py-3 text-sm text-[#0f2420] outline-none transition focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/25"
          placeholder="Enter username"
        />
      </div>
      <div>
        <label className="mb-1.5 block font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-[#3d5a4c]">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#c5a059]/35 bg-white/70 px-4 py-3 pr-12 text-sm text-[#0f2420] outline-none transition focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/25"
            placeholder="Enter password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a635c] hover:text-[#0f2420]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#3d5a4c]">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="h-4 w-4 rounded border-[#c5a059]/50 text-[#0f2420] focus:ring-[#c5a059]"
        />
        Remember Me
      </label>

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </motion.p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0f2420] px-6 py-3.5 font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-[#e8d5a3] shadow-[0_12px_40px_rgba(15,36,32,0.25)] transition hover:bg-[#16352e] disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Signing in…" : "Login"}
      </button>
    </form>
  );
}
