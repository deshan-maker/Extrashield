"use client";

import { motion } from "framer-motion";
import {
  Bell,
  LucideIcon,
  Menu,
  Search,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export interface NavGroup {
  label: string;
  items: { label: string; href: string; icon: LucideIcon; badge?: number }[];
}

export default function DashboardShell({
  role,
  roleLabel,
  userName,
  userMeta,
  navGroups,
  unreadCount = 0,
  children,
}: {
  role: "customer" | "agent" | "admin" | "callcenter";
  roleLabel: string;
  userName: string;
  userMeta: string;
  navGroups: NavGroup[];
  unreadCount?: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center px-5 py-5">
        <img
          src="/extra-shield-logo.png"
          alt="Extra Shield"
          className="h-8 w-auto"
        />
      </Link>

      <div className="mx-5 mb-4 rounded-xl border border-soft px-3 py-1.5 text-center text-[10.5px] font-semibold uppercase tracking-wide text-cyan-500">
        {roleLabel}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-secondary/70">
              {group.label}
            </p>
            <div className="mt-2 space-y-0.5">
              {group.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-secondary transition-colors hover:bg-navy-900/5 hover:text-cyan-500 dark:hover:bg-white/5"
                >
                  <item.icon size={15} />
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && (
                    <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-navy-900">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-soft p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-[12px] font-bold text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold">{userName}</p>
            <p className="truncate text-[11px] text-secondary">{userMeta}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 block w-full rounded-lg border border-soft py-1.5 text-center text-[12px] font-medium text-secondary hover:text-cyan-500"
        >
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-soft bg-elevated lg:block">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-y-0 left-0 w-64 bg-elevated"
          >
            {Sidebar}
          </motion.div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-soft bg-elevated/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-soft lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={16} />
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-soft px-3.5 py-2 sm:flex">
                <Search size={14} className="text-secondary" />
                <input
                  placeholder="Search..."
                  className="w-40 bg-transparent text-[12.5px] outline-none placeholder:text-secondary/60 lg:w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-soft text-secondary hover:text-cyan-500"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-navy-900">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}