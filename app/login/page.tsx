"use client";

import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    // Middleware routes each role to its own portal, so any protected
    // path works here — it'll bounce to /agent or /admin if needed.
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Access your devices, claims and warranty history."
    >
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-[12.5px] text-red-500">
            <AlertCircle size={15} />
            {error}
          </div>
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[12px] font-medium text-secondary">
              Password
            </label>
            <Link href="/forgot-password" className="text-[12px] font-medium text-cyan-500">
              Forgot password?
            </Link>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
            <Lock size={15} className="text-secondary" />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="block w-full rounded-full bg-navy-900 px-5 py-3 text-center text-[13.5px] font-semibold text-white shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60 dark:bg-cyan-400 dark:text-navy-900"
        >
          {loading ? "Logging in..." : "Log in"}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-[13px] text-secondary">
        Don't have an account?{" "}
        <Link href="/register" className="font-semibold text-cyan-500">
          Register
        </Link>
      </p>

      
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}