"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const PACKAGES = [
  { coins: 10, label: "" },
  { coins: 30, label: "" },
  { coins: 50, label: "ยอดนิยม", popular: true },
  { coins: 100, label: "" },
  { coins: 200, label: "คุ้มที่สุด" },
  { coins: 500, label: "" },
];

type Step = "select" | "qr" | "slip" | "done";

interface TopupHistory {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
  adminNote: string | null;
}

export default function TopUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>("select");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrName, setQrName] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [slip, setSlip] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<TopupHistory[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const user = session?.user as { coins?: number } | undefined;

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/topup")
        .then((r) => r.json())
        .then(setHistory)
        .catch(() => {});
    }
  }, [status, step]);

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }
  if (status === "loading")
    return <div className="text-center py-20 text-muted">Loading...</div>;

  function handleSelectPackage(coins: number) {
    setSelectedAmount(coins);
    setConfirming(true);
  }

  async function handleConfirm() {
    if (!selectedAmount) return;
    setConfirming(false);
    setQrLoading(true);
    setStep("qr");
    try {
      const res = await fetch(`/api/topup/qr?amount=${selectedAmount}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQrUrl(data.qr);
      setQrName(data.name ?? "");
    } catch (e) {
      alert(e instanceof Error ? e.message : "ไม่สามารถสร้าง QR ได้");
      setStep("select");
    } finally {
      setQrLoading(false);
    }
  }

  function handleCancelConfirm() {
    setConfirming(false);
    setSelectedAmount(null);
  }

  function handleSlipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlip(file);
    setSlipPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!slip || !selectedAmount) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("amount", String(selectedAmount));
      fd.append("slip", slip);
      const res = await fetch("/api/topup", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("select");
    setSelectedAmount(null);
    setQrUrl(null);
    setQrName("");
    setSlip(null);
    setSlipPreview(null);
    setConfirming(false);
  }

  const statusBadge = (s: string) => {
    if (s === "approved")
      return (
        <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
          อนุมัติแล้ว
        </span>
      );
    if (s === "rejected")
      return (
        <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
          ปฏิเสธ
        </span>
      );
    return (
      <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">
        รออนุมัติ
      </span>
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text">เติมเหรียญ</h1>
        <p className="text-muted text-sm mt-1">
          ยอดปัจจุบัน:{" "}
          <span className="text-gold font-bold">{user?.coins ?? 0} 🪙</span>
        </p>
      </div>

      {step === "select" && (
        <>
          <p className="text-xs text-muted mb-3 text-center">
            1บาท = 1เหรียญ · เลือกจำนวนเหรียญที่ต้องการ
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.coins}
                onClick={() => handleSelectPackage(pkg.coins)}
                className={`relative border rounded-xl p-4 text-center transition-all hover:border-accent/60 hover:bg-accent/5 ${
                  pkg.popular ? "border-accent/50 bg-accent/5" : "border-border"
                }`}
              >
                {pkg.label && (
                  <span
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      pkg.popular
                        ? "bg-accent text-white"
                        : "bg-gold/80 text-black"
                    }`}
                  >
                    {pkg.label}
                  </span>
                )}
                <div className="text-2xl font-bold text-accent">
                  {pkg.coins}
                </div>
                <div className="text-xs text-muted">เหรียญ</div>
                <div className="text-sm font-semibold text-text mt-1">
                  ฿{pkg.coins}
                </div>
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text mb-3">
                ประวัติการเติมเงิน
              </h3>
              <div className="space-y-2">
                {(showAllHistory ? history : history.slice(0, 5)).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-text font-medium">
                      +{h.amount} เหรียญ
                    </span>
                    <div className="flex items-center gap-2">
                      {statusBadge(h.status)}
                      <span className="text-muted text-xs">
                        {new Date(h.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Load More — only shows when there are more than 5 items */}
              {history.length > 5 && (
                <button
                  onClick={() => setShowAllHistory((v) => !v)}
                  className="mt-3 w-full text-xs text-muted hover:text-text transition-colors py-1.5 border border-dashed border-border rounded-lg"
                >
                  {showAllHistory ? "ซ่อน ▲" : `ดูเพิ่มเติม (${history.length - 5} รายการ) ▼`}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {step === "qr" && (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Amount header */}
          <div className="bg-accent/10 border-b border-border px-6 py-4 text-center">
            <p className="text-xs text-muted mb-0.5">จำนวนที่ต้องชำระ</p>
            <p className="text-4xl font-bold text-accent">฿{selectedAmount}</p>
          </div>

          {/* QR area */}
          <div className="flex flex-col items-center px-6 py-6 gap-4">
            {qrLoading ? (
              <div className="w-[300px] h-[300px] bg-bg rounded-xl flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" />
              </div>
            ) : qrUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src={qrUrl}
                  alt="PromptPay QR Slip"
                  width={575}
                  height={555}
                  unoptimized
                  className="w-full max-w-[300px] h-auto"
                />
              </div>
            ) : null}

            <p className="text-xs text-muted text-center">
              สแกน QR ด้วยแอปธนาคาร · PromptPay
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={() => setStep("slip")}
              disabled={qrLoading}
              className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              ฉันจ่ายแล้ว → อัพโหลดสลิป
            </button>
            <button
              onClick={reset}
              className="w-full text-muted text-sm hover:text-text transition-colors"
            >
              ← เลือกจำนวนใหม่
            </button>
          </div>
        </div>
      )}

      {step === "slip" && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-text font-semibold mb-1">อัพโหลดสลิป</h2>
          <p className="text-muted text-xs mb-5">
            แนบ screenshot การโอน ฿{selectedAmount} — Admin จะตรวจสอบและเพิ่ม{" "}
            <span className="text-accent font-semibold">
              {selectedAmount} เหรียญ
            </span>{" "}
            ให้
          </p>

          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-5 ${
              slipPreview
                ? "border-accent/40"
                : "border-border hover:border-accent/40"
            }`}
          >
            {slipPreview ? (
              <Image
                src={slipPreview}
                alt="slip preview"
                width={200}
                height={300}
                className="mx-auto rounded-lg object-contain max-h-64"
                unoptimized
              />
            ) : (
              <>
                <p className="text-3xl mb-2">📎</p>
                <p className="text-sm text-muted">แตะเพื่อเลือกรูปสลิป</p>
                <p className="text-xs text-muted/60 mt-1">JPG, PNG</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSlipChange}
          />

          <button
            onClick={handleSubmit}
            disabled={!slip || submitting}
            className="w-full bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ส่งคำขอ...
              </>
            ) : (
              "ส่งสลิป"
            )}
          </button>
          <button
            onClick={() => setStep("qr")}
            className="mt-3 w-full text-muted text-sm hover:text-text transition-colors"
          >
            ← กลับ QR Code
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-text mb-2">ส่งคำขอแล้ว!</h2>
          <p className="text-muted text-sm mb-6 leading-relaxed">
            Admin จะตรวจสอบสลิปและเพิ่ม{" "}
            <span className="text-accent font-bold">
              {selectedAmount} เหรียญ
            </span>{" "}
            ให้ภายใน 24 ชั่วโมง
          </p>
          <button
            onClick={reset}
            className="bg-accent text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
          >
            เติมเหรียญเพิ่ม
          </button>
          <div className="mt-3">
            <Link
              href="/"
              className="text-muted text-sm hover:text-text transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirming && selectedAmount !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCancelConfirm}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text mb-1 text-center">
              ยืนยันการเติมเหรียญ
            </h2>
            <p className="text-muted text-sm text-center mb-6">
              คุณต้องการเติมเหรียญแพ็คเกจนี้ใช่ไหม?
            </p>

            <div className="bg-bg border border-border rounded-xl p-4 mb-6 text-center">
              <div className="text-4xl font-bold text-accent">
                {selectedAmount}
              </div>
              <div className="text-sm text-muted mt-0.5">เหรียญ</div>
              <div className="text-lg font-semibold text-text mt-2">
                ฿{selectedAmount}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 border border-border text-muted font-semibold py-2.5 rounded-xl hover:bg-border/50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-accent text-white font-semibold py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
