import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";

const submitClaimSchema = z.object({
  deviceId: z.string().min(1),
  issue: z.string().min(3, "Describe the issue in a few words"),
  photoUrls: z
    .array(z.string().max(8_000_000, "Each photo must be under ~6MB"))
    .max(4)
    .optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = submitClaimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const device = await prisma.device.findUnique({
    where: { id: parsed.data.deviceId },
    include: { warranty: true },
  });
  if (!device || device.customerId !== session.user.id) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  if (
    !device.warranty ||
    device.warranty.status === "EXPIRED" ||
    device.warranty.status === "CANCELLED" ||
    device.warranty.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "This device doesn't have an active warranty to file a claim against." },
      { status: 400 }
    );
  }

  const photoUrls = parsed.data.photoUrls?.length
    ? await uploadImagesToCloudinary(parsed.data.photoUrls, "dwp-claims")
    : [];

  const claim = await prisma.claim.create({
    data: {
      deviceId: device.id,
      customerId: session.user.id,
      issue: parsed.data.issue,
      status: "SUBMITTED",
      photoUrls,
    },
  });

  return NextResponse.json({ claim }, { status: 201 });
}