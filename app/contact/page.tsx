"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { FormEvent, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WhatsAppCallBanner from "@/components/WhatsAppCallBanner";

const infoCards = [
  {
    icon: Phone,
    title: "Call us",
    lines: ["+94 78 428 2224", "Mon–Sat, 8:30am–6pm"],
  },
  {
    icon: Mail,
    title: "Email us",
    lines: ["dwpextrashield@gmail.com", "Replies within 24 hours"],
  },
  {
    icon: MapPin,
    title: "Visit us",
    lines: ["No. 42, Temple Road", "Kiribathgoda, Sri Lanka"],
  },
  {
    icon: Clock,
    title: "Claims hotline",
    lines: ["24/7 AI assistant", "Human support 8am–10pm"],
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden pb-16 pt-40 sm:pt-48">
        <div className="grid-fade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-3xl px-4 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[12.5px] font-semibold uppercase tracking-[0.15em] text-cyan-500"
          >
            Contact Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            We're here to help
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-secondary"
          >
            Questions about a plan, a claim, or becoming a partner shop reach out and a real person will get back to you.
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {infoCards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-soft bg-elevated p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-cyan-400 dark:bg-cyan-400 dark:text-navy-900">
                <c.icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-[14.5px] font-bold">{c.title}</h3>
              {c.lines.map((line) => (
                <p key={line} className="mt-1 text-[12.5px] text-secondary">
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <WhatsAppCallBanner />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass overflow-hidden rounded-3xl shadow-soft-lg">
              <img
                src="https://images.unsplash.com/photo-1560264280-88b68371db39?q=80&w=1200&auto=format&fit=crop"
                alt="Customer support team assisting a client"
                className="h-80 w-full object-cover sm:h-[420px]"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass absolute -bottom-6 -right-6 hidden items-center gap-2 rounded-2xl px-4 py-3 shadow-soft sm:flex"
            >
              <MessageCircle size={15} className="text-cyan-500" />
              <span className="text-[12px] font-semibold">Avg. reply: 24hrs</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-7 shadow-soft-lg sm:p-9"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CheckCircle2 size={26} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Message sent</h3>
                <p className="mt-2 max-w-xs text-[13px] text-secondary">
                  Thanks, {name.split(" ")[0] || "there"} — we'll get back to
                  you at {email || "your email"} soon.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setSubject("");
                    setMessage("");
                  }}
                  className="mt-6 text-[12.5px] font-semibold text-cyan-500"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                      Full name
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                    Subject
                  </label>
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                    className="w-full rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-secondary">
                    Message
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Tell us more..."
                    className="w-full resize-none rounded-xl border border-soft bg-elevated px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-400"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-navy-900 px-5 py-3 text-[13.5px] font-semibold text-white shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60 dark:bg-cyan-400 dark:text-navy-900"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </motion.button>

                {error && (
                  <p className="text-center text-[12px] font-medium text-red-500">{error}</p>
                )}
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}