"use client";

import { AlertTriangle, Download, MessageSquare, Phone, PhoneCall, Search, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DashboardShell, { NavGroup } from "@/components/dashboard/DashboardShell";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Follow-ups", href: "#followups", icon: Phone },
      { label: "Contact Messages", href: "#contact-messages", icon: MessageSquare },
    ],
  },
];

const OUTCOMES = [
  { value: "ANSWERED", label: "Answered" },
  { value: "NO_ANSWER", label: "No answer" },
  { value: "FOLLOW_UP_NEEDED", label: "Follow up needed" },
  { value: "RENEWED", label: "Renewed" },
  { value: "NOT_INTERESTED", label: "Not interested" },
] as const;

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  deviceCount: number;
  nearestWarranty: {
    device: string;
    tierLabel: string;
    status: string;
    daysRemaining: number;
    price: number;
    salesmanName: string | null;
    packagePrice: number | null;
    firstPaymentAmount: number | null;
    shopName: string | null;
  } | null;
  lastCall: { outcome: string; by: string; at: string } | null;
}

function urgencyStyle(days: number | null) {
  if (days === null) return "bg-navy-900/5 text-secondary dark:bg-white/10";
  if (days < 0) return "bg-red-500/10 text-red-500";
  if (days <= 7) return "bg-amber-500/10 text-amber-500";
  if (days <= 30) return "bg-cyan-400/10 text-cyan-500";
  return "bg-emerald-500/10 text-emerald-500";
}

function urgencyLabel(days: number | null) {
  if (days === null) return "No warranty";
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return "Expires today";
  return `${days}d left`;
}

