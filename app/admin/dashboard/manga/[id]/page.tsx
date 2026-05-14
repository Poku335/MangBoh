"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface ChapterData {
  id: number;
  chapterNumber: number;
  title?: string | null;
  isPaid: boolean;
  isHidden: boolean;
  price: number;
  createdAt?: string;
  _count?: { pages: number };
}

interface MangaData {
  id: number;
  title: string;
  status: string;
  chapters: ChapterData[];
}

export default function AdminMangaChaptersPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const mangaId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [manga, setManga] = useState<MangaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<Record<number, string>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ChapterData | null>(null);

  async function loadManga() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/manga/${mangaId}`);
      const json = await res.json() as MangaData | { error?: string };
      if (!res.ok || !("id" in json)) throw new Error((json as { error?: string })?.error || "Failed to load");
      setManga(json as MangaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (Number.isFinite(mangaId)) loadManga(); }, [mangaId]);

  async function handleCreateChapter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setChapterError(null);
    const form = e.currentTarget;
    const chapterNumber = parseFloat((form.elements.namedItem("chapterNumber") as HTMLInputElement).value);
    const title = (form.elements.namedItem("title") as HTMLInputElement).value;
    try {
      const res = await fetch("/api/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mangaId, chapterNumber, title: title || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create chapter");
      const chapterId = json.data?.id ?? json.id;
      router.push(`/manga/${mangaId}/chapter/${chapterId}/upload`);
    } catch (err) {
      setChapterError(err instanceof Error ? err.message : "Error");
      setCreating(false);
    }
  }

  async function patch(chapterId: number, data: object) {
    const res = await fetch("/api/admin/chapter/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, ...data }),
    });
    if (!res.ok) throw new Error("Update failed");
    await loadManga();
  }

  async function handleDelete(chapter: ChapterData) {
    setDeletingId(chapter.id);
    setConfirmDelete(null);
    try {
      const res = await fetch("/api/admin/chapter/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadManga();
    } catch {
      alert("ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  const chapters = manga?.chapters ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">จัดการตอน</h1>
          <p className="text-sm text-muted mt-0.5">{manga?.title || `Manga #${mangaId}`}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/manga/${mangaId}`}
            target="_blank"
            className="bg-bg border border-border text-muted text-sm font-semibold px-4 py-2 rounded-lg hover:border-accent/40 hover:text-accent transition-colors"
          >
            ดูหน้าการ์ตูน ↗
          </Link>
          <Link
            href="/admin/dashboard"
            className="bg-bg border border-border text-text text-sm font-semibold px-4 py-2 rounded-lg hover:border-accent/60 hover:text-accent transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Add chapter form */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          เพิ่มตอนใหม่
        </h2>
        <form onSubmit={handleCreateChapter} className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs text-muted mb-1.5 font-medium">เลขตอน</label>
            <input
              name="chapterNumber"
              type="number"
              step="0.1"
              min="0"
              required
              placeholder="เช่น 1, 1.5"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-white/40 transition-colors transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5 font-medium">ชื่อตอน (ไม่บังคับ)</label>
            <input
              name="title"
              placeholder="ชื่อตอน..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-white/40 transition-colors transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? "กำลังสร้าง..." : "สร้างและอัปโหลด"}
          </button>
        </form>
        {chapterError && <p className="text-red-400 text-sm mt-3">{chapterError}</p>}
      </div>

      {/* Chapter list */}
      {loading && <div className="text-center text-muted py-12">กำลังโหลด...</div>}
      {!loading && error && <div className="text-red-400 text-sm py-6">{error}</div>}

      {!loading && !error && manga && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-text">{chapters.length} ตอน</h2>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-16 text-muted text-sm">
              ยังไม่มีตอน สร้างตอนแรกจากฟอร์มด้านบน
            </div>
          ) : (
            <div className="divide-y divide-border">
              {[...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber).map((ch) => (
                <div key={ch.id} className="px-5 py-4 hover:bg-bg/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Chapter info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-text font-bold text-sm">ตอนที่ {ch.chapterNumber}</span>
                        {ch.title && <span className="text-muted text-sm truncate max-w-[200px]">{ch.title}</span>}
                        <span className="text-xs text-muted bg-bg border border-border px-2 py-0.5 rounded-full">
                          {ch._count?.pages ?? 0} หน้า
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Free/Paid badge */}
                        {ch.isPaid ? (
                          <span className="text-xs bg-yellow-400/10 text-yellow-500 border border-yellow-400/20 px-2 py-0.5 rounded-full font-medium">
                            {ch.price} เหรียญ
                          </span>
                        ) : (
                          <span className="text-xs bg-green-400/10 text-green-500 border border-green-400/20 px-2 py-0.5 rounded-full font-medium">
                            ฟรี
                          </span>
                        )}
                        {/* Hidden badge */}
                        {ch.isHidden && (
                          <span className="text-xs bg-muted/10 text-muted border border-border px-2 py-0.5 rounded-full font-medium">
                            ซ่อนอยู่
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {/* Visibility toggle */}
                      <button
                        onClick={() => patch(ch.id, { isHidden: !ch.isHidden })}
                        title={ch.isHidden ? "แสดงตอนนี้" : "ซ่อนตอนนี้"}
                        className="p-2 rounded-lg border border-border bg-bg text-muted hover:text-text hover:border-accent/40 transition-colors"
                      >
                        {ch.isHidden ? (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        )}
                      </button>

                      {/* Free/Paid toggle */}
                      <button
                        onClick={() => patch(ch.id, { isPaid: !ch.isPaid, price: ch.price || 10 })}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          ch.isPaid
                            ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-500 hover:bg-yellow-400/20"
                            : "border-border bg-bg text-muted hover:border-accent/40 hover:text-accent"
                        }`}
                      >
                        {ch.isPaid ? "ตั้งฟรี" : "ตั้งราคา"}
                      </button>

                      {/* Price input (only when paid) */}
                      {ch.isPaid && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={editingPrice[ch.id] ?? ch.price}
                            onChange={(e) => setEditingPrice((p) => ({ ...p, [ch.id]: e.target.value }))}
                            className="w-16 bg-bg border border-border rounded-lg px-2 py-1.5 text-xs text-text outline-none focus:border-white/40 transition-colors text-center"
                          />
                          <button
                            onClick={() => {
                              const p = parseInt(editingPrice[ch.id] ?? String(ch.price));
                              if (!isNaN(p)) patch(ch.id, { isPaid: true, price: p });
                            }}
                            className="text-xs bg-accent text-white px-2 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
                          >
                            บันทึก
                          </button>
                        </div>
                      )}

                      {/* Upload pages */}
                      <Link
                        href={`/manga/${mangaId}/chapter/${ch.id}/upload`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-bg text-muted hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        อัปโหลด
                      </Link>

                      {/* View */}
                      <Link
                        href={`/manga/${mangaId}/chapter/${ch.id}`}
                        target="_blank"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-bg text-muted hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        ดู ↗
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(ch)}
                        disabled={deletingId === ch.id}
                        className="p-2 rounded-lg border border-border bg-bg text-muted hover:border-red-500/40 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="ลบตอนนี้"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-text mb-2">ยืนยันการลบ</h3>
            <p className="text-muted text-sm mb-1">ลบตอนที่ {confirmDelete.chapterNumber}?</p>
            <p className="text-red-400 text-xs mb-6">รูปภาพและประวัติการอ่านทั้งหมดจะถูกลบด้วย</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                ลบ
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-bg border border-border text-text font-semibold px-4 py-2 rounded-lg text-sm hover:bg-border transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
