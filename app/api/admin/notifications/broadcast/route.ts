import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { checkRateLimit } from "@/lib/rateLimit";

const broadcastSchema = z.object({
  audience: z.enum(["ALL", "CUSTOMER", "AGENT", "CALL_CENTER", "SINGLE"]),
  singleEmail: z.string().email().optional(),
  title: z.string().min(2, "Enter a title"),
  message: z.string().min(3, "Enter a message"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`notification-broadcast:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many broadcasts sent recently. Please wait before sending another." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = broadcastSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { audience, singleEmail, title, message } = parsed.data;

  let userIds: string[];

  if (audience === "SINGLE") {
    if (!singleEmail) {
      return NextResponse.json(
        { error: "Enter a recipient email" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email: singleEmail.toLowerCase() },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with that email" },
        { status: 404 }
      );
    }
    userIds = [user.id];
  } else {
    const users = await prisma.user.findMany({
      where: audience === "ALL" ? {} : { role: audience },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  }

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      channel: "PUSH" as const,
      title,
      body: message,
    })),
  });

  return NextResponse.json({ ok: true, sentTo: userIds.length });
}