"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Chapter {
  id: number;
  chapterNumber: number;
}

interface Props {
  mangaId: number;
  chapterNumber: number;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  currentChapterId: number;
}

export default function ReaderNav({ mangaId, chapterNumber, prevChapter, nextChapter, currentChapterId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[] | null>(null);

  async function openPicker() {
    setOpen(true);
    if (chapters === null) {
      const res = await fetch(`/api/manga/${mangaId}/chapters`);
      setChapters(await res.json());
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevChapter) {
        router.push(`/manga/${mangaId}/chapter/${prevChapter.id}`);
      } else if (e.key === "ArrowRight" && nextChapter) {
        router.push(`/manga/${mangaId}/chapter/${nextChapter.id}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mangaId, prevChapter, nextChapter, router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm mx-4 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">เลือกตอน</span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
                aria-label="ปิด"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="py-1">
              {chapters === null ? (
                <p className="px-4 py-4 text-sm text-white/40 text-center">กำลังโหลด...</p>
              ) : null}
              {(chapters ?? []).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/manga/${mangaId}/chapter/${ch.id}`);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    ch.id === currentChapterId
                      ? "bg-accent/20 text-accent font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  ตอนที่ {ch.chapterNumber}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#111]/95 backdrop-blur border-t border-white/10 h-14 flex items-center">
        <div className="w-full max-w-3xl mx-auto px-3 flex items-center justify-between gap-2">
          {prevChapter ? (
            <Link
              href={`/manga/${mangaId}/chapter/${prevChapter.id}`}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              ก่อนหน้า
            </Link>
          ) : (
            <div className="px-3 py-2 text-sm text-white/20">ก่อนหน้า</div>
          )}

          <button
            onClick={openPicker}
            className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/8 hover:bg-white/12 transition-colors px-4 py-2 rounded-lg border border-white/10"
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            ตอนที่ {chapterNumber}
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {nextChapter ? (
            <Link
              href={`/manga/${mangaId}/chapter/${nextChapter.id}`}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              ถัดไป
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="px-3 py-2 text-sm text-white/20">ถัดไป</div>
          )}
        </div>
      </div>

      <div className="h-14" />
    </>
  );
}
