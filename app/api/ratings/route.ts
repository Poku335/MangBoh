import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const mangaId = parseInt(req.nextUrl.searchParams.get("mangaId") ?? "");
  if (isNaN(mangaId)) return NextResponse.json({ error: "mangaId required" }, { status: 400 });

  const session = await auth();
  const user = getSessionUser(session);

  const [agg, userRating] = await Promise.all([
    prisma.rating.aggregate({
      where: { mangaId },
      _avg: { score: true },
      _count: { score: true },
    }),
    user
      ? prisma.rating.findUnique({
          where: { userId_mangaId: { userId: parseInt(user.id), mangaId } },
        })
      : null,
  ]);

  return NextResponse.json({
    avg: agg._avg.score ? Math.round(agg._avg.score * 10) / 10 : null,
    count: agg._count.score,
    userScore: userRating?.score ?? null,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mangaId, score } = await req.json();
  if (!mangaId) {
    return NextResponse.json({ error: "mangaId is required" }, { status: 400 });
  }
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "score must be an integer between 1 and 5" }, { status: 400 });
  }

  const rating = await prisma.rating.upsert({
    where: { userId_mangaId: { userId: parseInt(user.id), mangaId: parseInt(mangaId) } },
    create: { userId: parseInt(user.id), mangaId: parseInt(mangaId), score: parseInt(score) },
    update: { score: parseInt(score) },
  });

  const agg = await prisma.rating.aggregate({
    where: { mangaId: parseInt(mangaId) },
    _avg: { score: true },
    _count: { score: true },
  });

  return NextResponse.json({
    rating,
    avg: agg._avg.score ? Math.round(agg._avg.score * 10) / 10 : null,
    count: agg._count.score,
  });
}
