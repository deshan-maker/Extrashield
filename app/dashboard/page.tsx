"use client";

import {
  Bell,
  BellRing,
  Bot,
  Camera,
  CreditCard,
  FileCheck2,
  Gauge,
  QrCode,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  User,
  Wrench,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import DashboardShell, { NavGroup } from "@/components/dashboard/DashboardShell";
import SectionCard from "@/components/dashboard/SectionCard";
import StatCard from "@/components/dashboard/StatCard";

const navGroups: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", href: "#overview", icon: Gauge }] },
  {
    label: "My Devices",
    items: [
      { label: "Registered Devices", href: "#devices", icon: Smartphone },
      { label: "Active Warranties", href: "#devices", icon: ShieldCheck },
      { label: "My Package", href: "#package", icon: CreditCard },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Subscription Details", href: "#payments", icon: CreditCard },
      { label: "Payment History", href: "#payments", icon: CreditCard },
      { label: "EMI Payments", href: "#payments", icon: CreditCard },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Warranty Certificate", href: "#certificate", icon: FileCheck2 },
      { label: "QR Verification", href: "#certificate", icon: QrCode },
    ],
  },
  {
    label: "Claims",
    items: [
      { label: "Claim Submission", href: "#claims", icon: Send },
      { label: "Claim Tracking", href: "#claims", icon: FileCheck2 },
      { label: "Repair Tracking", href: "#claims", icon: Wrench },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "AI Chat Assistant", href: "#assistant", icon: Bot },
      { label: "Notifications", href: "#notifications", icon: BellRing },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "#profile", icon: User },
      { label: "Settings", href: "#profile", icon: Settings },
    ],
  },
];

const CLAIM_STEPS = ["SUBMITTED", "APPROVED", "REPAIR_IN_PROGRESS", "READY_FOR_PICKUP"];

function daysLeftToPay(createdAt: string): number {
  const dueDate = new Date(createdAt);
  dueDate.setFullYear(dueDate.getFullYear() + 1);
  const diffMs = dueDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

interface Warranty {
  id: string;
  tierLabel: string;
  price: number;
  status: string;
  expiresAt: string;
}
interface Device {
  id: string;
  brand: string;
  model: string;
  modelCode: string | null;
  imei: string;
  packagePrice: number | null;
  firstPaymentAmount: number | null;
  createdAt: string;
  warranty: Warranty | null;
}
interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  warranty: { device: { brand: string; model: string } } | null;
}
interface Claim {
  id: string;
  issue: string;
  status: string;
  device: { brand: string; model: string };
}
interface Notification {
  id: string;
  title: string;
  body: string;
}
interface DashboardData {
  stats: {
    deviceCount: number;
    activeWarranties: number;
    claimsInProgress: number;
    nextEmiAmount: number | null;
  };
  devices: Device[];
  payments: Payment[];
  claims: Claim[];
  notifications: Notification[];
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [claimDeviceId, setClaimDeviceId] = useState("");
  const [claimIssue, setClaimIssue] = useState("");
  const [claimPhotos, setClaimPhotos] = useState<string[]>([]);
  const [claimPhotoError, setClaimPhotoError] = useState<string | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

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

