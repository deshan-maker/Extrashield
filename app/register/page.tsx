"use client";

import { motion } from "framer-motion";
import { AlertCircle, Mail, Phone, User, Lock, Store } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";

const roles = [
  { key: "CUSTOMER", label: "Customer", desc: "Protect my own devices" },
  { key: "AGENT", label: "Agent / Shop", desc: "Register devices for customers" },
] as const;

type RoleKey = (typeof roles)[number]["key"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleKey>("CUSTOMER");
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        role,
        shopName: role === "AGENT" ? shopName : undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Auto sign-in right after registration.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push(role === "CUSTOMER" ? "/dashboard" : "/agent");
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Join Extra Shield"
      subtitle="Set up your account in under a minute."
    >
      <div className="mb-6 grid grid-cols-2 gap-3">
        {roles.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRole(r.key)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              role === r.key ? "border-cyan-400 bg-cyan-400/5" : "border-soft"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                role === r.key
                  ? "bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900"
                  : "bg-navy-900/5 text-secondary dark:bg-white/5"
              }`}
            >
              {r.key === "CUSTOMER" ? <User size={15} /> : <Store size={15} />}
            </span>
            <p className="mt-3 text-[13px] font-semibold">{r.label}</p>
            <p className="mt-0.5 text-[11.5px] text-secondary">{r.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-[12.5px] text-red-500">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            Full name
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
            <User size={15} className="text-secondary" />
            <input
              required
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kasun Perera"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-secondary/60"
            />
          </div>
        </div>

        {role === "AGENT" && (
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">
              Shop name
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
              <Store size={15} className="text-secondary" />
              <input
                required
                autoComplete="off"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Perera Mobile World"
                className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-secondary/60"
              />
            </div>
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
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            Mobile number
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
            <Phone size={15} className="text-secondary" />
            <input
              required
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07X XXX XXXX"
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-secondary/60"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            Password
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
            <Lock size={15} className="text-secondary" />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
          {loading
            ? "Creating account..."
            : `Create ${roles.find((r) => r.key === role)?.label} Account`}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-[13px] text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-cyan-500">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}