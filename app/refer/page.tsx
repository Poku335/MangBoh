"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ReferPage() {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const userId = (session?.user as { id?: string } | undefined)?.id ?? "";
  const referralUrl = userId
    ? `${typeof window !== "undefined" ? window.location.origin : "https://MangBoh.com"}/join?ref=${userId}`
    : "";

  async function handleCopy() {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement("textarea");
      el.value = referralUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">แนะนำเพื่อน</h1>
        <p className="text-muted text-sm">
          รับรางวัลพิเศษเมื่อชวนเพื่อนมาใช้งาน
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 mb-4">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">👥</p>
          <h2 className="text-lg font-bold text-text mb-2">
            ฟีเจอร์กำลังพัฒนา
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
            ระบบแนะนำเพื่อนกำลังอยู่ในขั้นตอนการพัฒนา เร็วๆ
            นี้คุณจะได้รับเหรียญโบนัสทุกครั้งที่ชวนเพื่อนสมัคร
          </p>
        </div>

        <div className="bg-bg rounded-xl p-4 mb-5 space-y-2">
          {[
            { icon: "🪙", text: "รับ 20 เหรียญทุกครั้งที่เพื่อนสมัครสมาชิก" },
            { icon: "🎁", text: "เพื่อนรับ 10 เหรียญโบนัสเมื่อสมัคร" },
            { icon: "📊", text: "ติดตามจำนวนการแนะนำและรางวัลที่ได้รับ" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2.5 text-sm text-muted"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <p className="text-accent text-xs font-semibold mb-2 text-center">
            ลิงค์เชิญชวนของคุณ
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs text-muted truncate">
              {referralUrl || "MangBoh.com/join?ref=..."}
            </div>
            <button
              onClick={handleCopy}
              disabled={!referralUrl}
              className="bg-accent text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link href="/" className="text-accent hover:underline text-sm">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
