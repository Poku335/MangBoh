import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const mangaId = Number(body.mangaId);

    if (!mangaId || Number.isNaN(mangaId)) {
      return NextResponse.json({ error: "mangaId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_mangaId: { userId: user.id, mangaId } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_mangaId: { userId: user.id, mangaId } },
      });
      return NextResponse.json({ bookmarked: false });
    }

    await prisma.bookmark.create({
      data: {
        userId: user.id,
        mangaId,
      },
    });

    return NextResponse.json({ bookmarked: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
