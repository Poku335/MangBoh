export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BookmarkButton from "@/components/BookmarkButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "บุ๊กมาร์ก | MangBoh" };

export default async function BookmarksPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user) redirect("/auth/signin?callbackUrl=/bookmarks");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: parseInt(user.id) },
    include: { manga: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">บุ๊กมาร์ก</h1>
        <p className="text-muted text-sm">
          มังงะที่คุณเก็บไว้สำหรับอ่านภายหลัง
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-5xl mb-4">🔖</p>
          <p className="text-text font-semibold mb-2">ยังไม่มีบุ๊กมาร์ก</p>
          <p className="text-muted text-sm mb-6 leading-relaxed max-w-sm mx-auto">
            กดปุ่ม &ldquo;บุ๊กมาร์ก&rdquo;
            ในหน้ารายละเอียดการ์ตูนเพื่อเก็บเรื่องที่ชอบไว้ที่นี่
          </p>
          <Link
            href="/"
            className="bg-accent text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-hover transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((item) => (
            <div
              key={item.id}
              className="group grid gap-4 rounded-3xl border border-border bg-surface p-4 sm:grid-cols-[auto_1fr_auto] items-center"
            >
              <Link
                href={`/manga/${item.manga.id}`}
                className="relative overflow-hidden rounded-3xl border border-border bg-bg w-24 h-32 sm:h-28 flex-shrink-0"
              >
                {item.manga.coverImage ? (
                  <Image
                    src={item.manga.coverImage}
                    alt={item.manga.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted/40 text-3xl">
                    📖
                  </div>
                )}
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/manga/${item.manga.id}`}
                  className="text-lg font-semibold text-text line-clamp-2 hover:text-accent transition-colors"
                >
                  {item.manga.title}
                </Link>
                <p className="text-sm text-muted mt-1">
                  {item.manga.genre || "การ์ตูน"}
                </p>
              </div>
              <div className="flex justify-end items-center">
                <BookmarkButton
                  mangaId={item.manga.id}
                  initialBookmarked={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
