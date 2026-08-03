"use client";

import {
  Archive,
  BadgeCheck,
  Bell,
  Building2,
  DollarSign,
  Download,
  FileClock,
  Gauge,
  KeyRound,
  Mail,
  MessageSquare,
  Settings,
  ScanLine,
  ShieldQuestion,
  Smartphone,
  Store,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardShell, { NavGroup } from "@/components/dashboard/DashboardShell";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";

const navGroups: NavGroup[] = [
  { label: "Executive", items: [{ label: "Executive Dashboard", href: "#overview", icon: Gauge }] },
  {
    label: "Management",
    items: [
      { label: "Customer Management", href: "#management", icon: Users },
      { label: "Agent Management", href: "#agents", icon: Store },
      { label: "Shop Management", href: "#management", icon: Building2 },
      { label: "Device Management", href: "#devices", icon: Smartphone },
      { label: "Warranty Plans", href: "#management", icon: BadgeCheck },
      { label: "Customer Packages", href: "#packages", icon: Wallet },
    ],
  },
  {
    label: "IMEI",
    items: [
      { label: "IMEI Verification", href: "#devices", icon: ScanLine },
    ],
  },
  {
    label: "Claims & Finance",
    items: [
      { label: "Claims Approval", href: "#claims", icon: Wrench },
      { label: "Financial Reports", href: "#financial", icon: FileClock },
      { label: "Revenue Analytics", href: "#financial", icon: TrendingUp },
      { label: "Pending Payments", href: "#financial", icon: DollarSign },
      { label: "Commission Management", href: "#financial", icon: Wallet },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Repair Center Management", href: "#repair-centers", icon: Wrench },
      { label: "Notification Center", href: "#operations", icon: Bell },
      { label: "Email Management", href: "#operations", icon: Mail },
      { label: "Contact Messages", href: "#contact-messages", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Roles & Permissions", href: "#system", icon: KeyRound },
      { label: "Audit Logs", href: "#system", icon: FileClock },
      { label: "Backup Management", href: "#system", icon: Archive },
      { label: "System Settings", href: "#system", icon: Settings },
    ],
  },
];

function daysLeftToPay(createdAt: string): number {
  const dueDate = new Date(createdAt);
  dueDate.setFullYear(dueDate.getFullYear() + 1);
  const diffMs = dueDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function ShowMoreButton({
  expanded,
  onToggle,
  remaining,
}: {
  expanded: boolean;
  onToggle: () => void;
  remaining: number;
}) {
  if (remaining <= 0 && !expanded) return null;
  return (
    <button
      onClick={onToggle}
      className="mt-4 w-full rounded-xl border border-dashed border-soft py-2.5 text-[12.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500"
    >
      {expanded ? "Show less" : `Show ${remaining} more`}
    </button>
  );
}

interface DashboardData {
  stats: {
    customerCount: number;
    agentCount: number;
    revenueThisMonth: number;
    pendingClaims: number;
    pendingPayments: number;
    pendingCommission: number;
  };
  revenueByMonth: { month: string; revenue: number }[];
  management: {
    customers: { id: string; name: string; meta: string; suspended: boolean }[];
    agents: { id: string; name: string; meta: string; suspended: boolean }[];
    shops: { id: string; name: string; meta: string; verified: boolean }[];
  };
  claimsQueue: {
    id: string;
    issue: string;
    device: { brand: string; model: string };
    customer: { name: string };
  }[];
  contactMessages: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"Customers" | "Shops">("Customers");
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [devices, setDevices] = useState<
    {
      id: string;
      imei: string;
      brand: string;
      model: string;
      condition: string;
      imeiVerified: boolean;
      createdAt: string;
      customer: { name: string; email: string; phone: string | null };
      registeredByName: string;
      shopName: string | null;
      salesmanName: string | null;
      packagePrice: number | null;
      firstPaymentAmount: number | null;
      warranty: { tierLabel: string; status: string } | null;
    }[]
  >([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [deviceQuery, setDeviceQuery] = useState("");
  const [confirmVerifyId, setConfirmVerifyId] = useState<string | null>(null);

  // "Show more / Show less" — keeps sections short by default when there's
  // a lot of data, without hiding anything permanently.
  const PAGE_SIZE = 5;
  const [expandedManagement, setExpandedManagement] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState(false);
  const [expandedDevices, setExpandedDevices] = useState(false);
  const [expandedPackages, setExpandedPackages] = useState(false);
  const [expandedClaims, setExpandedClaims] = useState(false);
  const [expandedRepairCenters, setExpandedRepairCenters] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(false);

  const [agents, setAgents] = useState<
    {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      suspended: boolean;
      deviceCount: number;
      shopId: string | null;
      shopName: string | null;
    }[]
  >([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [shopOptions, setShopOptions] = useState<{ id: string; name: string; location: string }[]>([]);
  const [savingAgentId, setSavingAgentId] = useState<string | null>(null);

  const [repairCenters, setRepairCenters] = useState<
    { id: string; name: string; location: string; phone: string; active: boolean }[]
  >([]);
  const [repairCentersLoading, setRepairCentersLoading] = useState(true);
  const [showRepairCenterForm, setShowRepairCenterForm] = useState(false);
  const [repairCenterForm, setRepairCenterForm] = useState({ name: "", location: "", phone: "" });
  const [repairCenterError, setRepairCenterError] = useState<string | null>(null);
  const [savingRepairCenter, setSavingRepairCenter] = useState(false);
  const [repairCenterActionId, setRepairCenterActionId] = useState<string | null>(null);

  async function loadRepairCenters() {
    setRepairCentersLoading(true);
    const res = await fetch("/api/admin/repair-centers");
    if (res.ok) setRepairCenters((await res.json()).repairCenters);
    setRepairCentersLoading(false);
  }

  async function createRepairCenter() {
    setRepairCenterError(null);
    if (!repairCenterForm.name || !repairCenterForm.location || !repairCenterForm.phone) {
      setRepairCenterError("Fill in all fields.");
      return;
    }
    setSavingRepairCenter(true);
    const res = await fetch("/api/admin/repair-centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(repairCenterForm),
    });
    setSavingRepairCenter(false);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setRepairCenterError(err?.error || "Couldn't save. Please try again.");
      return;
    }
    setRepairCenterForm({ name: "", location: "", phone: "" });
    setShowRepairCenterForm(false);
    loadRepairCenters();
  }

  async function toggleRepairCenterActive(id: string, active: boolean) {
    setRepairCenterActionId(id);
    await fetch(`/api/admin/repair-centers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setRepairCenterActionId(null);
    loadRepairCenters();
  }

  async function deleteRepairCenter(id: string) {
    setRepairCenterActionId(id);
    await fetch(`/api/admin/repair-centers/${id}`, { method: "DELETE" });
    setRepairCenterActionId(null);
    loadRepairCenters();
  }

  useEffect(() => {
    loadRepairCenters();
  }, []);

  async function loadAgents() {
    setAgentsLoading(true);
    const res = await fetch("/api/admin/agents");
    if (res.ok) setAgents((await res.json()).agents);
    setAgentsLoading(false);
  }

  async function loadShopOptions() {
    const res = await fetch("/api/admin/shops");
    if (res.ok) setShopOptions((await res.json()).shops);
  }

  async function assignAgentShop(agentId: string, shopId: string) {
    setSavingAgentId(agentId);
    await fetch(`/api/admin/users/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: shopId === "" ? null : shopId }),
    });
    setSavingAgentId(null);
    loadAgents();
  }

  useEffect(() => {
    loadAgents();
    loadShopOptions();
  }, []);

  async function loadDevices(q?: string) {
    setDevicesLoading(true);
    const res = await fetch(`/api/admin/devices${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    if (res.ok) setDevices((await res.json()).devices);
    setDevicesLoading(false);
  }

  function exportDevicesToExcel() {
    const headers = [
      "Device",
      "IMEI",
      "Customer",
      "Mobile",
      "Shop",
      "Salesman",
      "Package price",
      "First payment",
      "Balance",
      "Warranty",
      "IMEI status",
    ];

    const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    // Excel auto-detects long all-digit strings as numbers (scientific notation,
    // dropped leading zeros). Wrapping as ="..." forces it to keep the exact text.
    const asText = (value: string) => `"=""${value.replace(/"/g, '""')}"""`;

    const rows = devices.map((d) => {
      const packagePrice = d.packagePrice ?? 0;
      const firstPayment = d.firstPaymentAmount ?? 0;
      const balance = Math.max(0, packagePrice - firstPayment);
      return [
        escapeCell(`${d.brand} ${d.model}`),
        asText(d.imei),
        escapeCell(d.customer.name),
        d.customer.phone ? asText(d.customer.phone) : escapeCell(""),
        escapeCell(d.shopName ?? ""),
        escapeCell(d.salesmanName ?? ""),
        escapeCell(d.packagePrice != null ? packagePrice : ""),
        escapeCell(d.packagePrice != null ? firstPayment : ""),
        escapeCell(d.packagePrice != null ? balance : ""),
        escapeCell(d.warranty ? `${d.warranty.tierLabel} (${d.warranty.status})` : "None"),
        escapeCell(d.imeiVerified ? "Verified" : "Unverified"),
      ].join(",");
    });

    const csv = [headers.map(escapeCell).join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devices-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadDevices();
  }, []);

  async function toggleImeiVerified(deviceId: string, imeiVerified: boolean) {
    setActingId(deviceId);
    setConfirmVerifyId(null);
    await fetch(`/api/admin/devices/${deviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imeiVerified }),
    });
    setActingId(null);
    loadDevices(deviceQuery);
  }

  async function loadDashboard() {
    setLoading(true);
    const res = await fetch("/api/admin/dashboard");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function decide(claimId: string, status: "APPROVED" | "REJECTED") {
    setDecidingId(claimId);
    await fetch(`/api/claims/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setDecidingId(null);
    loadDashboard();
  }

  async function deleteMessage(id: string) {
    setDeletingMessageId(id);
    await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
    setDeletingMessageId(null);
    loadDashboard();
  }

  async function toggleSuspend(userId: string, suspended: boolean) {
    setActingId(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended }),
    });
    setActingId(null);
    loadDashboard();
  }

  async function toggleVerified(shopId: string, verified: boolean) {
    setActingId(shopId);
    await fetch(`/api/admin/shops/${shopId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified }),
    });
    setActingId(null);
    loadDashboard();
  }

  const [notifAudience, setNotifAudience] = useState<"ALL_CUSTOMERS" | "ALL_AGENTS" | "SPECIFIC">(
    "ALL_CUSTOMERS"
  );
  const [notifRecipientEmail, setNotifRecipientEmail] = useState("");
  const [notifSubject, setNotifSubject] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSending, setNotifSending] = useState(false);
  const [notifResult, setNotifResult] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  async function sendNotification() {
    setNotifSending(true);
    setNotifError(null);
    setNotifResult(null);

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience: notifAudience,
        recipientEmail: notifAudience === "SPECIFIC" ? notifRecipientEmail : undefined,
        subject: notifSubject,
        message: notifMessage,
      }),
    });
    const result = await res.json();
    setNotifSending(false);

    if (!res.ok) {
      setNotifError(result.error || "Something went wrong.");
      return;
    }

    setNotifResult(
      `Sent to ${result.recipientCount} recipient${result.recipientCount === 1 ? "" : "s"} — ${result.emailsSent} email(s).`
    );
    setNotifSubject("");
    setNotifMessage("");
  }

  const managementRows =
    tab === "Customers" ? data?.management.customers ?? [] : data?.management.shops ?? [];

  return (
    <DashboardShell
      role="admin"
      roleLabel="Admin Portal"
      userName={session?.user?.name ?? "Admin"}
      userMeta={session?.user?.email ?? ""}
      navGroups={navGroups}
    >
      <section id="overview" className="scroll-mt-24">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Executive Dashboard
        </h1>
        <p className="mt-1 text-[13.5px] text-secondary">
          Network-wide performance across all shops and portals.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Users} label="Total customers" value={loading ? "—" : String(data?.stats.customerCount ?? 0)} index={0} />
          <StatCard icon={Store} label="Active agents" value={loading ? "—" : String(data?.stats.agentCount ?? 0)} index={1} />
          <StatCard icon={DollarSign} label="Revenue this month" value={loading ? "—" : `Rs. ${(data?.stats.revenueThisMonth ?? 0).toLocaleString()}`} index={2} />
          <StatCard icon={Wrench} label="Claims pending" value={loading ? "—" : String(data?.stats.pendingClaims ?? 0)} positive={false} index={3} />
        </div>
      </section>

      <SectionCard id="financial" title="Revenue Analytics" subtitle="Monthly paid revenue, in Rs. millions">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenueByMonth ?? []}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4FDCE8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4FDCE8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#20C7D6" strokeWidth={2} fill="url(#revFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-soft p-4">
            <p className="text-[11.5px] text-secondary">Pending payments</p>
            <p className="mt-1 font-display text-xl font-bold">Rs. {(data?.stats.pendingPayments ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-soft p-4">
            <p className="text-[11.5px] text-secondary">Commission payable</p>
            <p className="mt-1 font-display text-xl font-bold">Rs. {(data?.stats.pendingCommission ?? 0).toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-soft p-4">
            <p className="text-[11.5px] text-secondary">Agents on network</p>
            <p className="mt-1 font-display text-xl font-bold">{data?.stats.agentCount ?? 0}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="management"
        title="Customer & Shop Management"
        subtitle="Most recently created records across the network"
      >
        <div className="mb-5 inline-flex flex-wrap rounded-full border border-soft p-1">
          {(["Customers", "Shops"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors ${
                tab === t
                  ? "bg-navy-900 text-white dark:bg-cyan-400 dark:text-navy-900"
                  : "text-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-[12.5px] text-secondary">Loading...</p>
        ) : !managementRows.length ? (
          <p className="text-[12.5px] text-secondary">Nothing here yet.</p>
        ) : (
          <ul className="space-y-3">
            {(expandedManagement ? managementRows : managementRows.slice(0, PAGE_SIZE)).map((row) => {
              const isShop = tab === "Shops";
              const isActive = isShop
                ? (row as { verified: boolean }).verified
                : !(row as { suspended: boolean }).suspended;
              return (
                <li key={row.id} className="flex items-center justify-between rounded-xl border border-soft p-3.5 text-[12.5px]">
                  <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-secondary">{row.meta}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {isShop ? (isActive ? "Verified" : "Unverified") : isActive ? "Active" : "Suspended"}
                    </span>
                    <button
                      onClick={() =>
                        isShop
                          ? toggleVerified(row.id, !isActive)
                          : toggleSuspend(row.id, isActive)
                      }
                      disabled={actingId === row.id}
                      className="rounded-full border border-soft px-3 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500 disabled:opacity-50"
                    >
                      {actingId === row.id
                        ? "..."
                        : isShop
                        ? isActive
                          ? "Unverify"
                          : "Verify"
                        : isActive
                        ? "Suspend"
                        : "Activate"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <ShowMoreButton
          expanded={expandedManagement}
          onToggle={() => setExpandedManagement((v) => !v)}
          remaining={Math.max(0, managementRows.length - PAGE_SIZE)}
        />
      </SectionCard>

      <SectionCard
        id="agents"
        title="Agent Management"
        subtitle="Assign each agent to a shop, and manage account status"
      >
        {agentsLoading ? (
          <p className="text-[12.5px] text-secondary">Loading...</p>
        ) : !agents.length ? (
          <p className="text-[12.5px] text-secondary">No agents yet.</p>
        ) : (
          <ul className="space-y-3">
            {(expandedAgents ? agents : agents.slice(0, PAGE_SIZE)).map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-soft p-3.5 text-[12.5px]"
              >
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-secondary">
                    {a.email} · {a.deviceCount} device{a.deviceCount === 1 ? "" : "s"} registered
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={a.shopId ?? ""}
                    onChange={(e) => assignAgentShop(a.id, e.target.value)}
                    disabled={savingAgentId === a.id}
                    className="rounded-full border border-soft bg-elevated px-3 py-1.5 text-[11.5px] outline-none focus:border-cyan-400 disabled:opacity-50"
                  >
                    <option value="">No shop assigned</option>
                    {shopOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.location}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      a.suspended
                        ? "bg-red-500/10 text-red-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {a.suspended ? "Suspended" : "Active"}
                  </span>
                  <button
                    onClick={() => toggleSuspend(a.id, !a.suspended).then(loadAgents)}
                    disabled={actingId === a.id}
                    className="rounded-full border border-soft px-3 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500 disabled:opacity-50"
                  >
                    {actingId === a.id ? "..." : a.suspended ? "Activate" : "Suspend"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <ShowMoreButton
          expanded={expandedAgents}
          onToggle={() => setExpandedAgents((v) => !v)}
          remaining={Math.max(0, agents.length - PAGE_SIZE)}
        />
      </SectionCard>

      <SectionCard
        id="devices"
        title="Device & IMEI Management"
        subtitle="Search devices and verify IMEI numbers"
        action={
          <button
            onClick={exportDevicesToExcel}
            disabled={!devices.length}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-soft px-3.5 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500 disabled:opacity-50"
          >
            <Download size={13} />
            Export to Excel
          </button>
        }
      >
        <div className="mb-4 flex items-center gap-2 rounded-full border border-soft px-3.5 py-2">
          <Smartphone size={14} className="text-secondary" />
          <input
            value={deviceQuery}
            onChange={(e) => setDeviceQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadDevices(deviceQuery);
            }}
            placeholder="Search by IMEI, brand, model, customer, or salesman name..."
            className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-secondary/60"
          />
          <button
            onClick={() => loadDevices(deviceQuery)}
            className="shrink-0 rounded-full bg-navy-900 px-3.5 py-1.5 text-[11.5px] font-semibold text-white dark:bg-cyan-400 dark:text-navy-900"
          >
            Search
          </button>
        </div>

        {devicesLoading ? (
          <p className="text-[12.5px] text-secondary">Loading devices...</p>
        ) : !devices.length ? (
          <p className="text-[12.5px] text-secondary">No devices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-soft text-secondary">
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">IMEI</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Shop</th>
                  <th className="pb-3 font-medium">Package</th>
                  <th className="pb-3 font-medium">IMEI status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(expandedDevices ? devices : devices.slice(0, PAGE_SIZE)).map((d) => (
                  <tr key={d.id} className="border-b border-soft last:border-0">
                    <td className="py-3 font-medium">
                      {d.brand} {d.model}
                      <span className="ml-1.5 rounded-full bg-navy-900/5 px-2 py-0.5 text-[10.5px] text-secondary dark:bg-white/10">
                        {d.condition}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11.5px] text-secondary">{d.imei}</td>
                    <td className="py-3">
                      <p className="text-secondary">{d.customer.name}</p>
                      {d.customer.phone && (
                        <p className="font-mono text-[11px] text-secondary/70">{d.customer.phone}</p>
                      )}
                    </td>
                    <td className="py-3">
                      {d.shopName ? (
                        <p className="text-secondary">{d.shopName}</p>
                      ) : (
                        <p className="text-secondary">—</p>
                      )}
                      {d.salesmanName && (
                        <p className="text-[11px] text-secondary/70">Salesman: {d.salesmanName}</p>
                      )}
                    </td>
                    <td className="py-3">
                      {d.packagePrice != null ? (
                        <>
                          <p className="font-mono text-secondary">Rs. {d.packagePrice.toLocaleString()}</p>
                          <p className="text-[11px] text-secondary/70">
                            Paid Rs. {(d.firstPaymentAmount ?? 0).toLocaleString()} · Bal Rs.{" "}
                            {Math.max(0, d.packagePrice - (d.firstPaymentAmount ?? 0)).toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <span className="text-secondary">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          d.imeiVerified
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {d.imeiVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="py-3">
                      {confirmVerifyId === d.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11.5px] text-secondary">Are you sure?</span>
                          <button
                            onClick={() => toggleImeiVerified(d.id, !d.imeiVerified)}
                            disabled={actingId === d.id}
                            className="rounded-full bg-navy-900 px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
                          >
                            {actingId === d.id ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmVerifyId(null)}
                            className="rounded-full border border-soft px-3 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmVerifyId(d.id)}
                          className="rounded-full border border-soft px-3 py-1.5 text-[11.5px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500"
                        >
                          {d.imeiVerified ? "Unverify" : "Verify"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ShowMoreButton
          expanded={expandedDevices}
          onToggle={() => setExpandedDevices((v) => !v)}
          remaining={Math.max(0, devices.length - PAGE_SIZE)}
        />
      </SectionCard>

      <SectionCard
        id="packages"
        title="Customer Packages"
        subtitle="Package price, what's been paid, and what's left — per customer"
      >
        {devicesLoading ? (
          <p className="text-[12.5px] text-secondary">Loading...</p>
        ) : !devices.filter((d) => d.packagePrice != null).length ? (
          <p className="text-[12.5px] text-secondary">No packages recorded yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(expandedPackages
              ? devices.filter((d) => d.packagePrice != null)
              : devices.filter((d) => d.packagePrice != null).slice(0, PAGE_SIZE)
            )
              .map((d) => {
                const packagePrice = d.packagePrice ?? 0;
                const firstPayment = d.firstPaymentAmount ?? 0;
                const balance = Math.max(0, packagePrice - firstPayment);
                const daysLeft = daysLeftToPay(d.createdAt);
                return (
                  <div key={d.id} className="rounded-xl border border-soft p-4 text-[12.5px]">
                    <p className="font-semibold">{d.brand} {d.model}</p>
                    <p className="mt-0.5 text-secondary">{d.customer.name}</p>
                    {d.customer.phone && (
                      <p className="font-mono text-[11px] text-secondary/70">{d.customer.phone}</p>
                    )}
                    <div className="mt-3 space-y-1.5 text-secondary">
                      <div className="flex justify-between">
                        <span>Package</span>
                        <span className="font-mono text-navy-900 dark:text-white">
                          Rs. {packagePrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>First payment</span>
                        <span className="font-mono text-navy-900 dark:text-white">
                          Rs. {firstPayment.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance to pay</span>
                        <span className="font-mono text-navy-900 dark:text-white">
                          Rs. {balance.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Days left to pay</span>
                        <span
                          className={`font-mono ${
                            daysLeft <= 30 ? "text-red-500" : "text-navy-900 dark:text-white"
                          }`}
                        >
                          {balance > 0 ? `${daysLeft} days` : "Fully paid"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        <ShowMoreButton
          expanded={expandedPackages}
          onToggle={() => setExpandedPackages((v) => !v)}
          remaining={Math.max(
            0,
            devices.filter((d) => d.packagePrice != null).length - PAGE_SIZE
          )}
        />
      </SectionCard>

      <SectionCard id="claims" title="Claims Approval Queue" subtitle="Claims awaiting a decision">
        {loading ? (
          <p className="text-[12.5px] text-secondary">Loading...</p>
        ) : !data?.claimsQueue.length ? (
          <p className="text-[12.5px] text-secondary">No claims waiting for review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-soft text-secondary">
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Issue</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(expandedClaims ? data.claimsQueue : data.claimsQueue.slice(0, PAGE_SIZE)).map((c) => (
                  <tr key={c.id} className="border-b border-soft last:border-0">
                    <td className="py-3">{c.device.brand} {c.device.model}</td>
                    <td className="py-3 text-secondary">{c.customer.name}</td>
                    <td className="py-3 text-secondary">{c.issue}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(c.id, "APPROVED")}
                          disabled={decidingId === c.id}
                          className="rounded-full bg-navy-900 px-3 py-1.5 text-[11.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => decide(c.id, "REJECTED")}
                          disabled={decidingId === c.id}
                          className="rounded-full border border-soft px-3 py-1.5 text-[11.5px] font-semibold text-secondary disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ShowMoreButton
          expanded={expandedClaims}
          onToggle={() => setExpandedClaims((v) => !v)}
          remaining={Math.max(0, (data?.claimsQueue.length ?? 0) - PAGE_SIZE)}
        />
      </SectionCard>

      <SectionCard
        id="repair-centers"
        title="Repair Centers"
        subtitle="Partner repair shops customers can be routed to"
        action={
          <button
            onClick={() => setShowRepairCenterForm((v) => !v)}
            className="rounded-full bg-navy-900 px-4 py-2 text-[12.5px] font-semibold text-white dark:bg-cyan-400 dark:text-navy-900"
          >
            + Add Center
          </button>
        }
      >
        {showRepairCenterForm && (
          <div className="mb-5 rounded-xl border border-soft p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                value={repairCenterForm.name}
                onChange={(e) =>
                  setRepairCenterForm({ ...repairCenterForm, name: e.target.value })
                }
                placeholder="Center name"
                className="rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
              <input
                value={repairCenterForm.location}
                onChange={(e) =>
                  setRepairCenterForm({ ...repairCenterForm, location: e.target.value })
                }
                placeholder="Location (e.g. Kandy)"
                className="rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
              <input
                value={repairCenterForm.phone}
                onChange={(e) =>
                  setRepairCenterForm({ ...repairCenterForm, phone: e.target.value })
                }
                placeholder="Phone number"
                className="rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
              <button
                onClick={createRepairCenter}
                disabled={savingRepairCenter}
                className="rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
              >
                {savingRepairCenter ? "Saving..." : "Save"}
              </button>
            </div>
            {repairCenterError && (
              <p className="mt-2 text-[11.5px] text-red-500">{repairCenterError}</p>
            )}
          </div>
        )}

        {repairCentersLoading ? (
          <p className="text-[12.5px] text-secondary">Loading repair centers...</p>
        ) : repairCenters.length === 0 ? (
          <p className="text-[12.5px] text-secondary">
            No repair centers added yet. Click "+ Add Center" to add your first one.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(expandedRepairCenters ? repairCenters : repairCenters.slice(0, PAGE_SIZE)).map((c) => (
              <div key={c.id} className="rounded-xl border border-soft p-4">
                <div className="flex items-start justify-between gap-2">
                  <Wrench size={16} className="mt-0.5 text-cyan-500" />
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      c.active
                        ? "bg-cyan-400/15 text-cyan-500"
                        : "bg-navy-900/5 text-secondary dark:bg-white/10"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-3 text-[12.5px] font-semibold">{c.name}</p>
                <p className="mt-1 text-[12px] text-secondary">{c.location}</p>
                <p className="text-[12px] text-secondary">{c.phone}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleRepairCenterActive(c.id, !c.active)}
                    disabled={repairCenterActionId === c.id}
                    className="rounded-full border border-soft px-3 py-1 text-[11px] font-semibold hover:border-cyan-400 disabled:opacity-50"
                  >
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => deleteRepairCenter(c.id)}
                    disabled={repairCenterActionId === c.id}
                    className="rounded-full border border-soft px-3 py-1 text-[11px] font-semibold text-red-500 hover:border-red-500 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <ShowMoreButton
          expanded={expandedRepairCenters}
          onToggle={() => setExpandedRepairCenters((v) => !v)}
          remaining={Math.max(0, repairCenters.length - PAGE_SIZE)}
        />
      </SectionCard>

      <SectionCard
        id="operations"
        title="Operations"
        subtitle="Notification broadcasts and email automation"
      >
        {notifError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-[12.5px] text-red-500">
            {notifError}
          </div>
        )}
        {notifResult && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5 text-[12.5px] text-emerald-600 dark:text-emerald-400">
            {notifResult}
          </div>
        )}

        <div className="rounded-2xl border border-soft p-5">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-cyan-500" />
            <p className="text-[13px] font-semibold">Notification Center</p>
          </div>
          <p className="mt-1 text-[12px] text-secondary">
            Send a real email to customers or agents, right now.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                Send to
              </label>
              <select
                value={notifAudience}
                onChange={(e) => setNotifAudience(e.target.value as typeof notifAudience)}
                className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              >
                <option value="ALL_CUSTOMERS">All customers</option>
                <option value="ALL_AGENTS">All agents</option>
                <option value="SPECIFIC">Specific person (by email)</option>
              </select>
            </div>

            {notifAudience === "SPECIFIC" && (
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                  Recipient email
                </label>
                <input
                  type="email"
                  value={notifRecipientEmail}
                  onChange={(e) => setNotifRecipientEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                Subject
              </label>
              <input
                value={notifSubject}
                onChange={(e) => setNotifSubject(e.target.value)}
                placeholder="e.g. Your warranty is expiring soon"
                className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                Message
              </label>
              <textarea
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                rows={4}
                placeholder="Write the message that goes in the email body..."
                className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            onClick={sendNotification}
            disabled={notifSending || !notifSubject || !notifMessage}
            className="mt-4 rounded-full bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
          >
            {notifSending ? "Sending..." : "Send notification"}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        id="contact-messages"
        title="Contact Messages"
        subtitle="Submissions from the public Contact page"
      >
        {!data?.contactMessages.length ? (
          <p className="text-[12.5px] text-secondary">No messages yet.</p>
        ) : (
          <ul className="space-y-3">
            {(expandedMessages ? data.contactMessages : data.contactMessages.slice(0, PAGE_SIZE)).map((m) => (
              <li
                key={m.id}
                className={`rounded-xl border p-4 text-[12.5px] ${
                  m.read ? "border-soft" : "border-cyan-400/60 bg-cyan-400/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
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
                    <p className="mt-0.5 text-secondary">
                      {m.name} · {m.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => deleteMessage(m.id)}
                      disabled={deletingMessageId === m.id}
                      className="rounded-full border border-soft px-3 py-1 text-[11px] font-semibold text-red-500 hover:border-red-500 disabled:opacity-50"
                    >
                      {deletingMessageId === m.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-secondary">{m.message}</p>
                <p className="mt-2 text-[11px] text-secondary/70">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
        <ShowMoreButton
          expanded={expandedMessages}
          onToggle={() => setExpandedMessages((v) => !v)}
          remaining={Math.max(0, (data?.contactMessages.length ?? 0) - PAGE_SIZE)}
        />
      </SectionCard>

      <SectionCard
        id="system"
        title="System"
        subtitle="Roles, permissions, audit logs, backups and configuration"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: KeyRound, label: "Roles & Permissions", value: "4 roles: Customer, Agent, Call Center, Admin" },
            { icon: FileClock, label: "Audit Logs", value: "Not connected" },
            { icon: Archive, label: "Backup Management", value: "Managed by your Postgres host" },
            { icon: ShieldQuestion, label: "System Settings", value: "Not connected" },
          ].map((o) => (
            <div key={o.label} className="rounded-xl border border-soft p-4">
              <o.icon size={16} className="text-cyan-500" />
              <p className="mt-3 text-[12.5px] font-semibold">{o.label}</p>
              <p className="mt-1 text-[12px] text-secondary">{o.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}