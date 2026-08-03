"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Register the device",
    desc: "Enter brand, model and value or let an agent scan the IMEI at point of sale.",
  },
  {
    n: "02",
    title: "Smart recommends a plan",
    desc: "The Warranty Advisor returns a package and price in under a second, with the reasoning shown.",
  },
  {
    n: "03",
    title: "Pay and activate",
    desc: "Pay in full or by EMI. The warranty certificate is issued and linked to the device's IMEI instantly.",
  },
  {
    n: "04",
    title: "Claim when needed",
    desc: "Submit photos, get an Support Assistant damage estimate, and track the repair through to completion.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            How It Works
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            From registration to repair, in four steps
          </h2>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="relative"
            >
              <p className="font-display text-4xl font-extrabold text-cyan-400/40">
                {s.n}
              </p>
              <h3 className="mt-3 font-display text-[15px] font-bold">
                {s.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-secondary">
                {s.desc}
              </p>
              {i < steps.length - 1 && (
                <span className="absolute right-[-1rem] top-4 hidden h-px w-8 bg-gradient-to-r from-cyan-400/50 to-transparent lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