export default function CallCenterDashboard() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCustomer, setActiveCustomer] = useState<CustomerRow | null>(null);
  const [outcome, setOutcome] = useState<(typeof OUTCOMES)[number]["value"]>("ANSWERED");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  async function loadMessages() {
    setMessagesLoading(true);
    const res = await fetch("/api/callcenter/contact");
    if (res.ok) setMessages((await res.json()).contactMessages);
    setMessagesLoading(false);
  }

  async function markMessageRead(id: string) {
    await fetch(`/api/callcenter/contact/${id}`, { method: "PATCH" });
    loadMessages();
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadCustomers(q?: string) {
    setLoading(true);
    const res = await fetch(`/api/callcenter/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (res.ok) setCustomers((await res.json()).customers);
    setLoading(false);
  }

  function exportCustomersToExcel() {
    const headers = [
      "Customer name",
      "Contact number",
      "Customer email",
      "Device",
      "Package",
      "First payment",
      "Balance to pay",
      "Registered shop",
      "Salesman name",
      "Warranty",
    ];

    const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    // Excel auto-detects long all-digit strings as numbers (scientific notation,
    // dropped leading zeros). Wrapping as ="..." forces it to keep the exact text.
    const asText = (value: string) => `"=""${value.replace(/"/g, '""')}"""`;

    const rows = customers.map((c) => {
      const packagePrice = c.nearestWarranty?.price ?? c.nearestWarranty?.packagePrice ?? 0;
      const firstPayment = c.nearestWarranty?.firstPaymentAmount ?? 0;
      const balance = Math.max(0, packagePrice - firstPayment);
      return [
        escapeCell(c.name),
        c.phone ? asText(c.phone) : escapeCell(""),
        escapeCell(c.email),
        escapeCell(c.nearestWarranty?.device ?? ""),
        escapeCell(c.nearestWarranty ? packagePrice : ""),
        escapeCell(c.nearestWarranty ? firstPayment : ""),
        escapeCell(c.nearestWarranty ? balance : ""),
        escapeCell(c.nearestWarranty?.shopName ?? ""),
        escapeCell(c.nearestWarranty?.salesmanName ?? ""),
        escapeCell(
          c.nearestWarranty ? `${c.nearestWarranty.tierLabel} (${c.nearestWarranty.status})` : "None"
        ),
      ].join(",");
    });

    const csv = [headers.map(escapeCell).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const urgentCount = customers.filter(
    (c) => c.nearestWarranty && c.nearestWarranty.daysRemaining <= 7
  ).length;

  async function handleLogCall() {
    if (!activeCustomer) return;
    setSaving(true);
    await fetch("/api/callcenter/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: activeCustomer.id, outcome, note: note || undefined }),
    });
    setSaving(false);
    setSaved(true);
    setNote("");
    setTimeout(() => setSaved(false), 2000);
    loadCustomers(query);
  }

  return (
    <DashboardShell
      role="callcenter"
      roleLabel="Call Center"
      userName={session?.user?.name ?? "Call Center Staff"}
      userMeta={session?.user?.email ?? ""}
      navGroups={navGroups}
    >
      <section id="followups" className="scroll-mt-24">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Follow-up queue
        </h1>
        <p className="mt-1 text-[13.5px] text-secondary">
          Customers sorted by warranty urgency — call the ones expiring soonest first.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard icon={Phone} label="Total customers" value={loading ? "—" : String(customers.length)} index={0} />
          <StatCard
            icon={AlertTriangle}
            label="Expiring within 7 days"
            value={loading ? "—" : String(urgentCount)}
            index={1}
          />
          <StatCard
            icon={ShieldCheck}
            label="Renewed (all time)"
            value={loading ? "—" : String(customers.filter((c) => c.lastCall?.outcome === "RENEWED").length)}
            index={2}
          />
        </div>
      </section>

      <SectionCard
        title="Customer lookup"
        subtitle="Search by name, email, phone number, or salesman name"
        action={
          <button
            onClick={exportCustomersToExcel}
            disabled={!customers.length}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-soft px-3.5 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500 disabled:opacity-50"
          >
            <Download size={13} />
            Export to Excel
          </button>
        }
      >
        <div className="mb-5 flex items-center gap-2 rounded-full border border-soft px-3.5 py-2">
          <Search size={14} className="text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadCustomers(query)}
            placeholder="Search by customer name, phone, or salesman name..."
            className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-secondary/60"
          />
          <button
            onClick={() => loadCustomers(query)}
            className="shrink-0 rounded-full bg-navy-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white dark:bg-cyan-400 dark:text-navy-900"
          >
            Search
          </button>
        </div>

        {loading ? (
          <p className="text-[12.5px] text-secondary">Loading customers...</p>
        ) : !customers.length ? (
          <p className="text-[12.5px] text-secondary">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-soft text-secondary">
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Device / Plan</th>
                  <th className="pb-3 font-medium">Package</th>
                  <th className="pb-3 font-medium">Shop / Salesman</th>
                  <th className="pb-3 font-medium">Warranty</th>
                  <th className="pb-3 font-medium">Last call</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-soft last:border-0">
                    <td className="py-3 font-medium">
                      {c.name}
                      <p className="font-normal text-secondary">{c.email}</p>
                    </td>
                    <td className="py-3 text-secondary">
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          className="text-cyan-500 hover:underline"
                        >
                          {c.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 text-secondary">
                      {c.nearestWarranty ? `${c.nearestWarranty.device} — ${c.nearestWarranty.tierLabel}` : `${c.deviceCount} device(s)`}
                    </td>
                    <td className="py-3">
                      {c.nearestWarranty ? (
                        <>
                          <p className="font-mono text-secondary">
                            Rs. {(c.nearestWarranty.price ?? c.nearestWarranty.packagePrice ?? 0).toLocaleString()}
                          </p>
                          <p className="text-[11px] text-secondary/70">
                            Paid Rs. {(c.nearestWarranty.firstPaymentAmount ?? 0).toLocaleString()} · Bal Rs.{" "}
                            {Math.max(
                              0,
                              (c.nearestWarranty.price ?? c.nearestWarranty.packagePrice ?? 0) -
                                (c.nearestWarranty.firstPaymentAmount ?? 0)
                            ).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <p className="text-secondary">{c.nearestWarranty?.shopName ?? "—"}</p>
                      {c.nearestWarranty?.salesmanName && (
                        <p className="text-[11px] text-secondary/70">
                          Salesman: {c.nearestWarranty.salesmanName}
                        </p>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${urgencyStyle(
                          c.nearestWarranty?.daysRemaining ?? null
                        )}`}
                      >
                        {urgencyLabel(c.nearestWarranty?.daysRemaining ?? null)}
                      </span>
                    </td>
                    <td className="py-3 text-secondary">
                      {c.lastCall
                        ? `${c.lastCall.outcome.replace(/_/g, " ")} · ${new Date(c.lastCall.at).toLocaleDateString()}`
                        : "Never called"}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => {
                          setActiveCustomer(c);
                          setOutcome("ANSWERED");
                          setNote("");
                        }}
                        className="flex items-center gap-1.5 rounded-full border border-soft px-3 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500"
                      >
                        <PhoneCall size={12} /> Log call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="contact-messages"
        title="Contact Messages"
        subtitle="Submissions from the public Contact page"
      >
        {messagesLoading ? (
          <p className="text-[12.5px] text-secondary">Loading messages...</p>
        ) : !messages.length ? (
          <p className="text-[12.5px] text-secondary">No messages yet.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`rounded-xl border p-4 text-[12.5px] ${
                  m.read ? "border-soft" : "border-cyan-400/60 bg-cyan-400/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.subject}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        m.read
                          ? "bg-navy-900/5 text-secondary dark:bg-white/10"
                          : "bg-cyan-400/15 text-cyan-500"
                      }`}
                    >
                      {m.read ? "Read" : "Unread"}
                    </span>
                  </div>
                  {!m.read && (
                    <button
                      onClick={() => markMessageRead(m.id)}
                      className="shrink-0 rounded-full border border-soft px-3 py-1 text-[11px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-secondary">
                  {m.name} · {m.email}
                </p>
                <p className="mt-2 text-secondary">{m.message}</p>
                <p className="mt-2 text-[11px] text-secondary/70">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="glass w-full max-w-md rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold">Log call — {activeCustomer.name}</h3>
            <p className="mt-1 text-[12.5px] text-secondary">
              {activeCustomer.phone ?? activeCustomer.email}
            </p>

            <label className="mt-4 block text-[12px] font-medium text-secondary">Outcome</label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as typeof outcome)}
              className="mt-1.5 w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            >
              {OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-[12px] font-medium text-secondary">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Any details about the call..."
              className="mt-1.5 w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleLogCall}
                disabled={saving}
                className="rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
              >
                {saving ? "Saving..." : "Save call log"}
              </button>
              <button
                onClick={() => setActiveCustomer(null)}
                className="text-[12.5px] font-medium text-secondary"
              >
                Cancel
              </button>
              {saved && <span className="text-[12px] font-medium text-emerald-500">Saved.</span>}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}