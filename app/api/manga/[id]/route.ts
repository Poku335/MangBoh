import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mangaId = parseInt(id);
  if (isNaN(mangaId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const manga = await prisma.manga.findUnique({
    where: { id: mangaId },
    include: {
      chapters: {
        orderBy: { chapterNumber: "desc" },
        include: { _count: { select: { pages: true } } },
      },
      _count: { select: { chapters: true } },
    },
  });

  if (!manga) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(manga);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const mangaId = parseInt(id);
  if (isNaN(mangaId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const manga = await prisma.manga.findUnique({ where: { id: mangaId }, select: { authorId: true } });
  if (!manga) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = user.role === "ADMIN";
  const isAuthor = manga.authorId === parseInt(user.id);
  if (!isAdmin && !isAuthor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const updated = await prisma.manga.update({
    where: { id: mangaId },
    data: {
      ...(typeof body.title === "string" && { title: body.title.trim() }),
      ...(typeof body.status === "string" && { status: body.status }),
      ...(typeof body.genre === "string" && { genre: body.genre }),
      ...(typeof body.description === "string" && { description: body.description.trim() }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const user = getSessionUser(session);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const mangaId = parseInt(id);
  if (isNaN(mangaId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.manga.delete({ where: { id: mangaId } });
  return NextResponse.json({ success: true });
}
