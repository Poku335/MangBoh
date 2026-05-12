"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface PurchaseModalProps {
  chapter: {
    id: number;
    chapterNumber: number;
    title?: string | null;
    price: number;
  };
  mangaId: number;
  userCoins: number;
  onClose: () => void;
}

export default function PurchaseModal({ chapter, mangaId, userCoins, onClose }: PurchaseModalProps) {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sufficientCoins = userCoins >= chapter.price;

  async function handlePurchase() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "ซื้อไม่สำเร็จ");
      await update();
      router.push(`/manga/${mangaId}/chapter/${chapter.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text">ตอนที่ {chapter.chapterNumber}</h2>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {chapter.title && <p className="text-sm text-muted mb-3">— {chapter.title}</p>}
        <p className="text-muted text-sm mb-4">ตอนนี้ต้องใช้เหรียญในการอ่าน</p>

        <div className="bg-bg border border-border rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">ราคา</span>
            <span className="text-gold font-bold flex items-center gap-1">🪙 {chapter.price}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">เหรียญของคุณ</span>
            <span className={`font-bold ${sufficientCoins ? "text-gold" : "text-red-400"}`}>
              🪙 {userCoins}
            </span>
          </div>
          {sufficientCoins && (
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-muted text-sm">คงเหลือหลังซื้อ</span>
              <span className="text-text font-medium">🪙 {userCoins - chapter.price}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {!sufficientCoins ? (
          <div className="space-y-3">
            <p className="text-red-400 text-sm font-medium text-center">
              ต้องการเหรียญเพิ่ม {chapter.price - userCoins} เหรียญ
            </p>
            <Link
              href="/topup"
              className="block w-full bg-accent text-white font-semibold px-4 py-2.5 rounded-full hover:bg-accent-hover transition-colors text-center text-sm"
            >
              เติมเหรียญ
            </Link>
            <button onClick={onClose} className="w-full text-muted text-sm px-4 py-2 hover:text-text transition-colors">
              ยกเลิก
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full bg-accent text-white font-semibold px-4 py-2.5 rounded-full hover:bg-accent-hover transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
              )}
              {loading ? "กำลังซื้อ..." : "ซื้อและอ่านเลย"}
            </button>
            <button
              onClick={onClose}
              className="w-full bg-bg border border-border text-text text-sm px-4 py-2.5 rounded-full hover:bg-border transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
