import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { chapterId, isPaid, price, isHidden, title } = body;

    if (!chapterId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (isPaid != null) {
      updateData.isPaid = isPaid;
      updateData.price = isPaid ? (price || 10) : 0;
    }
    if (price != null && isPaid == null) updateData.price = price;
    if (isHidden != null) updateData.isHidden = isHidden;
    if (title !== undefined) updateData.title = title || null;

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
    });

    return NextResponse.json(chapter);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
