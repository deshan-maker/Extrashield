import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const logSchema = z.object({
  customerId: z.string(),
  outcome: z.enum(["ANSWERED", "NO_ANSWER", "FOLLOW_UP_NEEDED", "RENEWED", "NOT_INTERESTED"]),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "CALL_CENTER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = logSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const log = await prisma.callLog.create({
    data: {
      customerId: parsed.data.customerId,
      calledById: session.user.id,
      outcome: parsed.data.outcome,
      note: parsed.data.note,
    },
  });

  return NextResponse.json(log, { status: 201 });
}
