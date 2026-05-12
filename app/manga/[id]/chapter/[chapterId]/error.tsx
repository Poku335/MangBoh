"use client";

import Link from "next/link";

export default function ReaderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="-mx-4 -my-6 min-h-screen bg-bg flex items-center justify-center sm:-mx-6 sm:-my-8 lg:-mx-8">
      <div className="mx-auto max-w-sm text-center px-6 py-10 bg-surface border border-border rounded-2xl shadow-xl">
        <div className="mb-4 text-4xl">📖</div>
        <h2 className="text-lg font-black text-text mb-2">โหลดบทไม่สำเร็จ</h2>
        <p className="text-sm text-muted mb-6">
          เกิดข้อผิดพลาดขณะโหลดบทนี้ กรุณาลองใหม่อีกครั้ง
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-hover transition-colors"
          >
            ลองใหม่
          </button>
          <Link
            href="/"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-muted hover:text-text hover:border-text/30 transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
