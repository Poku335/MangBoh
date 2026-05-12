export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ชั้นหนังสือ | MangBoh" };

interface MangaEntry {
  id: number;
  title: string;
  coverImage: string | null;
  _count: { chapters: number };
}

interface ChapterEntry {
  id: number;
  chapterNumber: number;
  title: string | null;
  purchasedAt: Date;
}

export default async function BookshelfPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user) redirect("/auth/signin?callbackUrl=/bookshelf");

  const purchases = await prisma.purchase.findMany({
    where: { user: { email: user.email! } },
    include: {
      chapter: {
        include: {
          manga: { include: { _count: { select: { chapters: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mangaMap = new Map<
    number,
    { manga: MangaEntry; chapters: ChapterEntry[]; lastPurchased: Date }
  >();
  for (const p of purchases) {
    const mid = p.chapter.manga.id;
    if (!mangaMap.has(mid)) {
      mangaMap.set(mid, {
        manga: p.chapter.manga,
        chapters: [],
        lastPurchased: p.createdAt,
      });
    }
    mangaMap.get(mid)!.chapters.push({
      id: p.chapter.id,
      chapterNumber: p.chapter.chapterNumber,
      title: p.chapter.title,
      purchasedAt: p.createdAt,
    });
  }
  const bookshelf = [...mangaMap.values()];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">ชั้นหนังสือ</h1>
        <p className="text-muted text-sm">
          ตอนที่คุณซื้อไว้ · {bookshelf.length} เรื่อง
        </p>
      </div>

      {bookshelf.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-xl">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-text font-semibold mb-1">
            ยังไม่มีเรื่องในชั้นหนังสือ
          </p>
          <p className="text-muted text-sm mb-4">
            ซื้อตอนที่ต้องการอ่านเพื่อเก็บไว้ที่นี่
          </p>
          <Link
            href="/"
            className="bg-accent text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-hover transition-colors"
          >
            เลือกอ่านมังงะ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookshelf.map(({ manga, chapters }) => (
            <div
              key={manga.id}
              className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex gap-4">
                <Link href={`/manga/${manga.id}`} className="flex-shrink-0">
                  <div
                    className="relative w-16 rounded-lg overflow-hidden bg-bg border border-border"
                    style={{ height: "88px" }}
                  >
                    {manga.coverImage ? (
                      <Image
                        src={manga.coverImage}
                        alt={manga.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted/30 text-2xl">
                        📖
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/manga/${manga.id}`}
                    className="font-bold text-text hover:text-accent transition-colors line-clamp-1 block mb-0.5"
                  >
                    {manga.title}
                  </Link>
                  <p className="text-xs text-muted mb-2">
                    ทั้งหมด {manga._count.chapters} ตอน · ซื้อแล้ว{" "}
                    {chapters.length} ตอน
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {chapters.slice(0, 6).map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/manga/${manga.id}/chapter/${ch.id}`}
                        className="bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-2.5 py-1 rounded-full hover:bg-accent/20 transition-colors"
                      >
                        ตอน {ch.chapterNumber}
                      </Link>
                    ))}
                    {chapters.length > 6 && (
                      <span className="text-xs text-muted px-2 py-1">
                        +{chapters.length - 6} ตอน
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
