import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    include: {
      shop: { select: { id: true, name: true } },
      _count: { select: { registeredBy: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      suspended: a.suspended,
      deviceCount: a._count.registeredBy,
      shopId: a.shopId,
      shopName: a.shop?.name ?? null,
    })),
  });
}