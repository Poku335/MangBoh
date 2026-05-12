import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

    const chapters = await prisma.chapter.findMany({
      select: {
        id: true,
        mangaId: true,
        chapterNumber: true,
        isPaid: true,
        price: true,
        manga: { select: { title: true } },
      },
      orderBy: [{ mangaId: "asc" }, { chapterNumber: "asc" }],
    });

    return NextResponse.json(chapters);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
