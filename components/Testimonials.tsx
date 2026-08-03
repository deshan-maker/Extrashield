"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "The claim for my cracked screen was approved before I got home from the repair shop.",
    name: "Nadeesha P.",
    role: "Customer, Colombo",
  },
  {
    quote:
      "Registering a used phone used to take fifteen minutes of paperwork. Now it's under two.",
    name: "Isuru K.",
    role: "Partner Agent, Kandy",
  },
  {
    quote:
      "Our commission tracking and shop analytics finally live in the same place we register devices.",
    name: "Fathima R.",
    role: "Shop Owner, Galle",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-soft py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            Trusted Across the Network
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            What the network says
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 shadow-soft"
            >
              <Quote size={20} className="text-cyan-400/60" />
              <p className="mt-4 text-[13.5px] leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-5 border-t border-soft pt-4">
                <p className="text-[13px] font-semibold">{t.name}</p>
                <p className="text-[12px] text-secondary">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
