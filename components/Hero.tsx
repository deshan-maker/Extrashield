"use client";

import { motion } from "framer-motion";
import { Cpu, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { calculatePackage } from "@/lib/calculatePackage";
import HeroCarousel from "./HeroCarousel";

const brands = ["Apple", "Samsung","Xiaomi", "Huawei", "Other"];

export default function Hero() {
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [price, setPrice] = useState("");

  const numericPrice = Number(price.replace(/,/g, "")) || 0;
  const result = useMemo(() => calculatePackage(numericPrice), [numericPrice]);

  return (
    <section id="top" className="relative overflow-hidden pb-24 pt-20 sm:pb-32">
      {/* Clean photo banner — untouched by text, first thing seen */}
      <HeroCarousel />

      <div className="grid-fade absolute inset-x-0 bottom-0 top-[320px] -z-10 sm:top-[420px] lg:top-[500px]" />
      <div
        className="absolute left-1/2 top-[320px] -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl sm:top-[420px] lg:top-[500px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(79,220,232,0.35), transparent)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-14 pt-16 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left: headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-medium text-secondary shadow-soft"
            >
              Sri Lanka's first mobile device protection
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Every device,
              <br />
              <span className="text-gradient">protected by intelligence.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-secondary"
            >
              Extra Shield reads your device's value the moment you type it in,
              and returns a warranty package built specifically for it no
              guesswork, no call centre, no paperwork.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <a
                href="/register"
                className="rounded-full bg-navy-900 px-7 py-3.5 text-[14px] font-semibold text-white shadow-soft-lg transition-transform hover:scale-[1.03] dark:bg-cyan-400 dark:text-navy-900"
              >
                Protect My Device
              </a>
              <a
                href="#imei-checker"
                className="rounded-full border border-soft px-7 py-3.5 text-[14px] font-semibold text-secondary transition-colors hover:text-cyan-500"
              >
                Check Warranty Status
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 grid grid-cols-3 gap-6 border-t border-soft pt-8"
            >
              {[
                ["100+", "Devices protected"],
                ["5+", "Partner shops"],
                ["3 days", "Avg. claim approval"],
              ].map(([stat, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold">{stat}</p>
                  <p className="mt-1 text-[12.5px] text-secondary">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: live AI calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="glass rounded-3xl p-6 shadow-soft-lg sm:p-8">
              <div className="mb-6 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                  <Cpu size={17} />
                </span>
                <div>
                  <p className="font-display text-[15px] font-bold">
                    Warranty Advisor
                  </p>
                  <p className="text-[12px] text-secondary">
                    Live recommendation as you type
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                    Brand
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBrand(b)}
                        className={`rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                          brand === b
                            ? "bg-navy-900 text-white dark:bg-cyan-400 dark:text-navy-900"
                            : "border border-soft text-secondary hover:text-cyan-500"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                    Model
                  </label>
                  <input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro"
                    className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13.5px] outline-none placeholder:text-secondary/60 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                    Device value (Rs.)
                  </label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="e.g. 145000"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 font-mono text-[13.5px] outline-none placeholder:font-body placeholder:text-secondary/60 focus:border-cyan-400"
                  />
                </div>
              </div>

              <motion.div
                key={result.eligible ? result.price : "empty"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-5 rounded-2xl border border-soft bg-elevated/60 p-4"
              >
                {numericPrice === 0 ? (
                  <p className="text-[12.5px] text-secondary">
                    Enter a device value to see your recommended package.
                  </p>
                ) : !result.eligible ? (
                  <p className="text-[12.5px] text-secondary">{result.reasoning}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-cyan-500">
                        <TrendingUp size={13} />
                        {result.tierLabel}
                      </div>
                      <p className="font-mono text-lg font-bold">
                        Rs. {result.price.toLocaleString()}
                        <span className="text-[11px] font-body font-normal text-secondary">
                          /yr
                        </span>
                      </p>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-secondary">
                      {result.reasoning}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {result.coverage.slice(0, 3).map((c) => (
                        <li
                          key={c}
                          className="flex items-center gap-2 text-[12px] text-secondary"
                        >
                          <span className="h-1 w-1 rounded-full bg-cyan-500" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}