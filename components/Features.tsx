"use client";

import { motion } from "framer-motion";
import {
  ScanEye,
  ShieldAlert,
  FileScan,
  MessageSquareText,
  LineChart,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: ScanEye,
    title: "Damage Assessment",
    desc: "Upload photos of a cracked screen or water damage and get an instant, itemised repair estimate.",
  },
  {
    icon: ShieldAlert,
    title: "Fraud Prevention",
    desc: "Claim history, device history and image analysis combine into a single risk score per claim.",
  },
  {
    icon: FileScan,
    title: "Document Verification",
    desc: "Receipts and ID documents are read and verified automatically at registration.",
  },
  {
    icon: MessageSquareText,
    title: "Support Assistant",
    desc: "A always-on chat assistant that understands warranty terms, claim status and repair timelines.",
  },
  {
    icon: LineChart,
    title: "Revenue Insights",
    desc: "Admins see forward-looking revenue and claim-volume forecasts, not just historical reports.",
  },
  {
    icon: Sparkles,
    title: "Coverage Advisor",
    desc: "The same engine behind the homepage calculator powers every registration across the platform.",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-y border-soft py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            Technology Behind Extra Shield
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
           Advanced technologies powering every warranty, claim and repair.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="rounded-2xl border border-soft bg-elevated p-6 transition-shadow hover:shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
                <f.icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-bold">
                {f.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-secondary">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}