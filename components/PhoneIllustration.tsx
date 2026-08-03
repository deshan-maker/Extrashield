"use client";

import { motion } from "framer-motion";

export default function PhoneIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [-4, 2, -4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <svg
          viewBox="0 0 280 420"
          width="220"
          height="330"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#122238" />
              <stop offset="100%" stopColor="#0A1628" />
            </linearGradient>
            <linearGradient id="phoneScreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B3150" />
              <stop offset="100%" stopColor="#0A1628" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#4FDCE8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4FDCE8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ambient glow behind the device */}
          <circle cx="140" cy="160" r="170" fill="url(#glow)" />

          {/* phone body */}
          <rect
            x="40"
            y="20"
            width="200"
            height="380"
            rx="36"
            fill="url(#phoneBody)"
            stroke="#274469"
            strokeWidth="2"
          />
          {/* screen */}
          <rect x="54" y="46" width="172" height="328" rx="22" fill="url(#phoneScreen)" />
          {/* notch */}
          <rect x="118" y="46" width="44" height="10" rx="5" fill="#050B16" />

          {/* shield glyph, center screen */}
          <g transform="translate(140,190)">
            <motion.path
              d="M0,-58 L46,-38 V6 C46,44 24,70 0,80 C-24,70 -46,44 -46,6 V-38 Z"
              fill="none"
              stroke="#4FDCE8"
              strokeWidth="3"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.path
              d="M-18,-2 L-4,14 L22,-20"
              fill="none"
              stroke="#8CEAF2"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeInOut", delay: 1.7 }}
            />
          </g>

          {/* subtle scan line sweeping the screen */}
          <motion.rect
            x="54"
            width="172"
            height="40"
            fill="#4FDCE8"
            opacity="0.06"
            initial={{ y: 46 }}
            animate={{ y: [46, 334, 46] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* floating status chips */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="glass absolute -left-10 top-16 rounded-xl px-3 py-2 text-[11px] font-semibold shadow-soft"
        >
          IMEI verified
        </motion.div>
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="glass absolute -right-8 bottom-20 rounded-xl px-3 py-2 text-[11px] font-semibold shadow-soft"
        >
          Rs. 6,990/yr
        </motion.div>
      </motion.div>
    </div>
  );
}
