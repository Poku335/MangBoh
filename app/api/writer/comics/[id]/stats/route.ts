import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const mangaId = parseInt(id);
  if (isNaN(mangaId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const manga = await prisma.manga.findUnique({
    where: { id: mangaId },
    select: { authorId: true },
  });
  if (!manga) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = manga.authorId === parseInt(user.id);
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [purchases, ratingAgg, commentCount, bookmarkCount] = await Promise.all([
    prisma.purchase.findMany({
      where: { chapter: { mangaId } },
      select: { paidAmount: true, createdAt: true },
    }),
    prisma.rating.aggregate({
      where: { mangaId },
      _avg: { score: true },
      _count: { score: true },
    }),
    prisma.comment.count({ where: { mangaId } }),
    prisma.bookmark.count({ where: { mangaId } }),
  ]);

  const totalRevenue = purchases.reduce((sum, p) => sum + p.paidAmount, 0);

  return NextResponse.json({
    totalRevenue,
    totalPurchases: purchases.length,
    avgRating: ratingAgg._avg.score ? Math.round(ratingAgg._avg.score * 10) / 10 : null,
    ratingCount: ratingAgg._count.score,
    commentCount,
    bookmarkCount,
  });
}
