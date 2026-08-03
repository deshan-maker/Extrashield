"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    console.log("[reset-password] Submitting with:", {
      hasToken: Boolean(token),
      tokenLength: token?.length ?? 0,
      passwordLength: password.length,
    });
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-3 text-[12.5px] text-red-500">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span>
          This link is missing its reset token.{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Request a new one
          </Link>
          .
        </span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-3 text-[12.5px] text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
        <span>Password updated. Taking you to the login page...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-[12.5px] text-red-500">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-secondary">
          New password
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
          <Lock size={15} className="text-secondary" />
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-secondary/60"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label="Toggle password visibility"
            className="text-secondary"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-secondary">
          Confirm new password
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
          <Lock size={15} className="text-secondary" />
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
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
        {loading ? "Updating..." : "Update password"}
      </motion.button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Set a new password"
      subtitle="Choose a new password for your account."
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}