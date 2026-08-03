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
  const suspended = body?.suspended;
  const shopId = body?.shopId;

  if (typeof suspended !== "boolean" && shopId === undefined) {
    return NextResponse.json(
      { error: "suspended (boolean) or shopId is required" },
      { status: 400 }
    );
  }

  if (typeof suspended === "boolean" && params.id === session.user.id) {
    return NextResponse.json({ error: "You can't suspend your own account." }, { status: 400 });
  }

  const data: { suspended?: boolean; shopId?: string | null } = {};
  if (typeof suspended === "boolean") data.suspended = suspended;
  if (shopId !== undefined) data.shopId = shopId === null ? null : String(shopId);

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, suspended: true, role: true, shopId: true },
  });

  return NextResponse.json(updated);
}