import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";

const VALID_AMOUNTS = [10, 30, 50, 100, 200, 500];

// QR code bounding box inside qr-boh.png (575×568)
const QR_LEFT = 140;  // centered: (575 - 295) / 2
const QR_TOP = 170;
const QR_SIZE = 295;
const CROP_HEIGHT = QR_TOP + QR_SIZE + 50; // 515px — cuts off text/footer below QR
const WHITE_TOP = 100; // above PromptPay badge bottom edge

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const amountParam = req.nextUrl.searchParams.get("amount");
  const amount = Number(amountParam);
  if (!VALID_AMOUNTS.includes(amount)) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const promptpayId = process.env.PROMPTPAY_ID;
  if (!promptpayId) {
    return NextResponse.json(
      { error: "PromptPay not configured" },
      { status: 503 },
    );
  }

  const payload = generatePayload(promptpayId, { amount });

  // Generate QR as PNG buffer sized to fit the slot in the base image
  const qrBuffer = await QRCode.toBuffer(payload, {
    type: "png",
    width: QR_SIZE,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  // Full-width white rect covering old QR + all text below PromptPay badge
  const whiteRect = await sharp({
    create: {
      width: 575,
      height: CROP_HEIGHT - WHITE_TOP,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer();

  // Composite QR onto the base slip image (falls back to plain QR if base image missing)
  const basePath = path.join(process.cwd(), "qr", "qr-boh.png");
  let qrDataUrl: string;
  try {
    const composited = await sharp(basePath)
      .composite([
        { input: whiteRect, left: 0, top: WHITE_TOP },
        { input: qrBuffer, left: QR_LEFT, top: QR_TOP },
      ])
      .extract({ left: 0, top: 0, width: 575, height: CROP_HEIGHT })
      .png()
      .toBuffer();
    qrDataUrl = `data:image/png;base64,${composited.toString("base64")}`;
  } catch {
    qrDataUrl = `data:image/png;base64,${qrBuffer.toString("base64")}`;
  }

  return NextResponse.json({
    qr: qrDataUrl,
    amount,
    name: process.env.PROMPTPAY_NAME ?? "",
  });
}
