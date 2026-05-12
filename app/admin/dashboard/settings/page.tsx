"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionUser { role?: string }

const ACCENT_THEMES = [
  { name: "Teal Mint",   desc: "สีเดิมของเว็บ",        color: "#61B3AC", tag: "default" },
  { name: "Lavender",    desc: "ม่วงอ่อน",             color: "#9B8EC4", tag: "" },
  { name: "Linear",      desc: "indigo · Linear app",  color: "#5E6AD2", tag: "current" },
  { name: "Discord",     desc: "blurple · Discord",    color: "#5865F2", tag: "" },
  { name: "Twitter / X", desc: "blue · X",             color: "#1D9BF0", tag: "" },
  { name: "Spotify",     desc: "green · Spotify",      color: "#1DB954", tag: "" },
  { name: "MangaDex",    desc: "orange · MangaDex",    color: "#F9731C", tag: "" },
  { name: "Webtoon",     desc: "sky blue · Webtoon",   color: "#00A8FF", tag: "" },
];

const BG_THEMES = [
  { name: "Default",   desc: "สีเดิม (มีม่วงนิดหน่อย)", color: "#16151d", tag: "default" },
  { name: "GitHub",    desc: "GitHub Dark",              color: "#0d1117", tag: "" },
  { name: "VS Code",   desc: "VS Code Dark",             color: "#1e1e1e", tag: "" },
  { name: "Spotify",   desc: "Spotify Dark",             color: "#121212", tag: "" },
  { name: "Discord",   desc: "Discord Dark",             color: "#313338", tag: "current" },
  { name: "Twitter",   desc: "X / Twitter Dim",          color: "#15202b", tag: "" },
  { name: "Dracula",   desc: "Dracula theme",            color: "#282a36", tag: "" },
  { name: "Pure Dark", desc: "ดำสนิท",                  color: "#0a0a0a", tag: "" },
];

function computeHover(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.round(r * 0.82).toString(16).padStart(2, "0")}${Math.round(g * 0.82).toString(16).padStart(2, "0")}${Math.round(b * 0.82).toString(16).padStart(2, "0")}`;
}

function deriveBgPalette(bgHex: string) {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const hex = (v: number) => v.toString(16).padStart(2, "0");
  const mk = (dr: number, dg: number, db: number) =>
    `#${hex(clamp(r + dr))}${hex(clamp(g + dg))}${hex(clamp(b + db))}`;
  return { surface: mk(8, 8, 10), card: mk(15, 15, 18), border: mk(28, 28, 32) };
}

