"use client";

import {
  AlertCircle,
  BarChart3,
  Bell,
  Camera,
  CheckCircle2,
  FileBarChart,
  Gauge,
  PackageSearch,
  ScanLine,
  Settings,
  Smartphone,
  Video,
  Wallet,
  Wrench,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
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
  { label: "Overview", items: [{ label: "Dashboard", href: "#overview", icon: Gauge }] },
  {
    label: "Registration",
    items: [
      { label: "Register Device", href: "#register", icon: Smartphone },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Recent Registrations", href: "#stock", icon: PackageSearch },
      { label: "Sales Analytics", href: "#sales", icon: BarChart3 },
      { label: "Commission Tracking", href: "#commission", icon: Wallet },
      { label: "Claim Tracking", href: "#claims", icon: Wrench },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Notifications", href: "#notifications", icon: Bell },
      { label: "Reports", href: "#reports", icon: FileBarChart },
      { label: "Profile & Settings", href: "#profile", icon: Settings },
    ],
  },
];

interface DashboardData {
  stats: { devicesThisMonth: number; commissionThisMonth: number; openClaims: number };
  recentDevices: {
    id: string;
    brand: string;
    model: string;
    imei: string;
    condition: string;
    createdAt: string;
    customer: { name: string };
    warranty: { tierLabel: string; price: number } | null;
  }[];
  commissions: { id: string; amount: number; status: string; createdAt: string }[];
  claims: {
    id: string;
    issue: string;
    status: string;
    device: { brand: string; model: string };
    customer: { name: string };
  }[];
  salesByDay: { day: string; sales: number }[];
  notifications: { id: string; title: string; body: string; createdAt: string; read: boolean }[];
}

