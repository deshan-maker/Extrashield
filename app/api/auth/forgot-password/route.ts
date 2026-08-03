import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Two limits: per-email (stop someone spamming one inbox with reset
  // links) and per-IP (stop a script cycling through many emails).
  const emailLimit = checkRateLimit(`forgot-pw:email:${email}`, 3, 15 * 60 * 1000);
  const ipLimit = checkRateLimit(`forgot-pw:ip:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!emailLimit.allowed || !ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many reset requests. Please try again later." },
      { status: 429 }
    );
  }

  // Always return the same generic response, whether or not the email
  // exists — this avoids leaking which emails are registered.
  const genericResponse = NextResponse.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.suspended) {
    return genericResponse;
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);

  return genericResponse;
}