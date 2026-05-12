import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role } = body;

    const validRoles: string[] = [UserRole.USER, UserRole.ADMIN];
    if (!userId || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: "ไม่สามารถเปลี่ยน role ของตัวเองได้" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: userId }, data: { role: role as UserRole } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