  async function loadDashboard() {
    setLoading(true);
    const res = await fetch("/api/customer/dashboard");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (session?.user?.name) setProfileName(session.user.name);
  }, [session?.user?.name]);

  useEffect(() => {
    const deviceWithWarranty = data?.devices.find((d) => d.warranty);
    if (!deviceWithWarranty?.warranty) {
      setQrDataUrl(null);
      return;
    }
    const verifyUrl = `${window.location.origin}/verify/${deviceWithWarranty.warranty.id}`;
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 160, color: { dark: "#0A1628", light: "#00000000" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [data]);

  async function handleSendMessage() {
    const text = message.trim();
    if (!text || chatLoading) return;

    const nextHistory = [...chatMessages, { role: "user" as const, content: text }];
    setChatMessages(nextHistory);
    setMessage("");
    setChatLoading(true);
    setChatError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: chatMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setChatMessages([...nextHistory, { role: "assistant", content: data.reply }]);
    } catch {
      setChatError("Couldn't reach the assistant. Check your connection.");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleDownloadCertificate(warrantyId: string) {
    const res = await fetch(`/api/customer/certificate/${warrantyId}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dwp-warranty-certificate.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleSaveProfile() {
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileName }),
    });
    setProfileSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setProfileError(data?.error || "Couldn't save. Please try again.");
      return;
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function handleClaimPhotoSelect(files: FileList | null) {
    if (!files) return;
    setClaimPhotoError(null);
    const remaining = 4 - claimPhotos.length;
    const selected = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      setClaimPhotoError("Maximum 4 photos allowed.");
    }

    selected.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        setClaimPhotoError(`${file.name} is too large (max 3MB).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setClaimPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeClaimPhoto(index: number) {
    setClaimPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmitClaim() {
    if (!claimDeviceId || !claimIssue) return;
    setSubmitting(true);
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: claimDeviceId,
        issue: claimIssue,
        photoUrls: claimPhotos,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setShowClaimForm(false);
      setClaimIssue("");
      setClaimDeviceId("");
      setClaimPhotos([]);
      setClaimPhotoError(null);
      loadDashboard();
    }
  }

  return (
    <DashboardShell
      role="customer"
      roleLabel="Customer Portal"
      userName={session?.user?.name ?? "Customer"}
      userMeta={session?.user?.email ?? ""}
      navGroups={navGroups}
    >
      <section id="overview" className="scroll-mt-24">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-[13.5px] text-secondary">
          Here's what's happening with your protected devices.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Smartphone} label="Registered devices" value={loading ? "—" : String(data?.stats.deviceCount ?? 0)} index={0} />
          <StatCard icon={ShieldCheck} label="Active warranties" value={loading ? "—" : String(data?.stats.activeWarranties ?? 0)} index={1} />
          <StatCard icon={Wrench} label="Claims in progress" value={loading ? "—" : String(data?.stats.claimsInProgress ?? 0)} index={2} />
          <StatCard
            icon={CreditCard}
            label="Next EMI due"
            value={loading ? "—" : data?.stats.nextEmiAmount ? `Rs. ${data.stats.nextEmiAmount.toLocaleString()}` : "None due"}
            index={3}
          />
        </div>
      </section>

      <SectionCard
        id="devices"
        title="Registered Devices & Active Warranties"
        subtitle="All devices linked to your account"
      >
        {loading ? (
          <p className="text-[12.5px] text-secondary">Loading devices...</p>
        ) : !data?.devices.length ? (
          <p className="text-[12.5px] text-secondary">
            No devices registered yet. Visit a partner shop to register your first device.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-soft text-secondary">
                  <th className="pb-3 font-medium">Device</th>
                  <th className="pb-3 font-medium">IMEI</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody>
                {data.devices.map((d) => (
                  <tr key={d.id} className="border-b border-soft last:border-0">
                    <td className="py-3 font-medium">{d.brand} {d.model}</td>
                    <td className="py-3 font-mono text-[11.5px] text-secondary">{d.imei}</td>
                    <td className="py-3 text-secondary">{d.warranty?.tierLabel ?? "—"}</td>
                    <td className="py-3">
                      {d.warranty ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            d.warranty.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {d.warranty.status.replace("_", " ")}
                        </span>
                      ) : (
                        <span className="text-secondary">No warranty</span>
                      )}
                    </td>
                    <td className="py-3 text-secondary">
                      {d.warranty ? new Date(d.warranty.expiresAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        id="package"
        title="My Package"
        subtitle="Package price, what you've paid, and what's left"
      >
        {loading ? (
          <p className="text-[12.5px] text-secondary">Loading...</p>
        ) : !data?.devices.length ? (
          <p className="text-[12.5px] text-secondary">No devices registered yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.devices.map((d) => {
              // Use the warranty's calculated price — the single source of
              // truth for what a package actually costs (see
              // lib/calculatePackage.ts). d.packagePrice is a separate,
              // agent-editable field for tracking a negotiated deposit and
              // can drift from the real price, so it's not used for display.
              const packagePrice = d.warranty?.price ?? d.packagePrice ?? 0;
              const firstPayment = d.firstPaymentAmount ?? 0;
              const balance = Math.max(0, packagePrice - firstPayment);
              const daysLeft = daysLeftToPay(d.createdAt);
              return (
                <div key={d.id} className="rounded-xl border border-soft p-4 text-[12.5px]">
                  <p className="font-semibold">{d.brand} {d.model}</p>
                  <div className="mt-3 space-y-1.5 text-secondary">
                    <div className="flex justify-between">
                      <span>My package</span>
                      <span className="font-mono text-navy-900 dark:text-white">
                        {packagePrice ? `Rs. ${packagePrice.toLocaleString()}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>My first payment</span>
                      <span className="font-mono text-navy-900 dark:text-white">
                        {d.firstPaymentAmount != null ? `Rs. ${d.firstPaymentAmount.toLocaleString()}` : "—"}
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
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          id="payments"
          title="Subscription & Payment History"
          subtitle="Your recent payments and EMI installments"
        >
          {loading ? (
            <p className="text-[12.5px] text-secondary">Loading payments...</p>
          ) : !data?.payments.length ? (
            <p className="text-[12.5px] text-secondary">No payments recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-[12.5px]">
                  <div>
                    <p className="font-medium">
                      {p.method === "EMI" ? "EMI installment" : "Annual premium"}
                      {p.warranty?.device ? ` — ${p.warranty.device.brand} ${p.warranty.device.model}` : ""}
                    </p>
                    <p className="text-secondary">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">Rs. {p.amount.toLocaleString()}</p>
                    <p className={`text-[11px] ${p.status === "PAID" ? "text-emerald-500" : "text-amber-500"}`}>
                      {p.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          id="certificate"
          title="Warranty Certificate & QR Verification"
          subtitle="Download or share proof of coverage"
        >
          {data?.devices.find((d) => d.warranty) ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-soft p-6 text-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Scannable QR code to verify this warranty" width={120} height={120} className="rounded-xl" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                  <QrCode size={24} />
                </span>
              )}
              <div>
                <p className="text-[13px] font-semibold">
                  {(() => {
                    const d = data.devices.find((d) => d.warranty)!;
                    return `${d.brand} ${d.model} — ${d.warranty?.tierLabel}`;
                  })()}
                </p>
                <p className="mt-1 text-[12px] text-secondary">
                  Scan to verify this warranty is genuine and active.
                </p>
              </div>
              <button
                onClick={() => {
                  const d = data.devices.find((d) => d.warranty)!;
                  handleDownloadCertificate(d.warranty!.id);
                }}
                className="rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white dark:bg-cyan-400 dark:text-navy-900"
              >
                Download Certificate (PDF)
              </button>
            </div>
          ) : (
            <p className="text-[12.5px] text-secondary">
              Register a device with an active warranty to generate a certificate.
            </p>
          )}
        </SectionCard>
      </div>

      <SectionCard
        id="claims"
        title="Claim Submission & Tracking"
        subtitle="Submit a new claim or follow an existing one"
        action={
          <button
            onClick={() => setShowClaimForm((v) => !v)}
            className="rounded-full bg-navy-900 px-4 py-2 text-[12.5px] font-semibold text-white dark:bg-cyan-400 dark:text-navy-900"
          >
            + New Claim
          </button>
        }
      >
        {showClaimForm && (
          <div className="mb-5 rounded-xl border border-soft p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <select
                value={claimDeviceId}
                onChange={(e) => setClaimDeviceId(e.target.value)}
                className="rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              >
                <option value="">Select device</option>
                {data?.devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.brand} {d.model}
                  </option>
                ))}
              </select>
              <input
                value={claimIssue}
                onChange={(e) => setClaimIssue(e.target.value)}
                placeholder="Describe the issue (e.g. cracked screen)"
                className="rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSubmitClaim}
                disabled={submitting || !claimDeviceId || !claimIssue}
                className="rounded-full bg-navy-900 px-5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                Damage photos (optional)
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-soft p-4 hover:border-cyan-400">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
                  <Camera size={16} />
                </span>
                <div>
                  <p className="text-[12.5px] font-medium">
                    Click to upload photos
                  </p>
                  <p className="text-[11.5px] text-secondary">
                    Up to 4 images, 3MB each — helps us assess your claim faster
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleClaimPhotoSelect(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {claimPhotoError && (
                <p className="mt-2 text-[11.5px] text-red-500">
                  {claimPhotoError}
                </p>
              )}

              {claimPhotos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {claimPhotos.map((src, i) => (
                    <div
                      key={i}
                      className="group relative h-20 w-20 overflow-hidden rounded-xl border border-soft"
                    >
                      <img
                        src={src}
                        alt={`Damage photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeClaimPhoto(i)}
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
          </div>
        )}

        {loading ? (
          <p className="text-[12.5px] text-secondary">Loading claims...</p>
        ) : !data?.claims.length ? (
          <p className="text-[12.5px] text-secondary">No claims filed yet.</p>
        ) : (
          <div className="space-y-4">
            {data.claims.map((c) => {
              const stepIndex = CLAIM_STEPS.indexOf(c.status);
              const progress = stepIndex === -1 ? 4 : stepIndex + 1;
              return (
                <div key={c.id} className="rounded-xl border border-soft p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold">
                      {c.device.brand} {c.device.model} — <span className="text-secondary">{c.issue}</span>
                    </p>
                    <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-500">
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {CLAIM_STEPS.map((step, i) => (
                      <span
                        key={step}
                        className={`h-1.5 w-full rounded-full ${
                          i < progress ? "bg-cyan-400" : "bg-navy-900/10 dark:bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-secondary">
                    Submitted → Approved → Repair in progress → Ready for pickup
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          id="assistant"
          title="AI Chat Assistant"
          subtitle="Ask about coverage, claims or repair status"
        >
          <div className="flex h-56 flex-col gap-2 overflow-y-auto rounded-xl border border-soft bg-navy-900/[0.02] p-3 dark:bg-white/[0.02]">
            {chatMessages.length === 0 && (
              <div className="glass max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12.5px]">
                Ask me about your warranties, claims, or upcoming payments.
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-navy-900 px-3.5 py-2 text-[12.5px] text-white dark:bg-cyan-400 dark:text-navy-900"
                    : "glass max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12.5px]"
                }
              >
                {m.content}
              </div>
            ))}
            {chatLoading && (
              <div className="glass max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12.5px] text-secondary">
                Typing...
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-full border border-soft px-3.5 py-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Ask the AI assistant..."
              className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-secondary/60"
            />
            <button onClick={handleSendMessage} disabled={chatLoading} aria-label="Send message">
              <Send size={15} className="text-cyan-500" />
            </button>
          </div>
          {chatError && <p className="mt-2 text-[11px] text-red-500">{chatError}</p>}
        </SectionCard>

        <SectionCard id="notifications" title="Notifications" subtitle="Recent activity on your account">
          {loading ? (
            <p className="text-[12.5px] text-secondary">Loading...</p>
          ) : !data?.notifications.length ? (
            <p className="text-[12.5px] text-secondary">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-2.5 text-[12.5px]">
                  <Bell size={13} className="mt-0.5 shrink-0 text-cyan-500" />
                  <span className="text-secondary">{n.title}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

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
            <input defaultValue={session?.user?.email ?? ""} disabled className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13px] text-secondary outline-none" />
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