function ThemeGrid({
  themes,
  active,
  onSelect,
}: {
  themes: typeof ACCENT_THEMES;
  active: string;
  onSelect: (c: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {themes.map((t) => {
        const isActive = active.toLowerCase() === t.color.toLowerCase();
        return (
          <button
            key={t.color}
            onClick={() => onSelect(t.color)}
            className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-all ${
              isActive
                ? "border-white/30 bg-white/5 ring-1 ring-white/20"
                : "border-border hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <span className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: t.color }} />
            <span className="min-w-0">
              <span className="flex items-center gap-1 flex-wrap">
                <span className="text-xs font-semibold text-text truncate">{t.name}</span>
                {t.tag === "default" && (
                  <span className="text-[9px] bg-white/10 text-muted px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">เดิม</span>
                )}
                {t.tag === "current" && (
                  <span className="text-[9px] bg-white/10 text-muted px-1.5 py-0.5 rounded-full leading-none flex-shrink-0">ใช้อยู่</span>
                )}
              </span>
              <span className="text-[10px] text-muted truncate block leading-tight mt-0.5">{t.desc}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [color, setColor] = useState("#5E6AD2");
  const [hexInput, setHexInput] = useState("#5E6AD2");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bgColor, setBgColor] = useState("#313338");
  const [bgHexInput, setBgHexInput] = useState("#313338");
  const [bgSaving, setBgSaving] = useState(false);
  const [bgSaved, setBgSaved] = useState(false);

  const user = session?.user as (NonNullable<typeof session>["user"] & SessionUser) | undefined;
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/settings?key=accentColor", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.value) { setColor(d.value); setHexInput(d.value); } })
      .catch(() => {});
    fetch("/api/admin/settings?key=bgColor", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.value) { setBgColor(d.value); setBgHexInput(d.value); } })
      .catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--accent-hover", computeHover(color));
  }, [color]);

  useEffect(() => {
    const p = deriveBgPalette(bgColor);
    document.documentElement.style.setProperty("--bg", bgColor);
    document.documentElement.style.setProperty("--surface", p.surface);
    document.documentElement.style.setProperty("--card", p.card);
    document.documentElement.style.setProperty("--border", p.border);
  }, [bgColor]);

  function applyColor(hex: string) { setColor(hex); setHexInput(hex); }
  function applyBg(hex: string) { setBgColor(hex); setBgHexInput(hex); }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "accentColor", value: color }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  async function handleBgSave() {
    setBgSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "bgColor", value: bgColor }),
      });
      setBgSaved(true);
      setTimeout(() => setBgSaved(false), 2500);
    } finally { setBgSaving(false); }
  }

  if (status === "loading") return <div className="text-center py-12 text-muted">Loading...</div>;
  if (status === "unauthenticated") { router.push("/auth/signin"); return null; }
  if (!isAdmin) return <div className="text-center py-12 text-red-500">Access denied. Admin only.</div>;

  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(hexInput);
  const isValidBgHex = /^#[0-9a-fA-F]{6}$/.test(bgHexInput);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Site Settings</h1>
          <p className="text-muted text-sm mt-0.5">ตั้งค่าการแสดงผลทั่วทั้งเว็บ</p>
        </div>
        <Link
          href="/admin/dashboard"
          className="bg-bg border border-border text-muted text-sm px-4 py-2 rounded-lg hover:text-text transition-colors self-start sm:self-auto"
        >
          ← กลับ Dashboard
        </Link>
      </div>

      {/* Accent Color Card */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-text font-semibold mb-1">สีหลัก (Accent Color)</h2>
        <p className="text-muted text-xs mb-5">สีปุ่ม ลิงก์ และองค์ประกอบหลัก — เปลี่ยนแล้วเห็นผลทันที</p>

        <div className="flex items-center gap-3 mb-5">
          <input
            type="color"
            value={color}
            onChange={(e) => applyColor(e.target.value)}
            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border bg-transparent p-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Hex Code</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => { setHexInput(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setColor(e.target.value); }}
              className={`bg-bg border text-text text-sm px-3 py-2 rounded-lg w-full outline-none font-mono transition-colors ${isValidHex ? "border-border focus:border-accent" : "border-red-500/60"}`}
              placeholder="#9B8EC4"
              maxLength={7}
            />
          </div>
          <div className="w-12 h-12 rounded-xl border border-border flex-shrink-0" style={{ backgroundColor: color }} />
        </div>

        <p className="text-xs text-muted mb-3 font-medium">ธีมสีสำเร็จรูป</p>
        <div className="mb-5">
          <ThemeGrid themes={ACCENT_THEMES} active={color} onSelect={applyColor} />
        </div>

        <div className="bg-bg border border-border rounded-xl p-4 mb-5">
          <p className="text-xs text-muted mb-3 font-medium">Live Preview</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg">ปุ่มหลัก</button>
            <button className="border border-accent text-accent text-sm font-semibold px-4 py-2 rounded-lg bg-transparent">Outline</button>
            <span className="text-accent text-sm font-medium underline cursor-pointer">ลิงก์ / ชื่อตอน</span>
            <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full border border-accent/20">Badge</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !isValidHex}
          className="bg-accent text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />บันทึก...</> : saved ? "✓ บันทึกแล้ว" : "บันทึกสีหลัก"}
        </button>
      </div>

      {/* Background Color Card */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-text font-semibold mb-1">สีพื้นหลัง (Background)</h2>
        <p className="text-muted text-xs mb-5">สี bg, surface, card และ border จะถูกคำนวณจากสีนี้อัตโนมัติ</p>

        <div className="flex items-center gap-3 mb-5">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => applyBg(e.target.value)}
            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border bg-transparent p-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <label className="text-xs text-muted mb-1 block">Hex Code</label>
            <input
              type="text"
              value={bgHexInput}
              onChange={(e) => { setBgHexInput(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBgColor(e.target.value); }}
              className={`bg-bg border text-text text-sm px-3 py-2 rounded-lg w-full outline-none font-mono transition-colors ${isValidBgHex ? "border-border focus:border-accent" : "border-red-500/60"}`}
              placeholder="#16151d"
              maxLength={7}
            />
          </div>
          <div className="w-12 h-12 rounded-xl border border-border flex-shrink-0" style={{ backgroundColor: bgColor }} />
        </div>

        <p className="text-xs text-muted mb-3 font-medium">พื้นหลังจากเว็บดัง</p>
        <div className="mb-5">
          <ThemeGrid themes={BG_THEMES} active={bgColor} onSelect={applyBg} />
        </div>

        {/* BG preview strip */}
        <div className="rounded-xl border border-border overflow-hidden mb-5">
          {(() => {
            const p = deriveBgPalette(bgColor);
            return (
              <div className="flex">
                {[{ label: "bg", c: bgColor }, { label: "surface", c: p.surface }, { label: "card", c: p.card }, { label: "border", c: p.border }].map((s) => (
                  <div key={s.label} className="flex-1 flex flex-col items-center gap-1 py-3" style={{ backgroundColor: s.c }}>
                    <span className="text-[10px] font-mono text-white/60">{s.label}</span>
                    <span className="text-[9px] font-mono text-white/40">{s.c}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <button
          onClick={handleBgSave}
          disabled={bgSaving || !isValidBgHex}
          className="bg-accent text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {bgSaving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />บันทึก...</> : bgSaved ? "✓ บันทึกแล้ว" : "บันทึกสีพื้นหลัง"}
        </button>
      </div>
    </div>
  );
}
