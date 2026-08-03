import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateCommission } from "@/lib/calculateCommission";
import { calculatePackage } from "@/lib/calculatePackage";
import { uploadImagesToCloudinary, uploadVideosToCloudinary } from "@/lib/cloudinary";
import { sendDeviceRegisteredEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const registerDeviceSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(9),
  imei: z.string().length(15, "IMEI must be 15 digits"),
  brand: z.string().min(1),
  model: z.string().min(1),
  modelCode: z.string().optional(),
  value: z.number().int().positive(),
  packagePrice: z.number().int().positive().optional(),
  salesmanName: z.string().optional(),
  firstPaymentAmount: z.number().int().nonnegative().optional(),
  condition: z.enum(["NEW", "USED"]),
  imageUrls: z.array(z.string()).max(4, "Maximum 4 photos").optional(),
  videoUrls: z.array(z.string()).max(3, "Maximum 3 videos").optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "AGENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerDeviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const {
    customerName,
    customerEmail,
    customerPhone,
    imei,
    brand,
    model,
    modelCode,
    value,
    packagePrice,
    salesmanName,
    firstPaymentAmount,
    condition,
    imageUrls,
    videoUrls,
  } = parsed.data;

  const existingDevice = await prisma.device.findUnique({ where: { imei } });
  if (existingDevice) {
    return NextResponse.json(
      { error: "A device with this IMEI is already registered" },
      { status: 409 }
    );
  }

  const pkg = calculatePackage(value);
  if (!pkg.eligible) {
    return NextResponse.json({ error: pkg.reasoning }, { status: 400 });
  }

  // Find or create the customer's account. Walk-in customers registered by
  // an agent get a random temporary password — they can reset it later.
  let customer = await prisma.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });

  if (!customer) {
    const tempPassword = randomBytes(9).toString("base64url");
    customer = await prisma.user.create({
      data: {
        name: customerName,
        email: customerEmail.toLowerCase(),
        phone: customerPhone,
        passwordHash: await hash(tempPassword, 10),
        role: "CUSTOMER",
      },
    });
  }

  const agent = await prisma.user.findUnique({ where: { id: session.user.id } });

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Upload photos/videos to Cloudinary if configured; otherwise this stores
  // the raw base64 data URIs as before, so registration never breaks either way.
  const [uploadedImageUrls, uploadedVideoUrls] = await Promise.all([
    imageUrls?.length
      ? uploadImagesToCloudinary(imageUrls, `dwp-devices/${imei}`)
      : Promise.resolve([]),
    videoUrls?.length
      ? uploadVideosToCloudinary(videoUrls, `dwp-devices/${imei}`)
      : Promise.resolve([]),
  ]);

  const device = await prisma.device.create({
    data: {
      imei,
      brand,
      model,
      modelCode,
      value,
      packagePrice,
      salesmanName,
      firstPaymentAmount,
      condition,
      imageUrls: uploadedImageUrls,
      videoUrls: uploadedVideoUrls,
      customerId: customer.id,
      registeredById: session.user.id,
      shopId: agent?.shopId ?? undefined,
      warranty: {
        create: {
          tierLabel: pkg.tierLabel,
          price: pkg.price,
          status: "ACTIVE",
          expiresAt,
        },
      },
    },
    include: { warranty: true, customer: true },
  });

  const commissionAmount = calculateCommission(packagePrice ?? pkg.price);

  await prisma.commission.create({
    data: {
      agentId: session.user.id,
      deviceId: device.id,
      amount: commissionAmount,
      status: "PENDING",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: session.user.id,
        channel: "PUSH",
        title: "Device registered",
        body: `${brand} ${model} registered for ${customerName}. Commission of Rs. ${commissionAmount.toLocaleString()} is pending.`,
      },
      {
        userId: customer.id,
        channel: "PUSH",
        title: "Warranty activated",
        body: `${brand} ${model} is now covered under the ${pkg.tierLabel} plan.`,
      },
    ],
  });

  // Fire-and-forget: an email hiccup shouldn't fail the device registration itself.
  sendDeviceRegisteredEmail(customer.email, {
    customerName,
    brand,
    model,
    tierLabel: pkg.tierLabel,
  }).catch(() => {});

  return NextResponse.json({ device }, { status: 201 });
}