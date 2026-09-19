/**
 * Minimal mail helper, shared by every feature that emails a customer
 * (password reset, device registration confirmation, claim updates).
 *
 * If SMTP_HOST / SMTP_USER / SMTP_PASS are set in .env, this sends a real
 * email via nodemailer. If they're not set (e.g. local development, or
 * before email is set up for this project), it logs the email to the
 * server console instead, so every flow still works end-to-end for testing.
 *
 * To enable real email sending:
 *   1. npm install nodemailer
 *   2. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM to .env
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // eslint-disable-next-line no-console
    console.log(`[email] SMTP not configured — email for ${to} ("${subject}") was not sent.`);
    return;
  }

  // Loaded dynamically so the app still builds if nodemailer isn't installed.
  // @ts-ignore — nodemailer is an optional dependency; install it to enable real email sending.
  const nodemailer = await import("nodemailer").catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[email] Failed to load nodemailer:", err);
    return null;
  });
  if (!nodemailer) {
    // eslint-disable-next-line no-console
    console.log(`[email] nodemailer not installed — email for ${to} ("${subject}") was not sent.`);
    return;
  }

  try {
    const transport = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transport.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (err) {
    // Email failures should never break the request that triggered them
    // (e.g. a device registration shouldn't fail just because the email bounced).
    // eslint-disable-next-line no-console
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your Extra Shield password",
    `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `
  );
}

export async function sendDeviceRegisteredEmail(
  to: string,
  details: { customerName: string; brand: string; model: string; tierLabel: string }
) {
  await sendEmail(
    to,
    "Your warranty is now active — Extra Shield",
    `
      <p>Hi ${details.customerName},</p>
      <p>Your <strong>${details.brand} ${details.model}</strong> is now covered under the
      <strong>${details.tierLabel}</strong> plan.</p>
      <p>You can view your warranty, package payments, and claims anytime by logging in to your
      Extra Shield account.</p>
    `
  );
}

export async function sendClaimStatusEmail(
  to: string,
  details: { customerName: string; device: string; status: "APPROVED" | "REJECTED"; issue: string }
) {
  const statusText = details.status === "APPROVED" ? "approved" : "not approved";
  await sendEmail(
    to,
    `Your claim has been ${statusText} — Extra Shield`,
    `
      <p>Hi ${details.customerName},</p>
      <p>Your claim for <strong>${details.device}</strong> ("${details.issue}") has been
      <strong>${statusText}</strong>.</p>
      <p>Log in to your Extra Shield account for full details${
        details.status === "APPROVED" ? " and next steps." : "."
      }</p>
    `
  );
}