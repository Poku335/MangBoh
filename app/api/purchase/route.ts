import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { checkOrigin } from "@/lib/csrf";
import { log, getReqMeta } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!rateLimit(`purchase:${getIP(req)}`, 30, 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chapterId } = body;

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const chapterCheck = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapterCheck) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    if (!chapterCheck.isPaid) return NextResponse.json({ error: "This chapter is free" }, { status: 400 });

    const existing = await prisma.purchase.findUnique({
      where: { userId_chapterId: { userId: user.id, chapterId } },
    });
    if (existing) return NextResponse.json({ error: "Already purchased" }, { status: 400 });

    let insufficientCoins = false;
    await prisma.$transaction(async (tx) => {
      // Re-fetch price inside transaction to prevent price-change race condition
      const chapter = await tx.chapter.findUnique({ where: { id: chapterId } });
      if (!chapter || !chapter.isPaid) throw new Error("chapter_invalid");

      const deductResult = await tx.user.updateMany({
        where: { id: user.id, coins: { gte: chapter.price } },
        data: { coins: { decrement: chapter.price } },
      });

      if (deductResult.count === 0) {
        insufficientCoins = true;
        return;
      }

      await tx.purchase.create({
        data: { userId: user.id, chapterId, paidAmount: chapter.price },
      });
    });

    if (insufficientCoins) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 402 });
    }

    const { ip, userAgent } = getReqMeta(req);
    await log({ userId: user.id, type: "ACTIVITY", action: "purchase_chapter", meta: { chapterId }, ip, userAgent });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
