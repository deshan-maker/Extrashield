import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const devices = await prisma.device.findMany({
    where: q
      ? {
          OR: [
            { imei: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
            { customer: { name: { contains: q, mode: "insensitive" } } },
            { salesmanName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      customer: { select: { name: true, email: true, phone: true } },
      registeredBy: { select: { name: true } },
      shop: { select: { name: true } },
      warranty: { select: { tierLabel: true, status: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    devices: devices.map((d) => ({
      id: d.id,
      imei: d.imei,
      brand: d.brand,
      model: d.model,
      condition: d.condition,
      imeiVerified: d.imeiVerified,
      createdAt: d.createdAt,
      customer: d.customer,
      registeredByName: d.registeredBy?.name ?? "—",
      shopName: d.shop?.name ?? null,
      salesmanName: d.salesmanName,
      packagePrice: d.packagePrice,
      firstPaymentAmount: d.firstPaymentAmount,
      warranty: d.warranty,
    })),
  });
}