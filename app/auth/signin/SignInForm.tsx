"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInForm({
  googleConfigured,
}: {
  googleConfigured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else if (result?.ok) {
      router.push(callbackUrl);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-4xl">📚</span>
          <h1 className="text-2xl font-bold mt-2 text-accent">MangBoh</h1>
          <p className="text-muted text-sm mt-1">เข้าสู่ระบบเพื่ออ่านต่อ</p>
        </div>

        {/* Google */}
        {googleConfigured ? (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-text hover:bg-border transition-colors mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg
                className="animate-spin w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
          </button>
        ) : (
          <div className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 mb-4 text-sm text-yellow-400">
            <p className="font-semibold mb-1">
              ⚠ Google sign-in ยังไม่ได้ตั้งค่า
            </p>
            <p className="text-xs text-yellow-400/70">
              เพิ่ม{" "}
              <code className="bg-yellow-500/10 px-1 rounded">
                GOOGLE_CLIENT_ID
              </code>{" "}
              และ{" "}
              <code className="bg-yellow-500/10 px-1 rounded">
                GOOGLE_CLIENT_SECRET
              </code>{" "}
              ใน .env
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-muted text-xs">หรือเข้าสู่ระบบด้วยอีเมล</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        {/* Credentials */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-text">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-white/40 transition-colors"
              disabled={loading}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-text">รหัสผ่าน</label>
              <Link href="/auth/forgot-password" className="text-xs text-muted hover:text-accent transition-colors">ลืมรหัสผ่าน?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            className="w-full bg-accent text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="animate-spin w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            )}
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-sm text-center text-muted mt-4">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/auth/signup"
            className="text-accent hover:underline font-medium"
          >
            สมัครสมาชิก
          </Link>
        </p>

        <p className="text-xs text-center text-muted mt-3">
          <Link href="/" className="hover:text-text transition-colors">
            กลับหน้าหลัก
          </Link>
        </p>
      </div>
    </div>
  );
}
