import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const warranty = await prisma.warranty.findUnique({
    where: { id: params.id },
    include: { device: { select: { brand: true, model: true, imei: true } } },
  });

  if (!warranty) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  const isExpired = warranty.expiresAt < new Date();

  return NextResponse.json({
    valid: true,
    status: isExpired ? "EXPIRED" : warranty.status,
    tierLabel: warranty.tierLabel,
    activatedAt: warranty.activatedAt,
    expiresAt: warranty.expiresAt,
    device: {
      brand: warranty.device.brand,
      model: warranty.device.model,
      imeiMasked: `••••••${warranty.device.imei.slice(-4)}`,
    },
  });
}
