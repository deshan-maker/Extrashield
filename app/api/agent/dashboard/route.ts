import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = session.user.id;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [devicesThisMonth, recentDevices, commissions, claims, recentWeekDevices, notifications] =
    await Promise.all([
      prisma.device.count({
        where: { registeredById: agentId, createdAt: { gte: startOfMonth } },
      }),
      prisma.device.findMany({
        where: { registeredById: agentId },
        include: { customer: true, warranty: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.commission.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.claim.findMany({
        where: { device: { registeredById: agentId } },
        include: { device: true, customer: true },
        orderBy: { submittedAt: "desc" },
        take: 10,
      }),
      prisma.device.findMany({
        where: { registeredById: agentId, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.notification.findMany({
        where: { userId: agentId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const commissionThisMonth = commissions
    .filter((c) => c.createdAt >= startOfMonth)
    .reduce((sum, c) => sum + c.amount, 0);

  const openClaims = claims.filter(
    (c) => !["COMPLETED", "REJECTED"].includes(c.status)
  ).length;

  // Bucket last 7 days of registrations by weekday for the sales chart.
  const salesByDay = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const label = DAY_LABELS[d.getDay()];
    const count = recentWeekDevices.filter(
      (dev) => dev.createdAt.toDateString() === d.toDateString()
    ).length;
    return { day: label, sales: count };
  });

  return NextResponse.json({
    stats: {
      devicesThisMonth,
      commissionThisMonth,
      openClaims,
    },
    recentDevices,
    commissions,
    claims,
    salesByDay,
    notifications,
  });
}
