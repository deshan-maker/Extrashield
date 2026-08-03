import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: { warrantyId: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const warranty = await prisma.warranty.findUnique({
    where: { id: params.warrantyId },
    include: { device: { include: { customer: true } } },
  });

  if (!warranty || warranty.device.customerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { device } = warranty;
  const customer = device.customer;

  // --- QR code pointing to the public verification page ---
  const origin = new URL(request.url).origin;
  const verifyUrl = `${origin}/verify/${warranty.id}`;
  const qrPngBytes = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 260,
    color: { dark: "#0A1628", light: "#FFFFFFFF" },
  });

  // --- Build the PDF ---
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const navy = rgb(10 / 255, 22 / 255, 40 / 255);
  const cyan = rgb(9 / 255, 84 / 255, 188 / 255);
  const gray = rgb(0.42, 0.47, 0.53);
  const lightGray = rgb(0.94, 0.95, 0.97);

  // Header band
  page.drawRectangle({ x: 0, y: height - 140, width, height: 140, color: navy });
  page.drawText("EXTRA SHIELD", {
    x: 50,
    y: height - 60,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Warranty Certificate", {
    x: 50,
    y: height - 90,
    size: 13,
    font: regular,
    color: cyan,
  });
  page.drawText(`Certificate ID: ${warranty.id}`, {
    x: 50,
    y: height - 115,
    size: 9,
    font: regular,
    color: rgb(0.7, 0.76, 0.83),
  });

  let y = height - 190;
  const labelX = 50;
  const valueX = 220;

  function row(label: string, value: string) {
    page.drawText(label, { x: labelX, y, size: 10.5, font: regular, color: gray });
    page.drawText(value, { x: valueX, y, size: 11.5, font: bold, color: navy });
    y -= 30;
  }

  page.drawText("Coverage details", {
    x: labelX,
    y,
    size: 13,
    font: bold,
    color: navy,
  });
  y -= 30;

  row("Customer", customer.name);
  row("Device", `${device.brand} ${device.model}`);
  row("IMEI", device.imei);
  row("Plan", warranty.tierLabel);
  row("Annual premium", `Rs. ${warranty.price.toLocaleString()}`);
  row("Status", warranty.status);
  row("Activated on", new Date(warranty.activatedAt).toLocaleDateString());
  row("Expires on", new Date(warranty.expiresAt).toLocaleDateString());

  // Divider
  y -= 10;
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.9),
  });

  // QR block
  y -= 40;
  page.drawRectangle({ x: 50, y: y - 170, width: width - 100, height: 190, color: lightGray });
  const qrImage = await pdfDoc.embedPng(qrPngBytes);
  const qrSize = 130;
  page.drawImage(qrImage, {
    x: 70,
    y: y - 150,
    width: qrSize,
    height: qrSize,
  });
  page.drawText("Scan to verify", {
    x: 220,
    y: y - 40,
    size: 12,
    font: bold,
    color: navy,
  });
  page.drawText("This QR code links to a live verification page confirming", {
    x: 220,
    y: y - 62,
    size: 9.5,
    font: regular,
    color: gray,
  });
  page.drawText("this warranty is genuine and currently active.", {
    x: 220,
    y: y - 76,
    size: 9.5,
    font: regular,
    color: gray,
  });
  page.drawText(verifyUrl, {
    x: 220,
    y: y - 100,
    size: 8.5,
    font: regular,
    color: rgb(0.1, 0.55, 0.6),
  });

  // Footer
  page.drawText(
    "This certificate was issued electronically by Extra Shield and is valid without a signature.",
    { x: 50, y: 40, size: 8, font: regular, color: gray }
  );

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="dwp-warranty-certificate-${device.brand}-${device.model}.pdf"`,
    },
  });
}