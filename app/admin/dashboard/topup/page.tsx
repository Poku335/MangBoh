"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface SessionUser { role?: string }

interface TopupRequest {
  id: number;
  amount: number;
  status: string;
  slipPath: string | null;
  adminNote: string | null;
  createdAt: string;
  approvedAt: string | null;
  user: { id: number; name: string; email: string; coins: number };
}

type FilterStatus = "pending" | "approved" | "rejected";

export default function AdminTopupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewSlip, setPreviewSlip] = useState<string | null>(null);
  const [processing, setProcessing] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});

  const user = session?.user as (NonNullable<typeof session>["user"] & SessionUser) | undefined;
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/topup?status=${filter}`, { cache: "no-store" });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAdmin) fetchRequests();
  }, [isAdmin, fetchRequests]);

  if (status === "loading") return <div className="text-center py-12 text-muted">Loading...</div>;
  if (status === "unauthenticated") { router.push("/auth/signin"); return null; }
  if (!isAdmin) return <div className="text-center py-12 text-red-500">Admin only.</div>;

  async function handleAction(id: number, action: "approve" | "reject") {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/topup/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: noteInputs[id] || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchRequests();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setProcessing(null);
    }
  }

  const TABS: FilterStatus[] = ["pending", "approved", "rejected"];
  const TAB_LABEL: Record<FilterStatus, string> = { pending: "รออนุมัติ", approved: "อนุมัติแล้ว", rejected: "ปฏิเสธแล้ว" };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">จัดการเติมเหรียญ</h1>
          <p className="text-muted text-sm mt-0.5">ตรวจสอบสลิปและอนุมัติการเติมเงิน</p>
        </div>
        <Link href="/admin/dashboard" className="text-muted text-sm hover:text-text transition-colors">← Dashboard</Link>
      </div>

      <div className="flex gap-1 bg-bg border border-border rounded-xl p-1 mb-5 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === t ? "bg-accent text-white" : "text-muted hover:text-text"
            }`}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">กำลังโหลด...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-muted bg-surface border border-border rounded-xl">
          ไม่มีรายการ{TAB_LABEL[filter]}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold text-text">{req.user.name}</p>
                  <p className="text-xs text-muted">{req.user.email}</p>
                  <p className="text-xs text-muted mt-0.5">เหรียญปัจจุบัน: {req.user.coins} 🪙</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-accent">+{req.amount} เหรียญ</p>
                  <p className="text-sm text-muted">฿{req.amount}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(req.createdAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </div>

              {req.slipPath ? (
                <div className="mb-4">
                  <button
                    onClick={() => setPreviewSlip(previewSlip === req.slipPath ? null : req.slipPath)}
                    className="text-xs text-accent hover:underline"
                  >
                    {previewSlip === req.slipPath ? "ซ่อนสลิป ▲" : "ดูสลิป ▼"}
                  </button>
                  {previewSlip === req.slipPath && (
                    <div className="mt-2">
                      <Image
                        src={req.slipPath}
                        alt="slip"
                        width={300}
                        height={400}
                        className="rounded-xl object-contain max-h-72 border border-border"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted/60 mb-4 italic">ไม่มีสลิป</p>
              )}

              {req.adminNote && (
                <p className="text-xs text-muted bg-bg border border-border rounded-lg px-3 py-2 mb-4">
                  หมายเหตุ: {req.adminNote}
                </p>
              )}

              {req.status === "pending" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={noteInputs[req.id] ?? ""}
                    onChange={(e) => setNoteInputs((p) => ({ ...p, [req.id]: e.target.value }))}
                    placeholder="หมายเหตุ (ถ้ามี)"
                    className="w-full bg-bg border border-border text-text text-sm px-3 py-2 rounded-lg outline-none focus:border-accent/60"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req.id, "approve")}
                      disabled={processing === req.id}
                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 font-semibold text-sm py-2 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {processing === req.id ? "..." : "✓ อนุมัติ"}
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "reject")}
                      disabled={processing === req.id}
                      className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-sm py-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {processing === req.id ? "..." : "✕ ปฏิเสธ"}
                    </button>
                  </div>
                </div>
              )}

              {req.status !== "pending" && (
                <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg inline-block ${
                  req.status === "approved" ? "bg-green-500/15 text-green-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {req.status === "approved" ? "✓ อนุมัติแล้ว" : "✕ ปฏิเสธแล้ว"}
                  {req.approvedAt && ` · ${new Date(req.approvedAt).toLocaleDateString("th-TH")}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {previewSlip && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewSlip(null)}
        >
          <Image src={previewSlip} alt="slip" width={400} height={600} className="rounded-2xl max-h-[85vh] object-contain" unoptimized />
        </div>
      )}
    </div>
  );
}
