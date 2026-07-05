"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OrbitLoginPage() {
  const router = useRouter();
  const [secureKey, setSecureKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orbit/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: secureKey }),
      });

      if (!res.ok) {
        setError("Invalid Secure Key");
        return;
      }

      router.push("/orbit/dashboard");
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,154,74,0.08)_0%,transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md border border-luxury-orange/20 bg-luxury-green/40 p-10 shadow-glow-lg backdrop-blur-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-luxury-orange/30 bg-luxury-orange/10">
            <Lock className="h-6 w-6 text-luxury-orange" />
          </div>
          <h1 className="font-display text-2xl font-medium text-white">Orbit</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="secure-key" className="sr-only">
              Secure Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-luxury-orange/50" />
              <Input
                id="secure-key"
                type="password"
                value={secureKey}
                onChange={(e) => setSecureKey(e.target.value)}
                required
                autoComplete="off"
                placeholder="Enter secure key"
                className="border-luxury-orange/20 bg-white/5 pl-10 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            variant="gold"
            className="w-full uppercase tracking-wider"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
