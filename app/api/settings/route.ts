import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    if (name && typeof name === "string") {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        return NextResponse.json({ error: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" }, { status: 400 });
      }
      updateData.name = trimmed;
    }

    if (newPassword) {
      if (!user.password) {
        return NextResponse.json({ error: "บัญชีนี้ใช้ Google sign-in ไม่สามารถตั้งรหัสผ่านได้" }, { status: 400 });
      }
      if (!currentPassword) {
        return NextResponse.json({ error: "กรุณาใส่รหัสผ่านปัจจุบัน" }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword as string, user.password);
      if (!valid) {
        return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
      }
      if ((newPassword as string).length < 6) {
        return NextResponse.json({ error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword as string, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลที่ต้องอัปเดต" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: user.id }, data: updateData });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
