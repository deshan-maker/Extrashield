import { NextResponse } from "next/server";
import { z } from "zod";
import { sendClaimStatusEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const claim = await prisma.claim.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      device: { select: { brand: true, model: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: claim.customer.id,
      channel: "PUSH",
      title: parsed.data.status === "APPROVED" ? "Claim approved" : "Claim update",
      body: `Your claim for ${claim.device.brand} ${claim.device.model} was ${
        parsed.data.status === "APPROVED" ? "approved" : "not approved"
      }.`,
    },
  });

  // Awaited (not fire-and-forget) — see note in agent/devices/route.ts.
  await sendClaimStatusEmail(claim.customer.email, {
    customerName: claim.customer.name,
    device: `${claim.device.brand} ${claim.device.model}`,
    status: parsed.data.status,
    issue: claim.issue,
  });

  return NextResponse.json({ claim });
}