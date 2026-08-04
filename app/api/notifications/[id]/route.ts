import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

const sendSchema = z.object({
  audience: z.enum(["ALL_CUSTOMERS", "ALL_AGENTS", "SPECIFIC"]),
  recipientEmail: z.string().email().optional(),
  subject: z.string().min(2, "Enter a subject"),
  message: z.string().min(5, "Enter a message"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`admin-notification:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many broadcasts sent recently. Please wait before sending another." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { audience, recipientEmail, subject, message } = parsed.data;

  let recipients: { id: string; email: string }[];

  if (audience === "SPECIFIC") {
    if (!recipientEmail) {
      return NextResponse.json({ error: "Enter a recipient email" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email: recipientEmail.toLowerCase() },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
    }
    recipients = [user];
  } else {
    recipients = await prisma.user.findMany({
      where: { role: audience === "ALL_CUSTOMERS" ? "CUSTOMER" : "AGENT" },
      select: { id: true, email: true },
    });
  }

  // Both an in-app notification and a real email, so the recipient sees it
  // whichever way they check first.
  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId: r.id,
      channel: "PUSH" as const,
      title: subject,
      body: message,
    })),
  });

  const html = `
    <div style="font-family:sans-serif;font-size:14px;color:#1a2332;line-height:1.6;">
      ${message
        .split("\n")
        .map((line) => `<p style="margin:0 0 12px;">${line}</p>`)
        .join("")}
      <p style="margin-top:24px;color:#8a94a6;font-size:12px;">— Extra Shield</p>
    </div>
  `;

  // sendEmail() swallows its own errors (logs them), so one bad address
  // can't stop the rest of the batch.
  await Promise.all(recipients.map((r) => sendEmail(r.email, subject, html)));

  return NextResponse.json({
    ok: true,
    recipientCount: recipients.length,
    emailsSent: recipients.length,
  });
}