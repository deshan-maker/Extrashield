import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "CALL_CENTER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { devices: { some: { salesmanName: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: {
      devices: {
        include: { warranty: true, shop: { select: { name: true } } },
      },
      callLogsReceived: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { calledBy: { select: { name: true } } },
      },
    },
    take: 100,
  });

  const now = new Date();

  const rows = customers.map((c) => {
    // Find the warranty expiring soonest across all of this customer's devices.
    const warranties = c.devices
      .filter((d) => d.warranty)
      .map((d) => ({
        device: `${d.brand} ${d.model}`,
        expiresAt: d.warranty!.expiresAt,
        status: d.warranty!.status,
        tierLabel: d.warranty!.tierLabel,
        price: d.warranty!.price,
        salesmanName: d.salesmanName,
        packagePrice: d.packagePrice,
        firstPaymentAmount: d.firstPaymentAmount,
        shopName: d.shop?.name ?? null,
      }))
      .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());

    const nearest = warranties[0] ?? null;
    const daysRemaining = nearest
      ? Math.ceil((nearest.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      deviceCount: c.devices.length,
      nearestWarranty: nearest
        ? {
            device: nearest.device,
            tierLabel: nearest.tierLabel,
            status: nearest.status,
            daysRemaining,
            price: nearest.price,
            salesmanName: nearest.salesmanName,
            packagePrice: nearest.packagePrice,
            firstPaymentAmount: nearest.firstPaymentAmount,
            shopName: nearest.shopName,
          }
        : null,
      lastCall: c.callLogsReceived[0]
        ? {
            outcome: c.callLogsReceived[0].outcome,
            by: c.callLogsReceived[0].calledBy.name,
            at: c.callLogsReceived[0].createdAt,
          }
        : null,
    };
  });

  // Prioritize: expiring soonest (including already-expired) first, no-warranty customers last.
  rows.sort((a, b) => {
    if (a.nearestWarranty === null) return 1;
    if (b.nearestWarranty === null) return -1;
    return a.nearestWarranty.daysRemaining! - b.nearestWarranty.daysRemaining!;
  });

  return NextResponse.json({ customers: rows });
}