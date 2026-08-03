"use client";

import { motion } from "framer-motion";
import { Bot, Fingerprint, Timer, Wallet } from "lucide-react";

const points = [
  {
    icon: Bot,
    title: "decides in seconds",
    desc: "From package recommendations to damage assessment and fraud checks, everything runs through one unified engine.",
  },
  {
    icon: Timer,
    title: "Claims move fast",
    desc: "Most claims are triaged and approved within minutes, not the industry-standard days.",
  },
  {
    icon: Fingerprint,
    title: "Every device is traceable",
    desc: "IMEI-linked records mean warranty history travels with the device, not the paperwork.",
  },
  {
    icon: Wallet,
    title: "Transparent, usage-based pricing",
    desc: "Your premium is derived from your device's actual value never a flat, one size fits-all number.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
              Why Extra Shield
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Protection, rebuilt around how devices actually fail
            </h2>
            <p className="mt-5 text-[14.5px] leading-relaxed text-secondary">
              Traditional warranty providers process paper. Extra Shield
              processes signals device value, damage photos, claim
              patterns the moment they happen.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {points.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass rounded-2xl p-6 shadow-soft"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                  <p.icon size={18} />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-bold">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-secondary">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}