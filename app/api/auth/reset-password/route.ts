import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkOrigin } from "@/lib/csrf";
import { log, getReqMeta } from "@/lib/logger";

export async function POST(req: NextRequest) {
  if (!checkOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { resetToken, password } = await req.json();
  if (!resetToken || !password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
  }

  const record = await prisma.passwordResetOtp.findUnique({
    where: { resetToken },
  });

  if (!record || !record.used || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token ไม่ถูกต้องหรือหมดอายุแล้ว" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
      select: { id: true },
    }),
    prisma.passwordResetOtp.delete({ where: { resetToken } }),
  ]);

  const { ip, userAgent } = getReqMeta(req);
  await log({ userId: updatedUser.id, type: "AUTH", action: "password_reset_complete", ip, userAgent });

  return NextResponse.json({ success: true });
}
