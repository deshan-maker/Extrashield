"use client";

import { motion } from "framer-motion";
import { BatteryCharging, Camera, ShieldCheck, Wifi } from "lucide-react";

const floatingBadges = [
  { icon: ShieldCheck, label: "Warranty active", pos: "left-4 top-8 sm:left-10 sm:top-12" },
  { icon: BatteryCharging, label: "Battery verified", pos: "right-4 top-16 sm:right-10 sm:top-20" },
  { icon: Camera, label: "Camera checked", pos: "left-6 bottom-10 sm:left-14 sm:bottom-14" },
  { icon: Wifi, label: "Signal tested", pos: "right-6 bottom-6 sm:right-16 sm:bottom-10" },
];

export default function DeviceShowcase() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, #4FDCE8, transparent)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500"
          >
            Real-Time Monitoring
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Every plan, verified device by device
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <div className="glass relative overflow-hidden rounded-3xl shadow-soft-lg">
            <svg
              viewBox="0 0 1200 500"
              className="h-72 w-full sm:h-96"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Smartphone being inspected and protected"
            >
              <defs>
                <linearGradient id="showcaseBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0E1E33" />
                  <stop offset="100%" stopColor="#0A1628" />
                </linearGradient>
                <linearGradient id="showcasePhoneBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#16273F" />
                  <stop offset="100%" stopColor="#0A1628" />
                </linearGradient>
                <linearGradient id="showcaseScreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A5A" />
                  <stop offset="100%" stopColor="#0D1E33" />
                </linearGradient>
                <radialGradient id="showcaseGlow" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#4FDCE8" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#4FDCE8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="showcaseGrid" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#4FDCE8" stopOpacity="0.10" />
                  <stop offset="100%" stopColor="#4FDCE8" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect x="0" y="0" width="1200" height="500" fill="url(#showcaseBg)" />
              <circle cx="600" cy="250" r="320" fill="url(#showcaseGrid)" />
              <circle cx="600" cy="240" r="200" fill="url(#showcaseGlow)" />

              {/* scan ring around the phone */}
              <circle
                cx="600"
                cy="250"
                r="150"
                fill="none"
                stroke="#4FDCE8"
                strokeOpacity="0.18"
                strokeWidth="1.5"
                strokeDasharray="4 8"
              />

              {/* phone body */}
              <rect x="520" y="90" width="160" height="320" rx="28" fill="url(#showcasePhoneBody)" stroke="#2A4666" strokeWidth="2" />
              <rect x="533" y="112" width="134" height="270" rx="16" fill="url(#showcaseScreen)" />
              <rect x="580" y="112" width="40" height="8" rx="4" fill="#050B16" />

              {/* shield glyph on screen */}
              <g transform="translate(600,250)">
                <path
                  d="M0,-48 L38,-31 V6 C38,36 20,58 0,66 C-20,58 -38,36 -38,6 V-31 Z"
                  fill="none"
                  stroke="#4FDCE8"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M-15,-2 L-3,11 L18,-16"
                  fill="none"
                  stroke="#8CEAF2"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* corner scan brackets, like a device-inspection viewfinder */}
              {[
                [430, 130, "M0,0 L0,26 M0,0 L26,0"],
                [770, 130, "M0,0 L0,26 M0,0 L-26,0"],
                [430, 370, "M0,0 L0,-26 M0,0 L26,0"],
                [770, 370, "M0,0 L0,-26 M0,0 L-26,0"],
              ].map(([x, y, d], i) => (
                <path
                  key={i}
                  d={d as string}
                  transform={`translate(${x},${y})`}
                  stroke="#4FDCE8"
                  strokeOpacity="0.55"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </svg>
          </div>

          {floatingBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`glass absolute hidden items-center gap-1.5 rounded-full px-3 py-1.5 shadow-soft sm:flex ${b.pos}`}
            >
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-1.5"
              >
                <b.icon size={13} className="text-cyan-500" />
                <span className="text-[11px] font-semibold">{b.label}</span>
              </motion.span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
