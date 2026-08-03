"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const tiers = [
  { range: "Rs. 40,000 – 70,000", price: "6,990", highlighted: false },
  { range: "Rs. 70,001 – 100,000", price: "9,990", highlighted: true },
  { range: "Above Rs. 100,000", price: "9,990 +", highlighted: false },
];

// Every plan includes the full feature set — the price changes with your
// device's value, not with how much protection you get.
const featureRows = [
  "Manufacturer warranty extension",
  "Screen crack protection",
  "Priority repair queue",
  "Free diagnostic checkups",
  "Accidental damage protection",
  "Liquid damage coverage",
  "screen replacement",
  "24/7 AI claim assistant",
  "Theft & loss protection",
 
  "Same-day device replacement",
 
];

export default function ProtectionPlans() {
  return (
    <section id="plans" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
            Protection Plans
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Priced by what your device is worth
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-secondary">
            One protection plan, sized to your device. The price reflects
            device value not a lesser product at a lower price.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mt-14"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.range}
                className={`relative rounded-2xl px-5 py-6 text-center ${
                  tier.highlighted
                    ? "bg-navy-900 text-white dark:bg-elevated dark:border dark:border-cyan-400/30"
                    : "glass"
                }`}
              >
                
                <p
                  className={`text-[11.5px] font-medium ${
                    tier.highlighted ? "text-cyan-300" : "text-secondary"
                  }`}
                >
                  {tier.range}
                </p>
                <p className="mt-2 font-mono text-2xl font-bold">
                  Rs. {tier.price}
                  <span
                    className={`ml-1 text-[12px] font-body font-normal ${
                      tier.highlighted ? "text-cyan-200" : "text-secondary"
                    }`}
                  >
                    /yr
                  </span>
                </p>
                <a
                  href="/register"
                  className={`mt-5 block rounded-full px-5 py-3 text-center text-[13px] font-semibold transition-transform hover:scale-[1.02] ${
                    tier.highlighted
                      ? "bg-cyan-400 text-navy-900"
                      : "bg-navy-900 text-white dark:bg-cyan-400 dark:text-navy-900"
                  }`}
                >
                  Get protected
                </a>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-md text-center text-[12px] font-medium uppercase tracking-[0.1em] text-secondary">
            Every plan includes
          </p>
          <ul className="mx-auto mt-5 grid max-w-3xl gap-x-8 gap-y-3 sm:grid-cols-2">
            {featureRows.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-[13px]">
                <Check size={15} className="mt-0.5 shrink-0 text-cyan-500" />
                <span className="text-secondary">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="mt-8 text-center text-[12.5px] text-secondary">
          Above Rs. 100,000, every additional Rs. 50,000 in device value adds
          Rs. 5,000 to the base price.
        </p>
      </div>
    </section>
  );
}