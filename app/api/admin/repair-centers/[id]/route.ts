import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const repairCenter = await prisma.repairCenter.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ repairCenter });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json(
        { error: "This repair center no longer exists — it may have already been deleted." },
        { status: 404 }
      );
    }
    throw err;
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.repairCenter.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      // Already deleted (e.g. a double-click, or stale UI state) — treat
      // this as success rather than crashing, since the end state (the
      // record doesn't exist) is exactly what was requested.
      return NextResponse.json({ ok: true, alreadyDeleted: true });
    }
    throw err;
  }
}