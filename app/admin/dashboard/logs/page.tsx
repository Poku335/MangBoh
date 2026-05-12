"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface SessionUser { role?: string }

interface LogEntry {
  id: number;
  type: "AUTH" | "ACTIVITY" | "ERROR";
  action: string;
  meta: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
}

const TYPE_STYLES: Record<string, string> = {
  AUTH: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  ACTIVITY: "bg-green-500/15 text-green-400 border-green-500/30",
  ERROR: "bg-red-500/15 text-red-400 border-red-500/30",
};

const ACTION_LABELS: Record<string, string> = {
  sign_in_success: "เข้าสู่ระบบสำเร็จ",
  sign_in_failed: "เข้าสู่ระบบล้มเหลว",
  sign_up: "สมัครสมาชิก",
  password_reset_request: "ขอรีเซ็ตรหัสผ่าน",
  password_reset_complete: "รีเซ็ตรหัสผ่านสำเร็จ",
  purchase_chapter: "ซื้อ Chapter",
  post_comment: "โพสต์ Comment",
  topup_request: "ส่ง Topup",
  topup_approved: "Topup อนุมัติ",
  topup_rejected: "Topup ปฏิเสธ",
  client_error: "Client Error",
};

export default function LogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as SessionUser | undefined;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      days: String(days),
      page: String(page),
      ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
    });
    const res = await fetch(`/api/admin/logs?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setTotal(data.total);
    }
    setLoading(false);
  }, [days, page, typeFilter]);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && user?.role !== "ADMIN")) {
      router.push("/");
    }
  }, [status, user, router]);

  useEffect(() => {
    if (status === "authenticated" && user?.role === "ADMIN") {
      fetchLogs();
    }
  }, [status, user, fetchLogs]);

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">User Logs</h1>
            <p className="text-muted text-sm mt-0.5">ประวัติกิจกรรมผู้ใช้ทั้งหมด</p>
          </div>
          <button onClick={() => router.push("/admin/dashboard")} className="text-sm text-muted hover:text-text transition-colors">
            ← กลับ Dashboard
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
            {["ALL", "AUTH", "ACTIVITY", "ERROR"].map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${typeFilter === t ? "bg-accent text-white" : "text-muted hover:text-text"}`}
              >
                {t === "ALL" ? "ทั้งหมด" : t}
              </button>
            ))}
          </div>

          <select
            value={days}
            onChange={(e) => { setDays(Number(e.target.value)); setPage(1); }}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={1}>วันนี้</option>
            <option value={7}>7 วัน</option>
            <option value={30}>30 วัน</option>
            <option value={90}>90 วัน</option>
          </select>

          <span className="text-muted text-sm self-center">รวม {total.toLocaleString()} รายการ</span>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs uppercase">
                  <th className="text-left px-4 py-3 font-medium">เวลา</th>
                  <th className="text-left px-4 py-3 font-medium">ประเภท</th>
                  <th className="text-left px-4 py-3 font-medium">กิจกรรม</th>
                  <th className="text-left px-4 py-3 font-medium">ผู้ใช้</th>
                  <th className="text-left px-4 py-3 font-medium">IP</th>
                  <th className="text-left px-4 py-3 font-medium">รายละเอียด</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">
                      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted">ยังไม่มีข้อมูล</td>
                  </tr>
                ) : (
                  logs.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-bg/50 transition-colors">
                      <td className="px-4 py-3 text-muted whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded border text-xs font-medium ${TYPE_STYLES[entry.type]}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text whitespace-nowrap">
                        {ACTION_LABELS[entry.action] ?? entry.action}
                      </td>
                      <td className="px-4 py-3">
                        {entry.user ? (
                          <div>
                            <div className="text-text font-medium">{entry.user.name}</div>
                            <div className="text-muted text-xs">{entry.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted font-mono text-xs">{entry.ip ?? "-"}</td>
                      <td className="px-4 py-3 text-muted text-xs max-w-xs truncate">
                        {entry.meta ? JSON.stringify(entry.meta) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-text disabled:opacity-40 transition-colors"
            >
              ←
            </button>
            <span className="px-3 py-1.5 text-sm text-muted">หน้า {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-text disabled:opacity-40 transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
