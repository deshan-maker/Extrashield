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
  const imeiVerified = body?.imeiVerified;

  if (typeof imeiVerified !== "boolean") {
    return NextResponse.json({ error: "imeiVerified (boolean) is required" }, { status: 400 });
  }

  const updated = await prisma.device.update({
    where: { id: params.id },
    data: { imeiVerified },
    select: { id: true, imei: true, imeiVerified: true },
  });

  return NextResponse.json(updated);
}
