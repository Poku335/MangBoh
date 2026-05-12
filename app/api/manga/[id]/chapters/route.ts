import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mangaId = parseInt(id);
  if (isNaN(mangaId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const chapters = await prisma.chapter.findMany({
    where: { mangaId },
    orderBy: { chapterNumber: "desc" },
    select: { id: true, chapterNumber: true },
  });

  return NextResponse.json(chapters, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
