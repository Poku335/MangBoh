export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ประวัติการซื้อ | MangBoh",
  description: "ดูรายการตอนที่คุณซื้อทั้งหมดบน MangBoh",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function PurchaseHistoryPage() {
  const session = await auth();
  const user = getSessionUser(session);

  if (!user) redirect("/auth/signin?callbackUrl=/purchase-history");

  const purchases = await prisma.purchase.findMany({
    where: { user: { email: user.email! } },
    include: {
      chapter: {
        include: {
          manga: { select: { id: true, title: true, coverImage: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalSpent = purchases.reduce((sum, p) => sum + p.paidAmount, 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">ประวัติการซื้อ</h1>
        <p className="text-muted text-sm">
          ทั้งหมด {purchases.length} รายการ · ใช้ไป{" "}
          <span className="text-gold font-bold">{totalSpent} 🪙</span>
        </p>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-xl">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-text font-semibold mb-1">ยังไม่มีประวัติการซื้อ</p>
          <p className="text-muted text-sm mb-4">
            เมื่อคุณซื้อตอน รายการจะปรากฏที่นี่
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
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-surface border border-border rounded-xl p-4 flex gap-3 items-center"
            >
              <div
                className="relative w-10 flex-shrink-0 rounded overflow-hidden bg-bg border border-border"
                style={{ height: "56px" }}
              >
                {purchase.chapter.manga.coverImage ? (
                  <Image
                    src={purchase.chapter.manga.coverImage}
                    alt={purchase.chapter.manga.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted/30 text-sm">
                    📖
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/manga/${purchase.chapter.manga.id}`}
                  className="font-semibold text-text text-sm hover:text-accent transition-colors truncate block"
                >
                  {purchase.chapter.manga.title}
                </Link>
                <Link
                  href={`/manga/${purchase.chapter.manga.id}/chapter/${purchase.chapter.id}`}
                  className="text-xs text-accent hover:underline"
                >
                  ตอน {purchase.chapter.chapterNumber}
                  {purchase.chapter.title ? ` - ${purchase.chapter.title}` : ""}
                </Link>
                <p className="text-xs text-muted mt-0.5">
                  {formatDate(purchase.createdAt)}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1 text-gold font-bold text-sm">
                <span>🪙</span>
                <span>{purchase.paidAmount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
