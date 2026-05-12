export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ข่าวอัปเดตล่าสุด",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "เมื่อกี้";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  if (diffWeeks < 5) return `${diffWeeks} สัปดาห์ที่แล้ว`;
  if (diffMonths < 12) return `${diffMonths} เดือนที่แล้ว`;
  return `${Math.floor(diffMonths / 12)} ปีที่แล้ว`;
}

export default async function NewsPage() {
  const recentManga = await prisma.manga.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      coverImage: true,
      createdAt: true,
      _count: { select: { chapters: true } },
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">ข่าวอัปเดตล่าสุด</h1>
        <p className="text-muted text-sm">มังงะและการ์ตูนที่เพิ่งเพิ่มเข้าระบบล่าสุด</p>
      </div>

      {recentManga.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-xl text-muted">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-base font-medium text-text">ยังไม่มีการอัปเดต</p>
          <p className="text-sm mt-1">ลองกลับมาใหม่ภายหลัง</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentManga.map((manga, index) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-accent/40 hover:bg-surface/80 transition-colors group"
            >
              {/* Rank number */}
              <span className="flex-shrink-0 w-7 text-center text-sm font-bold text-muted">
                {index + 1}
              </span>

              {/* Cover */}
              <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-bg border border-border relative">
                {manga.coverImage ? (
                  <Image
                    src={manga.coverImage}
                    alt={manga.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xl text-muted/30">
                    📖
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-text line-clamp-1 group-hover:text-accent transition-colors">
                  {manga.title}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {manga._count.chapters} ตอน
                </p>
              </div>

              {/* Time */}
              <span className="flex-shrink-0 text-xs text-muted">
                {formatRelativeTime(manga.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/" className="text-accent hover:underline text-sm">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
