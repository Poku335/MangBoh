import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(`verify-otp:${getIP(req)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { email, otp } = await req.json();
  if (!email || !otp) {
    return NextResponse.json({ error: "email and otp required" }, { status: 400 });
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: { email: email.toLowerCase().trim(), used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.otp !== otp || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
  }

  const resetToken = randomBytes(32).toString("hex");

  await prisma.passwordResetOtp.update({
    where: { id: record.id },
    data: { used: true, resetToken },
  });

  return NextResponse.json({ resetToken });
}
