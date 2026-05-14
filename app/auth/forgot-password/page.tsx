"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }

    router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h1 className="text-2xl font-bold mt-2 text-accent">ลืมรหัสผ่าน</h1>
          <p className="text-muted text-sm mt-1">กรอกอีเมลเพื่อรับรหัส OTP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-white/40 transition-colors"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังส่ง..." : "ส่งรหัส OTP"}
          </button>
        </form>

        <p className="text-sm text-center text-muted mt-4">
          <Link href="/auth/signin" className="text-accent hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
}
