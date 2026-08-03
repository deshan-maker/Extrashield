"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const links = [
  { label: "Services", href: "/#features" },
  { label: "Protection Plans", href: "/#plans" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass flex items-center justify-between rounded-2xl px-4 py-3 shadow-soft sm:px-6">
          <a href="#top" className="flex items-center">
            <img
              src="/extra-shield-logo.png"
              alt="Extra Shield"
              className="h-9 w-auto sm:h-10"
            />
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13.5px] font-medium text-secondary transition-colors hover:text-cyan-500"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <a
              href="/login"
              className="text-[13.5px] font-medium text-secondary transition-colors hover:text-cyan-500"
            >
              Log in
            </a>
            <a
              href="/register"
              className="rounded-full bg-navy-900 px-4 py-2 text-[13.5px] font-semibold text-white shadow-soft transition-transform hover:scale-[1.03] dark:bg-cyan-400 dark:text-navy-900"
            >
              Get Protected
            </a>
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-soft lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mt-2 rounded-2xl p-4 shadow-soft lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-secondary"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-soft pt-3">
                <ThemeToggle />
                <a
                  href="/register"
                  className="rounded-full bg-navy-900 px-4 py-2 text-[13px] font-semibold text-white dark:bg-cyan-400 dark:text-navy-900"
                >
                  Get Protected
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}