export default function AgentDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceType, setDeviceType] = useState<"NEW" | "USED">("NEW");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    imei: "",
    brand: "",
    model: "",
    modelCode: "",
    value: "",
    packagePrice: "",
    salesmanName: "",
    firstPaymentAmount: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoError, setVideoError] = useState<string | null>(null);

  function handlePhotoSelect(files: FileList | null) {
    if (!files) return;
    setPhotoError(null);
    const remaining = 4 - photos.length;
    const selected = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      setPhotoError("Maximum 4 photos allowed.");
    }

    selected.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        setPhotoError(`${file.name} is too large (max 3MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleVideoSelect(files: FileList | null) {
    if (!files) return;
    setVideoError(null);
    const remaining = 3 - videos.length;
    const selected = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      setVideoError("Maximum 3 videos allowed.");
    }

    selected.forEach((file) => {
      if (!file.type.startsWith("video/")) {
        setVideoError(`${file.name} isn't a video file.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setVideoError(`${file.name} is too large (max 25MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setVideos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeVideo(index: number) {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDownloadReport(period: "week" | "month" | "quarter") {
    if (!data) return;
    const now = new Date();
    const cutoff = new Date(now);
    if (period === "week") cutoff.setDate(now.getDate() - 7);
    if (period === "month") cutoff.setMonth(now.getMonth() - 1);
    if (period === "quarter") cutoff.setMonth(now.getMonth() - 3);

    const rows = data.recentDevices.filter((d) => new Date(d.createdAt) >= cutoff);

    const header = ["Date", "Customer", "Brand", "Model", "IMEI", "Condition", "Plan", "Premium (Rs.)"];
    const csvRows = rows.map((d) => [
      new Date(d.createdAt).toLocaleDateString(),
      d.customer.name,
      d.brand,
      d.model,
      d.imei,
      d.condition,
      d.warranty?.tierLabel ?? "—",
      d.warranty?.price ?? "",
    ]);

    const csv = [header, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dwp-agent-report-${period}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function loadDashboard() {
    setLoading(true);
    const res = await fetch("/api/agent/dashboard");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const [deletingNotificationId, setDeletingNotificationId] = useState<string | null>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.name) setProfileName(session.user.name);
  }, [session?.user?.name]);

  async function handleSaveProfile() {
    setProfileError(null);
    setProfileSaved(false);
    setProfileSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileName }),
    });
    setProfileSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setProfileError(err?.error ?? "Couldn't save. Please try again.");
      return;
    }
    setProfileSaved(true);
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleChangePassword() {
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setPasswordSaving(true);
    const res = await fetch("/api/profile/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setPasswordSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      setPasswordError(err?.error ?? "Couldn't change password. Please try again.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
  }

  async function deleteNotification(id: string) {
    setDeletingNotificationId(id);
    setNotificationError(null);
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error("Delete notification failed:", res.status, body);
        setNotificationError(
          `Couldn't delete (${res.status}): ${body?.error ?? "Unknown error"}`
        );
        return;
      }
      await loadDashboard();
    } catch (err) {
      console.error("Delete notification network error:", err);
      setNotificationError("Network error — couldn't reach the server.");
    } finally {
      setDeletingNotificationId(null);
    }
  }

  async function handleRegisterDevice() {
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    const res = await fetch("/api/agent/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        value: Number(form.value),
        packagePrice: form.packagePrice ? Number(form.packagePrice) : undefined,
        firstPaymentAmount: form.firstPaymentAmount ? Number(form.firstPaymentAmount) : undefined,
        condition: deviceType,
        imageUrls: photos,
        videoUrls: videos,
      }),
    });
    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(result.error || "Something went wrong.");
      return;
    }

    setFormSuccess(
      `Activated ${result.device.warranty.tierLabel} — Rs. ${result.device.warranty.price.toLocaleString()}/yr`
    );
    setForm({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      imei: "",
      brand: "",
      model: "",
      modelCode: "",
      value: "",
      packagePrice: "",
      salesmanName: "",
      firstPaymentAmount: "",
    });
    setPhotos([]);
    setVideos([]);
    loadDashboard();
  }

  return (
    <DashboardShell
      role="agent"
      roleLabel="Agent Portal"
      userName={session?.user?.name ?? "Agent"}
      userMeta={session?.user?.email ?? ""}
      navGroups={navGroups}
    >
      <section id="overview" className="scroll-mt-24">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Good day, {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-[13.5px] text-secondary">
          {loading ? "Loading your activity..." : `${data?.stats.openClaims ?? 0} claims need your attention.`}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Smartphone} label="Registered this month" value={loading ? "—" : String(data?.stats.devicesThisMonth ?? 0)} index={0} />
          <StatCard icon={Wallet} label="Commission this month" value={loading ? "—" : `Rs. ${(data?.stats.commissionThisMonth ?? 0).toLocaleString()}`} index={1} />
          <StatCard icon={PackageSearch} label="Total registrations" value={loading ? "—" : String(data?.recentDevices.length ?? 0)} index={2} />
          <StatCard icon={Wrench} label="Open claims" value={loading ? "—" : String(data?.stats.openClaims ?? 0)} positive={false} index={3} />
        </div>
      </section>

      <SectionCard
        id="register"
        title="Register a Device"
        subtitle="New or used phone, customer details, IMEI — activates a real warranty on submit"
      >
        <div className="mb-5 inline-flex rounded-full border border-soft p-1">
          {(["NEW", "USED"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDeviceType(t)}
              className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold capitalize transition-colors ${
                deviceType === t
                  ? "bg-navy-900 text-white dark:bg-cyan-400 dark:text-navy-900"
                  : "text-secondary"
              }`}
            >
              {t.toLowerCase()} phone
            </button>
          ))}
        </div>

        {formError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-3.5 py-2.5 text-[12.5px] text-red-500">
            <AlertCircle size={15} />
            {formError}
          </div>
        )}
        {formSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5 text-[12.5px] text-emerald-500">
            <CheckCircle2 size={15} />
            {formSuccess}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Customer name</label>
            <input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Customer full name"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Customer email</label>
            <input
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              placeholder="customer@email.com"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Customer mobile</label>
            <input
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              placeholder="07X XXX XXXX"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">IMEI number</label>
            <div className="flex items-center gap-2 rounded-xl border border-soft bg-elevated px-3.5 py-2.5 focus-within:border-cyan-400">
              <ScanLine size={15} className="text-secondary" />
              <input
                value={form.imei}
                onChange={(e) => setForm({ ...form, imei: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                placeholder="15-digit IMEI"
                className="w-full bg-transparent font-mono text-[13px] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Brand</label>
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="e.g. Apple"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Model</label>
            <input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="e.g. iPhone 15 Pro"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Model code</label>
            <input
              value={form.modelCode}
              onChange={(e) => setForm({ ...form, modelCode: e.target.value })}
              placeholder="e.g. A3108"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Device value (Rs.)</label>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 145000"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 font-mono text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Package price (Rs.)</label>
            <input
              value={form.packagePrice}
              onChange={(e) => setForm({ ...form, packagePrice: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 6990"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 font-mono text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Salesman name</label>
            <input
              value={form.salesmanName}
              onChange={(e) => setForm({ ...form, salesmanName: e.target.value })}
              placeholder="Salesman full name"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">First payment amount (Rs.)</label>
            <input
              value={form.firstPaymentAmount}
              onChange={(e) => setForm({ ...form, firstPaymentAmount: e.target.value.replace(/\D/g, "") })}
              placeholder="e.g. 2000"
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 font-mono text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            {deviceType === "USED" ? "AI phone inspection photos" : "Device photos"}
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-soft p-5 hover:border-cyan-400">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
              <Camera size={18} />
            </span>
            <div>
              <p className="text-[12.5px] font-medium">Click to upload photos</p>
              <p className="text-[11.5px] text-secondary">Up to 4 images, 3MB each</p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotoSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {photoError && <p className="mt-2 text-[11.5px] text-red-500">{photoError}</p>}

          {photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {photos.map((src, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-soft">
                  <img src={src} alt={`Device photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-[12px] font-medium text-secondary">
            Device videos
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-soft p-5 hover:border-cyan-400">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
              <Video size={18} />
            </span>
            <div>
              <p className="text-[12.5px] font-medium">Click to upload videos</p>
              <p className="text-[11.5px] text-secondary">Up to 3 videos, 25MB each</p>
            </div>
            <input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleVideoSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </label>

          {videoError && <p className="mt-2 text-[11.5px] text-red-500">{videoError}</p>}

          {videos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {videos.map((src, i) => (
                <div key={i} className="group relative h-20 w-32 overflow-hidden rounded-xl border border-soft bg-black">
                  <video src={src} className="h-full w-full object-cover" muted />
                  <button
                    type="button"
                    onClick={() => removeVideo(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove video"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleRegisterDevice}
          disabled={submitting}
          className="mt-5 rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-60 dark:bg-cyan-400 dark:text-navy-900"
        >
          {submitting ? "Activating..." : "Verify & Activate Warranty"}
        </button>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard id="stock" title="Recent Registrations" subtitle="Devices you've registered">
          {loading ? (
            <p className="text-[12.5px] text-secondary">Loading...</p>
          ) : !data?.recentDevices.length ? (
            <p className="text-[12.5px] text-secondary">No devices registered yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentDevices.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-[12.5px]">
                  <div>
                    <p className="font-medium">{d.brand} {d.model}</p>
                    <p className="text-secondary">{d.customer.name} · {d.condition.toLowerCase()}</p>
                  </div>
                  <span className="rounded-full bg-navy-900/5 px-2.5 py-1 font-mono text-[12px] font-semibold dark:bg-white/5">
                    {d.warranty ? `Rs. ${d.warranty.price.toLocaleString()}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard id="sales" title="Sales Analytics" subtitle="Registrations over the last 7 days">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.salesByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sales" fill="#70A2EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard id="commission" title="Commission Tracking">
          {loading ? (
            <p className="text-[12.5px] text-secondary">Loading...</p>
          ) : !data?.commissions.length ? (
            <p className="text-[12.5px] text-secondary">No commissions yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.commissions.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-[12.5px]">
                  <p className="text-secondary">{new Date(c.createdAt).toLocaleDateString()}</p>
                  <div className="text-right">
                    <p className="font-mono font-semibold">Rs. {c.amount.toLocaleString()}</p>
                    <p className={`text-[11px] ${c.status === "PAID" ? "text-emerald-500" : "text-amber-500"}`}>
                      {c.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard id="claims" title="Claim Tracking" subtitle="Claims for devices you registered">
          {loading ? (
            <p className="text-[12.5px] text-secondary">Loading...</p>
          ) : !data?.claims.length ? (
            <p className="text-[12.5px] text-secondary">No claims yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.claims.map((c) => (
                <li key={c.id} className="rounded-xl border border-soft p-3.5 text-[12.5px]">
                  <p className="font-medium">{c.device.brand} {c.device.model} — {c.customer.name}</p>
                  <p className="mt-1 text-secondary">{c.issue} — {c.status.replace(/_/g, " ").toLowerCase()}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard id="notifications" title="Notifications">
        {notificationError && (
          <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[12px] text-red-500">
            {notificationError}
          </p>
        )}
        {!data || data.notifications.length === 0 ? (
          <p className="text-[12.5px] text-secondary">No notifications yet.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {(showAllNotifications
                ? data.notifications
                : data.notifications.slice(0, 2)
              ).map((n) => (
                <li key={n.id} className="rounded-xl border border-soft p-3.5 text-[12.5px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{n.title}</p>
                      <p className="mt-1 text-secondary">{n.body}</p>
                      <p className="mt-1 text-[11px] text-secondary/70">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      disabled={deletingNotificationId === n.id}
                      className="shrink-0 rounded-full border border-soft px-3 py-1 text-[11px] font-semibold text-red-500 hover:border-red-500 disabled:opacity-50"
                    >
                      {deletingNotificationId === n.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {data.notifications.length > 2 && (
              <button
                onClick={() => setShowAllNotifications((v) => !v)}
                className="mt-4 w-full rounded-xl border border-soft py-2 text-[12px] font-semibold text-secondary hover:border-cyan-400 hover:text-cyan-500"
              >
                {showAllNotifications
                  ? "Show less"
                  : `Show ${data.notifications.length - 2} more`}
              </button>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard id="reports" title="Reports" subtitle="Download performance summaries">
        <div className="flex flex-wrap gap-3">
          {(["week", "month", "quarter"] as const).map((period) => (
            <button
              key={period}
              onClick={() => handleDownloadReport(period)}
              className="rounded-full border border-soft px-4 py-2 text-[12.5px] font-medium text-secondary hover:border-cyan-400 hover:text-cyan-500"
            >
              This {period}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-secondary/70">
          Downloads a CSV of your device registrations for the selected period.
        </p>
      </SectionCard>
      <SectionCard id="profile" title="Profile & Settings" subtitle="Your account information">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Full name</label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-secondary">Email</label>
            <input
              defaultValue={session?.user?.email ?? ""}
              disabled
              className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] text-secondary outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={profileSaving || !profileName.trim()}
            className="rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
          >
            {profileSaving ? "Saving..." : "Save changes"}
          </button>
          {profileSaved && (
            <span className="text-[12px] font-medium text-emerald-500">Saved.</span>
          )}
          {profileError && (
            <span className="text-[12px] font-medium text-red-500">{profileError}</span>
          )}
        </div>

        <div className="mt-8 border-t border-soft pt-6">
          <p className="mb-4 font-display text-[13.5px] font-bold">Change password</p>

          {passwordError && (
            <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[12px] text-red-500">
              {passwordError}
            </p>
          )}
          {passwordSaved && (
            <p className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[12px] text-emerald-500">
              Password changed successfully.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none placeholder:text-secondary/60 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
            className="mt-4 rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
          >
            {passwordSaving ? "Changing..." : "Change password"}
          </button>
        </div>
      </SectionCard>
    </DashboardShell>
  );
}