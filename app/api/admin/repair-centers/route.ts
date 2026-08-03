import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const repairCenters = await prisma.repairCenter.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ repairCenters });
}

const createSchema = z.object({
  name: z.string().min(2, "Enter a center name"),
  location: z.string().min(2, "Enter a location"),
  phone: z.string().min(7, "Enter a valid phone number"),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const repairCenter = await prisma.repairCenter.create({
    data: parsed.data,
  });

  return NextResponse.json({ repairCenter }, { status: 201 });
}