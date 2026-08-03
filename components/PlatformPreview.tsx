"use client";

import { motion } from "framer-motion";
import { Activity, LayoutDashboard, Store, User } from "lucide-react";

const portals = [
  {
    icon: User,
    tag: "Customer Portal",
    title: "Every device, one dashboard",
    bars: [72, 45, 88],
    desc: "Active warranties, EMI payments, claim tracking and certificate downloads in one place.",
  },
  {
    icon: Store,
    tag: "Agent Portal",
    title: "Register and activate in the shop",
    bars: [55, 90, 63],
    desc: "IMEI verification, Smart phone inspection and commission tracking built for the counter.",
  },
  {
    icon: LayoutDashboard,
    tag: "Admin Portal",
    title: "Full visibility across the network",
    bars: [80, 66, 94],
    desc: "Revenue analytics, claims approval and shop management from a single executive view.",
  },
];

export default function PlatformPreview() {
  return (
    <section id="platform" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            One Platform, Three Portals
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for customers, agents and admins alike
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {portals.map((p, i) => (
            <motion.div
              key={p.tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="overflow-hidden rounded-3xl border border-soft bg-elevated shadow-soft"
            >
              <div className="border-b border-soft p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                  <p.icon size={16} />
                </span>
                <p className="mt-3 text-[11.5px] font-semibold uppercase tracking-wide text-cyan-500">
                  {p.tag}
                </p>
                <h3 className="mt-1 font-display text-[15px] font-bold">
                  {p.title}
                </h3>
              </div>

              <div className="space-y-3 p-6">
                <div className="flex items-center gap-2 text-[11.5px] text-secondary">
                  <Activity size={12} />
                  Live activity
                </div>
                {p.bars.map((b, idx) => (
                  <div key={idx} className="h-2 w-full rounded-full bg-navy-900/5 dark:bg-white/5">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                      style={{ width: `${b}%` }}
                    />
                  </div>
                ))}
                <p className="pt-2 text-[12.5px] leading-relaxed text-secondary">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
