import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const verified = body?.verified;

  if (typeof verified !== "boolean") {
    return NextResponse.json({ error: "verified (boolean) is required" }, { status: 400 });
  }

  const updated = await prisma.shop.update({
    where: { id: params.id },
    data: { verified },
    select: { id: true, name: true, verified: true },
  });

  return NextResponse.json(updated);
}
