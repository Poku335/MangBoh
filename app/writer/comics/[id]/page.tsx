"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddChapterModal from "@/components/AddChapterModal";

type Tab = "details" | "chapters" | "stats";

interface StatsData {
  totalRevenue: number;
  totalPurchases: number;
  avgRating: number | null;
  ratingCount: number;
  commentCount: number;
  bookmarkCount: number;
}

interface Chapter {
  id: number;
  chapterNumber: number;
  title: string | null;
  isPaid: boolean;
  price: number;
  isHidden: boolean;
  createdAt: string;
  _count: { pages: number };
}

interface MangaDetail {
  id: number;
  title: string;
  altTitle: string | null;
  coverImage: string | null;
  genre: string;
  status: string;
  viewCount: number;
  description: string;
  updatedAt: string;
  chapters: Chapter[];
  _count: { chapters: number };
}

export default function WriterComicManagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("chapters");
  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadManga = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/writer/comics/${params.id}`);
      if (!res.ok) { router.push("/writer/comics"); return; }
      const data = await res.json();
      setManga(data);
    } catch {
      router.push("/writer/comics");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const loadStats = useCallback(async () => {
    if (stats) return;
    setStatsLoading(true);
    const res = await fetch(`/api/writer/comics/${params.id}/stats`);
    if (res.ok) setStats(await res.json());
    setStatsLoading(false);
  }, [params.id, stats]);

  useEffect(() => { loadManga(); }, [loadManga]);
  useEffect(() => { if (tab === "stats") loadStats(); }, [tab, loadStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!manga) return null;

  const chapters = manga.chapters ?? [];
  const lastChapter = chapters.length > 0
    ? Math.max(...chapters.map((c) => c.chapterNumber))
    : null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "details", label: "รายละเอียด" },
    { key: "chapters", label: "ตอน" },
    { key: "stats", label: "สถิติ & รายรับ" },
  ];

  const statusLabel: Record<string, string> = {
    Ongoing: "กำลังดำเนิน",
    Completed: "จบแล้ว",
    Hiatus: "หยุดชั่วคราว",
  };

  return (
    <div className="p-6 text-text">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-5 flex items-center gap-1.5">
        <Link href="/writer/comics" className="hover:text-accent transition-colors">การ์ตูนของฉัน</Link>
        <span>›</span>
        <span className="text-text truncate max-w-xs">{manga.title}</span>
      </nav>

      {/* Comic header */}
      <div className="flex items-start gap-4 mb-6 bg-surface rounded-xl border border-border p-4">
        <div className="relative w-16 rounded-lg overflow-hidden bg-bg border border-border flex-shrink-0" style={{ height: "5.5rem" }}>
          {manga.coverImage ? (
            <Image src={manga.coverImage} alt={manga.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted text-2xl">📖</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-text text-base truncate">{manga.title}</h1>
          {manga.altTitle && <p className="text-sm text-muted">{manga.altTitle}</p>}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted">
            <span>{manga.genre}</span>
            <span>•</span>
            <span>{statusLabel[manga.status] ?? manga.status}</span>
            <span>•</span>
            <span>{chapters.length} ตอน</span>
            <span>•</span>
            <span>{manga.viewCount.toLocaleString()} ยอดวิว</span>
          </div>
        </div>
        <Link
          href={`/manga/${manga.id}`}
          target="_blank"
          className="text-xs text-accent hover:text-accent-hover border border-accent/30 rounded-lg px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0 transition-colors"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          ดูหน้าการ์ตูน
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {tab === "details" && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="font-semibold text-text mb-4">ข้อมูลการ์ตูน</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3"><span className="text-muted w-32 flex-shrink-0">ชื่อเรื่อง</span><span className="text-text">{manga.title}</span></div>
            {manga.altTitle && <div className="flex gap-3"><span className="text-muted w-32 flex-shrink-0">ชื่อต้นฉบับ</span><span className="text-text">{manga.altTitle}</span></div>}
            <div className="flex gap-3"><span className="text-muted w-32 flex-shrink-0">หมวดหมู่</span><span className="text-text">{manga.genre}</span></div>
            <div className="flex gap-3"><span className="text-muted w-32 flex-shrink-0">สถานะ</span><span className="text-text">{statusLabel[manga.status]}</span></div>
            <div className="flex gap-3"><span className="text-muted w-32 flex-shrink-0">คำอธิบาย</span><span className="text-text leading-relaxed">{manga.description}</span></div>
          </div>
          <div className="mt-5 flex gap-3">
            <Link
              href={`/writer/comics/${params.id}/edit`}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
            >
              แก้ไขข้อมูล
            </Link>
          </div>
        </div>
      )}

      {/* Chapters tab */}
      {tab === "chapters" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{chapters.length} ตอนทั้งหมด</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
              เพิ่มตอนใหม่
            </button>
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            {chapters.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-muted/40">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
                <p className="text-sm text-muted">ยังไม่มีตอน กดปุ่ม "เพิ่มตอนใหม่" เพื่อเริ่มต้น</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-bg border-b border-border">
                  <tr>
                    {["ตอน", "ชื่อตอน", "หน้า", "ราคา", "สถานะ", "วันที่อัปโหลด", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber).map((ch) => (
                    <tr key={ch.id} className="hover:bg-bg/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-text">ตอนที่ {ch.chapterNumber}</td>
                      <td className="px-4 py-3 text-sm text-muted">{ch.title ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-muted">{ch._count.pages} หน้า</td>
                      <td className="px-4 py-3">
                        {ch.isPaid ? (
                          <span className="text-xs font-medium text-gold bg-gold/10 border border-gold/20 px-2 py-1 rounded-full">{ch.price} เหรียญ</span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">ฟรี</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ch.isHidden ? (
                          <span className="text-xs font-medium text-muted bg-border/50 px-2 py-1 rounded-full">ซ่อน</span>
                        ) : (
                          <span className="text-xs font-medium text-accent bg-accent/10 border border-accent/20 px-2 py-1 rounded-full">เผยแพร่</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {(() => { const d = new Date(ch.createdAt); const m = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]; return `${d.getDate()}/${m[d.getMonth()]}/${d.getFullYear()+543}`; })()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/manga/${manga.id}/chapter/${ch.id}`}
                          target="_blank"
                          className="text-xs text-accent hover:text-accent-hover border border-accent/30 rounded px-2 py-1 transition-colors"
                        >
                          ดู
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Stats tab */}
      {tab === "stats" && (
        <div>
          {statsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: "ยอดวิวทั้งหมด", value: manga.viewCount.toLocaleString(), icon: "👁" },
                { label: "จำนวนตอน", value: chapters.length.toLocaleString(), icon: "📖" },
                { label: "บุ๊กมาร์ก", value: (stats?.bookmarkCount ?? "-").toString(), icon: "🔖" },
                { label: "รายรับ (เหรียญ)", value: (stats?.totalRevenue ?? "-").toLocaleString?.() ?? "-", icon: "🪙" },
                { label: "ซื้อทั้งหมด", value: (stats?.totalPurchases ?? "-").toString(), icon: "🛒" },
                { label: "ความคิดเห็น", value: (stats?.commentCount ?? "-").toString(), icon: "💬" },
              ].map((s) => (
                <div key={s.label} className="bg-surface rounded-xl border border-border p-5">
                  <p className="text-xl mb-2">{s.icon}</p>
                  <p className="text-sm text-muted mb-1">{s.label}</p>
                  <p className="text-2xl font-bold text-text">{s.value}</p>
                </div>
              ))}
              {stats?.avgRating !== undefined && (
                <div className="bg-surface rounded-xl border border-border p-5 col-span-2 sm:col-span-1">
                  <p className="text-xl mb-2">⭐</p>
                  <p className="text-sm text-muted mb-1">คะแนนเฉลี่ย</p>
                  <p className="text-2xl font-bold text-text">
                    {stats.avgRating !== null ? `${stats.avgRating}/5` : "-"}
                  </p>
                  <p className="text-xs text-muted">{stats.ratingCount} คะแนน</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Chapter Modal */}
      {showModal && (
        <AddChapterModal
          mangaId={manga.id}
          prevChapterNumber={lastChapter}
          totalChapters={chapters.length}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadManga(); }}
        />
      )}
    </div>
  );
}
