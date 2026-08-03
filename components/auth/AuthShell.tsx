"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const highlights = [
  ["100+", "Devices protected"],
  ["3 days", "Avg. claim approval"],
  ["5+", "Partner shops"],
];

export default function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-navy-900 p-12 lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 15% 15%, rgba(79,220,232,0.25), transparent 45%), radial-gradient(circle at 85% 85%, rgba(79,220,232,0.15), transparent 45%)",
          }}
        />
        <div className="grid-fade absolute inset-0 opacity-30" />

        <Link href="/" className="relative z-10 flex items-center">
          <img
            src="/extra-shield-logo-dark-bg.png"
            alt="Extra Shield"
            className="h-9 w-auto"
          />
        </Link>

        <div className="relative z-10">
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-medium text-white/80">
            
            Smart Device Protection Platform
          </div>
          <h2 className="max-w-md font-display text-3xl font-extrabold leading-tight text-white">
            Every claim, warranty and repair one intelligent cloud.
          </h2>
          <div className="mt-10 flex gap-8">
            {highlights.map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-xl font-bold text-white">
                  {stat}
                </p>
                <p className="mt-1 text-[11.5px] text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11.5px] text-white/40">
          © {new Date().getFullYear()} Extra Shield (Pvt) Ltd.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center">
              <img
                src="/extra-shield-logo.png"
                alt="Extra Shield"
                className="h-8 w-auto"
              />
            </Link>
            <ThemeToggle />
          </div>

          <div className="mb-8 hidden justify-end lg:flex">
            <ThemeToggle />
          </div>

          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-[13.5px] text-secondary">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}