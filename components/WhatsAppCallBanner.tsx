"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";

// Same number, two different formats:
// - tel: needs the raw number with country code, no spaces
// - wa.me needs the number with country code, digits only, no "+"
const PHONE_DISPLAY = "076 601 3531";
const PHONE_TEL = "+94766013531";
const WHATSAPP_NUMBER = "94766013531";

export default function WhatsAppCallBanner() {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-cyan-500 to-cyan-400 p-6 shadow-soft-lg sm:p-8">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
            Need help right now?
          </h3>
          <p className="mt-1.5 text-[13.5px] text-white/80">
            Message us on WhatsApp for quick guidance, availability, and pricing.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13.5px] font-semibold text-navy-900 shadow-soft transition-transform hover:scale-[1.03]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.47 14.38c-.28-.14-1.65-.81-1.9-.9-.26-.1-.44-.14-.63.14-.19.28-.72.9-.88 1.08-.16.19-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.5-.07-.14-.63-1.52-.87-2.08-.23-.55-.46-.47-.63-.48h-.54c-.19 0-.5.07-.76.35-.26.28-1 .97-1 2.38s1.02 2.77 1.16 2.96c.14.19 2.01 3.06 4.86 4.29.68.29 1.21.47 1.62.6.68.22 1.3.19 1.79.11.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
              <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.95 9.95 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2zm0 18.15c-1.64 0-3.16-.48-4.44-1.31l-.32-.19-3.02.79.8-2.94-.21-.31A8.14 8.14 0 0 1 3.85 12c0-4.5 3.67-8.15 8.17-8.15S20.2 7.5 20.2 12s-3.68 8.15-8.18 8.15z" />
            </svg>
            WhatsApp Now
          </a>

          <a
            href={`tel:${PHONE_TEL}`}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-3 text-[13.5px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <Phone size={15} />
            Call
          </a>
        </div>
      </div>
    </div>
  );
}