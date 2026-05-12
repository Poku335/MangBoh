export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "ประวัติการอ่าน | MangBoh" };

export default async function ReadingHistoryPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user) redirect("/auth/signin?callbackUrl=/reading-history");

  const history = await prisma.readingHistory.findMany({
    where: { userId: parseInt(user.id) },
    include: {
      chapter: {
        include: { manga: true },
      },
    },
    orderBy: { lastReadAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">ประวัติการอ่าน</h1>
        <p className="text-muted text-sm">ติดตามตอนล่าสุดที่คุณเปิดอ่าน</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-5xl mb-4">🕐</p>
          <p className="text-text font-semibold mb-2">ยังไม่มีประวัติการอ่าน</p>
          <p className="text-muted text-sm mb-6 leading-relaxed max-w-sm mx-auto">
            เริ่มอ่านมังงะเพื่อให้ระบบบันทึกประวัติและกลับมาอ่านต่อได้ทุกเมื่อตรงนี้
          </p>
          <Link
            href="/"
            className="bg-accent text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-accent-hover transition-colors"
          >
            เลือกอ่านมังงะ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Link
              key={item.id}
              href={`/manga/${item.chapter.manga.id}/chapter/${item.chapter.id}`}
              className="group block rounded-3xl border border-border bg-surface p-4 transition-all hover:border-accent/40 hover:bg-accent/5"
            >
              <div className="flex gap-4 items-center">
                <div className="relative w-20 h-28 rounded-3xl overflow-hidden bg-bg border border-border flex-shrink-0">
                  {item.chapter.manga.coverImage ? (
                    <Image
                      src={item.chapter.manga.coverImage}
                      alt={item.chapter.manga.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted/50 text-3xl">
                      📖
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted uppercase tracking-[0.2em] mb-1">
                    {item.chapter.manga.genre || "การ์ตูน"}
                  </p>
                  <h2 className="text-lg font-semibold text-text line-clamp-2">
                    {item.chapter.manga.title}
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    ตอนที่ {item.chapter.chapterNumber}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted">อ่านล่าสุด</p>
                  <p className="text-sm text-text font-semibold">
                    {new Date(item.lastReadAt).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
