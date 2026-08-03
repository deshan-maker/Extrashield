import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Public IMEI checker used on the homepage. Given a 15-digit IMEI, looks up
 * the real device + warranty + claim history in the database. No auth
 * required — this mirrors what a printed warranty card / QR code would
 * reveal, so nothing sensitive (customer name, phone, email) is returned.
 */
export async function GET(request: Request) {
  // Max 20 lookups per IP per 10 minutes — enough for a genuine customer
  // trying a few IMEIs, not enough to scrape the device table.
  const limit = checkRateLimit(`imei-check:${getClientIp(request)}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { valid: false, error: "Too many lookups. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const imei = searchParams.get("imei")?.trim() ?? "";

  if (!/^\d{15}$/.test(imei)) {
    return NextResponse.json(
      { valid: false, error: "Enter a valid 15-digit IMEI." },
      { status: 400 }
    );
  }

  const device = await prisma.device.findUnique({
    where: { imei },
    include: {
      warranty: true,
      claims: {
        orderBy: { submittedAt: "desc" },
        take: 5,
        select: { issue: true, status: true, submittedAt: true },
      },
    },
  });

  if (!device) {
    return NextResponse.json({ valid: false, found: false }, { status: 404 });
  }

  if (!device.warranty) {
    return NextResponse.json({
      valid: true,
      found: true,
      hasWarranty: false,
      device: { brand: device.brand, model: device.model },
    });
  }

  const isExpired = device.warranty.expiresAt < new Date();

  return NextResponse.json({
    valid: true,
    found: true,
    hasWarranty: true,
    status: isExpired ? "EXPIRED" : device.warranty.status,
    tierLabel: device.warranty.tierLabel,
    price: device.warranty.price,
    activatedAt: device.warranty.activatedAt,
    expiresAt: device.warranty.expiresAt,
    device: { brand: device.brand, model: device.model },
    claims: device.claims.map((c) => ({
      issue: c.issue,
      status: c.status,
      submittedAt: c.submittedAt,
    })),
  });
}