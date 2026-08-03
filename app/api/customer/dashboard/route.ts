import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [devices, payments, claims, notifications] = await Promise.all([
    prisma.device.findMany({
      where: { customerId: userId },
      include: { warranty: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId },
      include: { warranty: { include: { device: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.claim.findMany({
      where: { customerId: userId },
      include: { device: true },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const activeWarranties = devices.filter(
    (d) => d.warranty?.status === "ACTIVE"
  ).length;
  const claimsInProgress = claims.filter(
    (c) => !["COMPLETED", "REJECTED"].includes(c.status)
  ).length;
  const nextEmi = payments.find(
    (p) => p.method === "EMI" && p.status === "PENDING"
  );

  return NextResponse.json({
    stats: {
      deviceCount: devices.length,
      activeWarranties,
      claimsInProgress,
      nextEmiAmount: nextEmi?.amount ?? null,
    },
    devices,
    payments,
    claims,
    notifications,
  });
}
