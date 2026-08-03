"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const features = ["Unbreakable", "Invisible protection", "Self healing"];

export default function ProtectionBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(115deg, #050B12 0%, #06202A 55%, #0A3A44 100%)",
        }}
      />

      <div className="grid gap-10 px-8 py-16 sm:px-14 sm:py-20 lg:grid-cols-2 lg:items-center">
        {/* Left: copy */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl"
          >
            Break Protection
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #4FDCE8, #7CF2C4)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Care+
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-cyan-400/60 px-4 py-2.5"
          >
            <ShieldCheck size={15} className="text-cyan-300" />
            <span className="text-[13px] font-semibold uppercase tracking-wide text-cyan-200">
              With damage warranty
            </span>
          </motion.div>

          <ul className="mt-9 space-y-4">
            {features.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 border-l-2 border-cyan-400 pl-3 text-[15px] font-semibold uppercase tracking-wide text-white/90"
              >
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right: real phone photo, faded into the panel background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto h-[340px] w-full max-w-sm overflow-hidden rounded-2xl sm:h-[420px]"
        >
          <img
            src="https://images.unsplash.com/photo-1511140973288-19bf21d7e771?q=80&w=1200&auto=format&fit=crop"
            alt="Smartphone screen lit up in the dark, representing a protected device"
            className="h-full w-full object-cover"
          />
          {/* fade the photo into the panel so it doesn't look like a hard-edged card */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(6,32,42,0.55) 0%, rgba(6,32,42,0) 35%)",
            }}
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
            <ShieldCheck size={13} className="text-cyan-300" />
            <span className="text-[11px] font-semibold text-white">Warranty active</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
