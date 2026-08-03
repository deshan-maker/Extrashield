"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  positive = true,
  index = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border border-soft bg-elevated p-5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
          <Icon size={16} />
        </span>
        {delta && (
          <span
            className={`flex items-center gap-1 text-[11.5px] font-semibold ${
              positive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-[12.5px] text-secondary">{label}</p>
    </motion.div>
  );
}
