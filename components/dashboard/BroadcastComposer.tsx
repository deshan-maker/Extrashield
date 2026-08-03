"use client";

import { LucideIcon } from "lucide-react";
import { useState } from "react";

const audiences = [
  { value: "ALL", label: "Everyone" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "AGENT", label: "Agents" },
  { value: "CALL_CENTER", label: "Call center staff" },
  { value: "SINGLE", label: "One specific person (by email)" },
];

export default function BroadcastComposer({
  icon: Icon,
  endpoint,
  titleFieldName,
  titleLabel,
  titlePlaceholder,
  messagePlaceholder,
}: {
  icon: LucideIcon;
  endpoint: string;
  /** The JSON body key the title/subject is sent under ("title" or "subject"). */
  titleFieldName: "title" | "subject";
  titleLabel: string;
  titlePlaceholder: string;
  messagePlaceholder: string;
}) {
  const [audience, setAudience] = useState("ALL");
  const [singleEmail, setSingleEmail] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    setResult(null);

    if (!titleValue.trim() || !message.trim()) {
      setError("Fill in both fields.");
      return;
    }
    if (audience === "SINGLE" && !singleEmail.trim()) {
      setError("Enter a recipient email.");
      return;
    }

    setSending(true);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience,
        singleEmail: audience === "SINGLE" ? singleEmail.trim() : undefined,
        [titleFieldName]: titleValue,
        message,
      }),
    });
    setSending(false);

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "Something went wrong. Please try again.");
      return;
    }

    setResult(`Sent to ${data.sentTo} recipient${data.sentTo === 1 ? "" : "s"}.`);
    setTitleValue("");
    setMessage("");
  }

  return (
    <div className="rounded-xl border border-soft p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className="text-cyan-500" />
        <p className="text-[12.5px] font-semibold">{titleLabel}</p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 text-[11.5px] text-red-500">
          {error}
        </p>
      )}
      {result && (
        <p className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[11.5px] text-emerald-500">
          {result}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-secondary">
            Audience
          </label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-lg border border-soft bg-elevated px-3 py-2 text-[12.5px] outline-none focus:border-cyan-400"
          >
            {audiences.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {audience === "SINGLE" && (
          <input
            value={singleEmail}
            onChange={(e) => setSingleEmail(e.target.value)}
            placeholder="person@example.com"
            className="w-full rounded-lg border border-soft bg-elevated px-3 py-2 text-[12.5px] outline-none focus:border-cyan-400"
          />
        )}

        <input
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full rounded-lg border border-soft bg-elevated px-3 py-2 text-[12.5px] outline-none focus:border-cyan-400"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={messagePlaceholder}
          rows={3}
          className="w-full resize-none rounded-lg border border-soft bg-elevated px-3 py-2 text-[12.5px] outline-none focus:border-cyan-400"
        />

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full rounded-lg bg-navy-900 py-2 text-[12px] font-semibold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-navy-900"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}