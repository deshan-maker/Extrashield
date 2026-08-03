import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sixMonthsAgo = new Date(startOfMonth);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const [
    customerCount,
    agentCount,
    paidThisMonth,
    pendingClaims,
    pendingPaymentsAgg,
    pendingCommissionAgg,
    recentCustomers,
    recentAgents,
    recentShops,
    claimsQueue,
    paymentsForChart,
    contactMessages,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "AGENT" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
    }),
    prisma.claim.count({
      where: { status: { in: ["SUBMITTED", "APPROVED", "REPAIR_IN_PROGRESS"] } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { devices: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      where: { role: "AGENT" },
      include: { shop: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.shop.findMany({
      include: { _count: { select: { devices: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.claim.findMany({
      where: { status: "SUBMITTED" },
      include: { device: true, customer: true },
      orderBy: { submittedAt: "desc" },
      take: 10,
    }),
    prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Bucket paid revenue into the last 6 calendar months for the chart.
  const revenueByMonth = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const label = MONTH_LABELS[d.getMonth()];
    const total = paymentsForChart
      .filter(
        (p) =>
          p.paidAt &&
          p.paidAt.getMonth() === d.getMonth() &&
          p.paidAt.getFullYear() === d.getFullYear()
      )
      .reduce((sum, p) => sum + p.amount, 0);
    return { month: label, revenue: Math.round((total / 1_000_000) * 100) / 100 };
  });

  return NextResponse.json({
    stats: {
      customerCount,
      agentCount,
      revenueThisMonth: paidThisMonth._sum.amount ?? 0,
      pendingClaims,
      pendingPayments: pendingPaymentsAgg._sum.amount ?? 0,
      pendingCommission: pendingCommissionAgg._sum.amount ?? 0,
    },
    revenueByMonth,
    management: {
      customers: recentCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        meta: `${c.devices.length} device${c.devices.length === 1 ? "" : "s"}`,
        suspended: c.suspended,
      })),
      agents: recentAgents.map((a) => ({
        id: a.id,
        name: a.name,
        meta: a.shop?.name ?? "No shop assigned",
        suspended: a.suspended,
      })),
      shops: recentShops.map((s) => ({
        id: s.id,
        name: s.name,
        meta: `${s.location} · ${s._count.devices} registrations`,
        verified: s.verified,
      })),
    },
    claimsQueue,
    contactMessages,
  });
}
