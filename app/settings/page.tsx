"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  coins?: number;
  role?: string;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const user = session?.user as SessionUser | undefined;

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/settings");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Heuristic: Google users have an image but no password in session
  const isGoogleUser = !!user?.image && !session?.user?.email?.includes("@gmail.com") === false;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });
      const json: { error?: string } = await res.json();
      if (!res.ok) throw new Error(json.error || "เกิดข้อผิดพลาด");

      await update({ name: name.trim() });
      setSuccess("บันทึกการเปลี่ยนแปลงสำเร็จ");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-1">การตั้งค่า</h1>
        <p className="text-muted text-sm">จัดการบัญชีของคุณ</p>
      </div>

      {/* Profile card */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center text-accent font-bold text-xl flex-shrink-0">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() ?? "U"
            )}
          </div>
          <div>
            <p className="font-semibold text-text">{user?.name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                {user?.role === "ADMIN" ? "แอดมิน" : "ผู้ใช้"}
              </span>
              {user?.image && (
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                  Google
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2">
          <span>🪙</span>
          <span className="text-gold font-bold">{user?.coins ?? 0} เหรียญ</span>
          <Link href="/topup" className="ml-auto text-xs text-accent hover:underline">เติมเหรียญ</Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Display name */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-bold text-text mb-4">ข้อมูลส่วนตัว</h2>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">ชื่อที่แสดง</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-white/40 transition-colors"
              placeholder="ชื่อของคุณ"
            />
          </div>
        </div>

        {/* Password change */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-bold text-text mb-1">เปลี่ยนรหัสผ่าน</h2>
          <p className="text-xs text-muted mb-4">
            {isGoogleUser
              ? "บัญชีนี้เข้าสู่ระบบผ่าน Google ไม่สามารถเปลี่ยนรหัสผ่านได้"
              : "เว้นว่างหากไม่ต้องการเปลี่ยน"}
          </p>
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="รหัสผ่านปัจจุบัน"
              disabled={isGoogleUser}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-white/40 transition-colors disabled:opacity-40"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="รหัสผ่านใหม่"
              disabled={isGoogleUser}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-white/40 transition-colors disabled:opacity-40"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่"
              disabled={isGoogleUser}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-muted outline-none focus:border-white/40 transition-colors disabled:opacity-40"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg">
            ✓ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && (
            <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          )}
          {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </form>
    </div>
  );
}
