"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("Forgot password failed:", res.status, data);
        setError(`(${res.status}) ${data?.error ?? "Something went wrong. Please try again."}`);
        return;
      }
      // Always show the same confirmation, whether or not the email exists.
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password network error:", err);
      setError("Network error — couldn't reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a reset link."
    >
      {submitted ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-3 text-[12.5px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            If an account exists for <strong>{email}</strong>, a reset link has been sent.
            Check your inbox (and spam folder).
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[12.5px] text-red-500">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">
              Email address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
              <Mail size={15} className="text-secondary" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-secondary/60"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="block w-full rounded-full bg-navy-900 px-5 py-3 text-center text-[13.5px] font-semibold text-white shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60 dark:bg-cyan-400 dark:text-navy-900"
          >
            {loading ? "Sending..." : "Send reset link"}
          </motion.button>
        </form>
      )}

      <p className="mt-6 text-center text-[13px] text-secondary">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-cyan-500">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}