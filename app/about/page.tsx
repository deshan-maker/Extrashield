"use client";

import { motion } from "framer-motion";
import { HeartHandshake, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const values = [
  {
    icon: ShieldCheck,
    title: "Protection first",
    desc: "Every decision starts with one question does this make a customer's device safer to own?",
  },
  {
    icon: Zap,
    title: "Speed over paperwork",
    desc: "If an system can make a fair decision in seconds, it should — not sit in a queue for days.",
  },
  {
    icon: HeartHandshake,
    title: "Fair to everyone",
    desc: "Customers, agents and shops all see the same transparent pricing and claim logic.",
  },
  {
    icon: Target,
    title: "Built for Sri Lanka",
    desc: "Priced in rupees, designed around local shops and repair centres, not adapted from somewhere else.",
  },
];

const timeline = [
  { year: "2024", title: "The idea", desc: "Started as a simple IMEI registry for a single shop in Kandy." },
  { year: "2025", title: "Warranty Advisor", desc: "Launched usage-based pricing driven entirely by device value." },
  { year: "2026", title: "Cloud platform", desc: "Rebuilt as a full cloud platform connecting customers, agents and admins." },
];

const stats = [
  ["100+", "Devices protected"],
  ["5+", "Partner shops"],
  ["3 days", "Avg. claim approval"],
  ["24/7", "AI claim assistant"],
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden pb-20 pt-40 sm:pt-48">
        <div className="grid-fade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500"
          >
            About Extra Shield
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Device protection, rebuilt for how Sri Lanka actually buys phones
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-secondary"
          >
            We started Extra Shield because getting a phone warranty
            shouldn't mean paperwork, phone queues, or waiting days for a
            claim decision. So we built the whole thing around pricing, damage assessment, fraud checks and made it fast
            enough to use at the counter of a mobile shop.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
              Our story
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              From one shop counter to a national network
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-secondary">
              Extra Shield (Pvt) Ltd began as a simple IMEI registry built
              for a single mobile shop in Rathnapura way to stop losing
              track of which phones were actually covered. As more shops
              asked to use it, the registry grew into a full warranty
              engine, then into the AI-driven platform it is today.
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-secondary">
              Today the same core idea holds: coverage should be tied to
              the device, priced fairly by what it's worth, and decided
              by logic anyone can see not a black box.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass overflow-hidden rounded-3xl shadow-soft-lg">
              <img
                src="https://images.unsplash.com/photo-1573148195900-7845dcb9b127?q=80&w=1200&auto=format&fit=crop"
                alt="Technician inspecting a smartphone at a repair counter"
                className="h-80 w-full object-cover sm:h-96"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -bottom-6 -left-6 hidden rounded-2xl px-4 py-3 shadow-soft sm:block"
            >
              <p className="text-[11px] font-medium text-secondary">Founded</p>
              <p className="font-display text-lg font-bold">2024, Kandy</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-soft py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          {stats.map(([stat, label], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="text-center"
            >
              <p className="font-display text-3xl font-extrabold text-gradient">{stat}</p>
              <p className="mt-1 text-[12.5px] text-secondary">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-6 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-8 shadow-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
              <Target size={18} />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold">Our mission</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-secondary">
              To make device protection something every phone owner in Sri
              Lanka can actually get and understan fair pricing based on
              what a device is worth, claims decided in minutes instead of
              days, and coverage that's as easy to buy as the phone itself.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="glass rounded-3xl p-8 shadow-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
              <Sparkles size={18} />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold">Our vision</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-secondary">
              To become the protection layer behind every phone sold in Sri
              Lanka the standard every mobile shop, agent and customer
              trusts by default, built entirely around local prices, local
              shops, and how people here actually buy and repair phones.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            What we believe
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
            The principles behind every feature
          </h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="glass rounded-2xl p-6 shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                <v.icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-bold">{v.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-secondary">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-soft py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
              Timeline
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
              How we got here
            </h2>
          </div>

          <div className="mt-14 space-y-8">
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-full bg-navy-900 font-mono text-[12px] font-bold text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                    {t.year}
                  </span>
                  {i < timeline.length - 1 && (
                    <span className="mt-2 h-full w-px flex-1 bg-soft" />
                  )}
                </div>
                <div className="pb-4">
                  <h3 className="font-display text-[15px] font-bold">{t.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-secondary">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-14 text-center shadow-soft-lg sm:px-16">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(79,220,232,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(79,220,232,0.15), transparent 45%)",
              }}
            />
            <div className="relative">
              
              <h2 className="mx-auto mt-4 max-w-md font-display text-2xl font-extrabold text-white sm:text-3xl">
                Want to bring Extra Shield to your shop?
              </h2>
              <a
                href="/contact"
                className="mt-7 inline-block rounded-full bg-cyan-400 px-7 py-3 text-[13.5px] font-semibold text-navy-900 transition-transform hover:scale-[1.03]"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}