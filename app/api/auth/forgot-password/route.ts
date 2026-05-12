import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { log, getReqMeta } from "@/lib/logger";

export async function POST(req: NextRequest) {
  if (!rateLimit(`forgot-pw:${getIP(req)}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Don't reveal whether email exists — always return success
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, password: true },
  });
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  const otp = randomInt(100000, 1000000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.$transaction([
    prisma.passwordResetOtp.deleteMany({ where: { email: normalizedEmail } }),
    prisma.passwordResetOtp.create({ data: { email: normalizedEmail, otp, expiresAt } }),
  ]);

  await sendOtpEmail(normalizedEmail, otp);

  const { ip, userAgent } = getReqMeta(req);
  await log({ userId: user.id, type: "AUTH", action: "password_reset_request", ip, userAgent });

  return NextResponse.json({ success: true });
}
