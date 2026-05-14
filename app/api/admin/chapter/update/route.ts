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

    const parsedChapterId = typeof chapterId === "number" ? chapterId : parseInt(chapterId);
    if (!parsedChapterId || isNaN(parsedChapterId)) {
      return NextResponse.json({ error: "Invalid chapterId" }, { status: 400 });
    }
    if (isPaid != null && typeof isPaid !== "boolean") {
      return NextResponse.json({ error: "isPaid must be boolean" }, { status: 400 });
    }
    if (price != null && (typeof price !== "number" || price < 0 || price > 99999)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    if (isHidden != null && typeof isHidden !== "boolean") {
      return NextResponse.json({ error: "isHidden must be boolean" }, { status: 400 });
    }
    if (title !== undefined && title !== null && typeof title !== "string") {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (isPaid != null) {
      updateData.isPaid = isPaid;
      updateData.price = isPaid ? (price ?? 10) : 0;
    }
    if (price != null && isPaid == null) updateData.price = price;
    if (isHidden != null) updateData.isHidden = isHidden;
    if (title !== undefined) updateData.title = title || null;

    const chapter = await prisma.chapter.update({
      where: { id: parsedChapterId },
      data: updateData,
    });

    return NextResponse.json(chapter);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
