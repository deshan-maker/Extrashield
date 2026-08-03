import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendEmail } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rateLimit";

const broadcastSchema = z.object({
  audience: z.enum(["ALL", "CUSTOMER", "AGENT", "CALL_CENTER", "SINGLE"]),
  singleEmail: z.string().email().optional(),
  subject: z.string().min(2, "Enter a subject"),
  message: z.string().min(5, "Enter a message"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Broadcasts touch every matching user's inbox — a mistaken double-click
  // shouldn't spam them twice, so this is intentionally strict.
  const limit = checkRateLimit(`email-broadcast:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many broadcasts sent recently. Please wait before sending another." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { audience, singleEmail, subject, message } = parsed.data;

  let recipients: { email: string }[];

  if (audience === "SINGLE") {
    if (!singleEmail) {
      return NextResponse.json(
        { error: "Enter a recipient email" },
        { status: 400 }
      );
    }
    recipients = [{ email: singleEmail.toLowerCase() }];
  } else {
    recipients = await prisma.user.findMany({
      where: audience === "ALL" ? {} : { role: audience },
      select: { email: true },
    });
  }

  const html = `
    <div style="font-family:sans-serif;font-size:14px;color:#1a2332;line-height:1.6;">
      ${message
        .split("\n")
        .map((line) => `<p style="margin:0 0 12px;">${line}</p>`)
        .join("")}
      <p style="margin-top:24px;color:#8a94a6;font-size:12px;">— Extra Shield</p>
    </div>
  `;

  // Fire-and-forget in parallel — sendEmail() already swallows its own
  // errors (logs them) so one bad address can't stop the rest of the batch.
  await Promise.all(recipients.map((r) => sendEmail(r.email, subject, html)));

  return NextResponse.json({ ok: true, sentTo: recipients.length });
}