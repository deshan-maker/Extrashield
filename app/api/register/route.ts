import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(9, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CUSTOMER", "AGENT"]),
  shopName: z.string().optional(),
  shopLocation: z.string().optional(),
});

export async function POST(request: Request) {
  // Max 8 registrations per IP per hour — blocks scripted mass account
  // creation without affecting a real family/shop signing up a few people.
  const ip = getClientIp(request);
  const limit = checkRateLimit(`register:${ip}`, 8, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, phone, password, role, shopName, shopLocation } =
    parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);

  let shopId: string | undefined;
  if (role === "AGENT" && shopName) {
    const shop = await prisma.shop.create({
      data: {
        name: shopName,
        location: shopLocation ?? "Not specified",
      },
    });
    shopId = shop.id;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      shopId,
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email, role: user.role },
    { status: 201 }
  );
}