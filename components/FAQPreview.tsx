"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How is my premium calculated?",
    a: "The Smart Warranty Advisor prices your plan directly from your device's value. See the calculator above for the exact tiers..",
  },
  {
    q: "What happens if my claim is rejected?",
    a: "You'll see the reasoning behind the decision and can request a manual review from our claims team..",
  },
  {
    q: "Can I pay in installments?",
    a: "Yes EMI plans are available at checkout and managed from your customer dashboard.",
  },
  {
    q: "Is coverage tied to me or the device?",
    a: "Coverage is tied to the device's IMEI, so it stays intact even if you register it through a different shop later.",
  },
];

export default function FAQPreview() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Common questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="overflow-hidden rounded-2xl border border-soft bg-elevated"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-[13.5px] font-semibold">{f.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-secondary transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-[13px] leading-relaxed text-secondary">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
