"use client";

import { motion } from "framer-motion";
import { AlertCircle, Loader2, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";

type ImeiResult =
  | { valid: true; found: true; hasWarranty: false; device: { brand: string; model: string } }
  | {
      valid: true;
      found: true;
      hasWarranty: true;
      status: string;
      tierLabel: string;
      price: number;
      activatedAt: string;
      expiresAt: string;
      device: { brand: string; model: string };
      claims: { issue: string; status: string; submittedAt: string }[];
    }
  | { valid: false; found?: false };

const claimStatusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REPAIR_IN_PROGRESS: "Repair in progress",
  READY_FOR_PICKUP: "Ready for pickup",
  COMPLETED: "Completed",
};

const warrantyStatusLabels: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-LK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ImeiChecker() {
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImeiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    if (imei.length !== 15) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/imei-check?imei=${imei}`);
      const data = await res.json();

      if (res.status === 404) {
        setResult({ valid: false, found: false });
      } else if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="imei-checker" className="border-y border-soft py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500">
          Warranty / IMEI Checker
        </p>
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Look up any device's warranty status
        </h2>
        <p className="mt-4 text-[14.5px] text-secondary">
          Enter a 15-digit IMEI to see activation date, expiry and claim
          history.
        </p>

        <div className="mx-auto mt-8 flex max-w-lg items-center gap-2 rounded-full border border-soft bg-elevated p-1.5 shadow-soft">
          <Search size={16} className="ml-3 shrink-0 text-secondary" />
          <input
            value={imei}
            onChange={(e) => {
              setImei(e.target.value.replace(/[^\d]/g, "").slice(0, 15));
              setResult(null);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="e.g. 356938035643809"
            inputMode="numeric"
            className="w-full bg-transparent px-1 py-2 font-mono text-[13.5px] outline-none"
          />
          <button
            onClick={handleCheck}
            disabled={imei.length !== 15 || loading}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {loading ? "Checking..." : "Check"}
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-6 flex max-w-lg items-center gap-2 rounded-2xl border border-soft bg-elevated p-4 text-left text-[13px] text-secondary"
          >
            <AlertCircle size={16} className="shrink-0 text-secondary" />
            {error}
          </motion.div>
        )}

        {result && !result.valid && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mx-auto mt-6 max-w-lg rounded-2xl p-6 text-left shadow-soft"
          >
            <div className="flex items-center gap-2 text-secondary">
              <ShieldOff size={16} />
              <span className="text-[12.5px] font-semibold">
                No record found
              </span>
            </div>
            <p className="mt-2 text-[13px] text-secondary">
              This IMEI isn't registered with Extra Shield. If you believe
              this is a mistake, please contact your device dealer or our
              support team.
            </p>
          </motion.div>
        )}

        {result?.valid && result.found && !result.hasWarranty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mx-auto mt-6 max-w-lg rounded-2xl p-6 text-left shadow-soft"
          >
            <div className="flex items-center gap-2 text-secondary">
              <ShieldOff size={16} />
              <span className="text-[12.5px] font-semibold">
                Device found — no active warranty
              </span>
            </div>
            <p className="mt-2 text-[13px] text-secondary">
              {result.device.brand} {result.device.model} is registered but
              doesn't have a warranty package attached yet.
            </p>
          </motion.div>
        )}

        {result?.valid && result.found && result.hasWarranty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mx-auto mt-6 max-w-lg rounded-2xl p-6 text-left shadow-soft"
          >
            <div className="flex items-center gap-2 text-cyan-500">
              <ShieldCheck size={16} />
              <span className="text-[12.5px] font-semibold">
                Warranty {warrantyStatusLabels[result.status] ?? result.status}
              </span>
            </div>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between">
                <dt className="text-secondary">Device</dt>
                <dd className="font-medium">
                  {result.device.brand} {result.device.model}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-secondary">Activation date</dt>
                <dd className="font-medium">{formatDate(result.activatedAt)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-secondary">Expiry date</dt>
                <dd className="font-medium">{formatDate(result.expiresAt)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-secondary">Package</dt>
                <dd className="font-medium">
                  {result.tierLabel} — Rs. {result.price.toLocaleString()}/yr
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-secondary">Claim history</dt>
                <dd className="text-right font-medium">
                  {result.claims.length === 0
                    ? "No claims filed"
                    : result.claims
                        .map(
                          (c) =>
                            `${c.issue} (${claimStatusLabels[c.status] ?? c.status})`
                        )
                        .join(", ")}
                </dd>
              </div>
            </dl>
          </motion.div>
        )}
      </div>
    </section>
  );
}