import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(5, "Message is too short").max(5000, "Message is too long"),
});

export async function POST(request: Request) {
  // Max 5 submissions per IP per hour — stops the form being used to spam
  // the admin inbox / flood the ContactMessage table.
  const limit = checkRateLimit(`contact:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;

  try {
    await prisma.contactMessage.create({ data: parsed.data });
  } catch (err) {
    console.error("Contact form: database write failed:", err);
    return NextResponse.json(
      { error: "Couldn't send your message right now. Please try again shortly." },
      { status: 500 }
    );
  }

  // Alert the admin inbox that a new message came in. ADMIN_NOTIFICATION_EMAIL
  // lets you point this at a specific inbox; otherwise it falls back to the
  // same address SMTP sends from (SMTP_FROM / SMTP_USER).
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  if (adminEmail) {
    // Awaited (not fire-and-forget) — some hosting environments tear down
    // the request right after the response is sent, which can cut off an
    // un-awaited email before it finishes. sendEmail catches its own
    // errors, so this can't fail the contact form submission.
    // "from" stays the business's own address (required by SMTP providers —
    // sending "from" an address you don't control gets blocked/spam-filtered).
    // "replyTo" is the customer's email, so hitting Reply in the inbox goes
    // straight back to them.
    await sendEmail(
      adminEmail,
      `New contact message: ${subject}`,
      `
        <p>New message from the Contact page:</p>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong><br />${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
      email
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}