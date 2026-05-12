"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

const CATEGORIES = ["ทั้งหมด", "Action", "Fantasy", "Romance", "Sci-Fi", "Comedy", "Horror", "Drama", "Slice of Life"];
const RATINGS = ["ทั้งหมด", "all", "teen", "mature"];
const STATUSES = ["ทั้งหมด", "Ongoing", "Completed", "Hiatus"];
const PUBLISH_OPTS = ["ทั้งหมด", "เผยแพร่", "ซ่อน"];
const PAGE_SIZES = [10, 20, 50];

interface Manga {
  id: number;
  title: string;
  coverImage: string | null;
  genre: string;
  status: string;
  viewCount: number;
  updatedAt: string;
  _count: { chapters: number };
  chapters: { chapterNumber: number }[];
}

export default function WriterComicsPage() {
  const { data: session, status } = useSession();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    title: "",
    category: "ทั้งหมด",
    rating: "ทั้งหมด",
    status: "ทั้งหมด",
    publish: "ทั้งหมด",
  });

  useEffect(() => {
    if (status === "unauthenticated") return;
    fetch("/api/writer/comics")
      .then((r) => r.json())
      .then((data) => setMangas(Array.isArray(data) ? data : []))
      .catch(() => setFetchError("ไม่สามารถโหลดข้อมูลการ์ตูนได้ กรุณาลองใหม่อีกครั้ง"))
      .finally(() => setLoading(false));
  }, [status]);

  function clearFilters() {
    setFilters({ title: "", category: "ทั้งหมด", rating: "ทั้งหมด", status: "ทั้งหมด", publish: "ทั้งหมด" });
  }

  const filtered = mangas.filter((m) => {
    if (filters.title && !m.title.toLowerCase().includes(filters.title.toLowerCase())) return false;
    if (filters.category !== "ทั้งหมด" && m.genre !== filters.category) return false;
    if (filters.status !== "ทั้งหมด" && m.status !== filters.status) return false;
    return true;
  });

  const statusLabel: Record<string, { label: string; cls: string }> = {
    Ongoing: { label: "กำลังดำเนิน", cls: "bg-blue-400/10 text-blue-400 border border-blue-400/20" },
    Completed: { label: "จบแล้ว", cls: "bg-green-400/10 text-green-400 border border-green-400/20" },
    Hiatus: { label: "หยุดชั่วคราว", cls: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20" },
  };

  return (
    <div className="p-6 text-text">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-muted">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
        <h1 className="text-xl font-bold text-text">การ์ตูนของฉัน</h1>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-border p-4 mb-4">
        <p className="text-sm font-semibold text-muted mb-3">ค้นหาการ์ตูน</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-36">
            <label className="block text-xs text-muted mb-1">ชื่อเรื่อง</label>
            <input
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              placeholder="ชื่อเรื่อง"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">หมวดหมู่</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">ระดับเนื้อหา</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {RATINGS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">สถานะ</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">การเผยแพร่</label>
            <select
              value={filters.publish}
              onChange={(e) => setFilters({ ...filters, publish: e.target.value })}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {PUBLISH_OPTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 border border-border rounded-lg px-4 py-2 text-sm text-muted hover:text-text hover:bg-bg transition-colors"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M9 9l6 6M15 9l-6 6"/>
            </svg>
            ล้างคำค้นหา
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
          {fetchError}
        </div>
      )}

      {/* Table header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">แสดง</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
          >
            {PAGE_SIZES.map((s) => <option key={s}>{s} รายการ</option>)}
          </select>
        </div>
        <Link
          href="/writer/comics/create"
          className="flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          สร้างการ์ตูนเรื่องใหม่
        </Link>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-muted">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">กำลังโหลด...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="mx-auto mb-3 text-muted/40">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            <p className="text-sm text-muted">
              ไม่มีข้อมูลการ์ตูน หากต้องการเพิ่มการ์ตูนกดปุ่ม{" "}
              <span className="text-text">สร้างการ์ตูนเรื่องใหม่</span>{" "}
              เพื่อสร้างการ์ตูนใหม่
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-bg border-b border-border">
              <tr>
                {["ชื่อเรื่อง", "หมวดหมู่", "สถานะ", "จำนวนตอน", "ยอดวิว", "อัปเดตล่าสุด", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, pageSize).map((manga) => {
                const s = statusLabel[manga.status] ?? { label: manga.status, cls: "bg-border/30 text-muted border border-border" };
                return (
                  <tr key={manga.id} className="hover:bg-bg/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-14 rounded overflow-hidden bg-bg border border-border flex-shrink-0">
                          {manga.coverImage ? (
                            <Image src={manga.coverImage} alt={manga.title} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted text-lg">📖</div>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-text line-clamp-2">{manga.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{manga.genre}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{manga._count.chapters} ตอน</td>
                    <td className="px-4 py-3 text-sm text-muted">{manga.viewCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {(() => { const d = new Date(manga.updatedAt); const m = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]; return `${d.getDate()}/${m[d.getMonth()]}/${d.getFullYear()+543}`; })()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/writer/comics/${manga.id}`}
                        className="text-xs bg-accent text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
                      >
                        จัดการ
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
