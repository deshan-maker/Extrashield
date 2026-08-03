import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shops = await prisma.shop.findMany({
    select: { id: true, name: true, location: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ shops });
}