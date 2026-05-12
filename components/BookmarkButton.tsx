"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BookmarkButtonProps {
  mangaId: number;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ mangaId, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const handleToggle = async () => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mangaId }),
      });
      const json: { bookmarked?: boolean } = await res.json();
      if (res.ok && typeof json.bookmarked === "boolean") {
        setBookmarked(json.bookmarked);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={bookmarked ? "ยกเลิกบุ๊กมาร์ก" : "บุ๊กมาร์ก"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
        bookmarked
          ? "border-accent bg-accent/15 text-accent"
          : "border-border bg-bg text-text hover:border-accent hover:text-accent"
      } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <svg
          className="animate-spin"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          fill={bookmarked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      {loading ? "กำลังโหลด..." : bookmarked ? "บุ๊กมาร์กแล้ว" : "บุ๊กมาร์ก"}
    </button>
  );
}
