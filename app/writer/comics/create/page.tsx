"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const MAIN_GENRES = ["Action", "Fantasy", "Romance", "Sci-Fi", "Comedy", "Horror", "Drama", "Slice of Life", "Adventure", "Mystery", "Thriller", "Historical"];
const SUB_GENRES = ["ทั้งหมด", "Isekai", "School Life", "Supernatural", "Mecha", "Sports", "Cooking", "Music"];
const RATINGS = [
  { value: "all", label: "ทุกวัย" },
  { value: "teen", label: "13+ วัยรุ่น" },
  { value: "mature", label: "18+ ผู้ใหญ่" },
];
const CONTENT_TYPES = [
  { value: "comics", label: "การ์ตูน" },
  { value: "novel", label: "นิยาย" },
];
const STORY_TYPES = [
  { value: "original", label: "ต้นฉบับ" },
  { value: "fanfic", label: "แฟนฟิค" },
  { value: "adaptation", label: "ดัดแปลง" },
];
const MANGA_TYPES = [
  { value: "MANHWA", label: "Manhwa" },
  { value: "MANGA", label: "Manga" },
  { value: "MANHUA", label: "Manhua" },
];

export default function CreateComicPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState({ title: 0, altTitle: 0, tagline: 0 });
  const [form, setForm] = useState({
    title: "",
    altTitle: "",
    genre: "",
    subGenre: "",
    rating: "",
    contentType: "comics",
    mangaType: "MANHWA",
    storyType: "original",
    tagline: "",
    description: "",
    status: "Ongoing",
  });

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field in charCount) {
      setCharCount((c) => ({ ...c, [field]: value.length }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("กรุณากรอกชื่อเรื่อง"); return; }
    if (!form.genre) { setError("กรุณาเลือกหมวดหมู่หลัก"); return; }
    if (!form.rating) { setError("กรุณาเลือกระดับเนื้อหา"); return; }
    if (!form.contentType) { setError("กรุณาเลือกประเภทเนื้อหา"); return; }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("title", form.title);
    data.append("altTitle", form.altTitle);
    data.append("description", form.description || form.tagline || "");
    data.append("genre", form.genre);
    data.append("subGenre", form.subGenre);
    data.append("rating", form.rating);
    data.append("contentType", form.contentType);
    data.append("type", form.mangaType);
    data.append("status", form.status);
    if (coverFile) data.append("coverImage", coverFile);

    try {
      const res = await fetch("/api/manga", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "ไม่สามารถสร้างการ์ตูนได้");
      router.push(`/writer/comics/${json.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  return (
    <div className="p-6 text-text">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted mb-5 flex items-center gap-1.5">
        <Link href="/writer/comics" className="hover:text-accent transition-colors">การ์ตูนของฉัน</Link>
        <span>›</span>
        <span className="text-text">เพิ่มการ์ตูนใหม่</span>
      </nav>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6">
          {/* Cover image upload */}
          <div className="flex-shrink-0">
            <div
              className="w-44 h-60 bg-bg border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-accent transition-colors relative flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
              ) : (
                <>
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-muted mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  <p className="text-xs text-muted font-medium">อัพโหลดรูปปก</p>
                  <p className="text-[10px] text-muted/70 text-center mt-1 px-2">
                    ไฟล์นามสกุล .jpg .jpeg .png .webp<br />ขนาดไม่เกิน 2MB<br />(500x700 px)
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>

          {/* Form fields */}
          <div className="flex-1 space-y-4">
            {/* Title row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-text">ชื่อเรื่อง<span className="text-red-400 ml-0.5">*</span></label>
                  <span className="text-xs text-muted">{charCount.title}/120</span>
                </div>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  maxLength={120}
                  placeholder="ชื่อเรื่อง"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-text flex items-center gap-1">
                    ชื่อเรื่องต้นฉบับ
                    <span className="text-muted cursor-help" title="ชื่อในภาษาต้นฉบับ">ⓘ</span>
                  </label>
                  <span className="text-xs text-muted">{charCount.altTitle}/120</span>
                </div>
                <input
                  value={form.altTitle}
                  onChange={(e) => set("altTitle", e.target.value)}
                  maxLength={120}
                  placeholder="ชื่อเรื่องต้นฉบับ"
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories row */}
            <div className="grid grid-cols-6 gap-3">
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  หมวดหมู่หลัก<span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={form.genre}
                  onChange={(e) => set("genre", e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                >
                  <option value="">เลือกหมวดหมู่หลัก</option>
                  {MAIN_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">หมวดหมู่รอง</label>
                <select
                  value={form.subGenre}
                  onChange={(e) => set("subGenre", e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                >
                  <option value="">เลือกหมวดหมู่รอง</option>
                  {SUB_GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  ระดับเนื้อหา<span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                >
                  <option value="">เลือกระดับเนื้อหา</option>
                  {RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  ประเภทเนื้อหา<span className="text-red-400 ml-0.5">*</span>
                </label>
                <select
                  value={form.contentType}
                  onChange={(e) => set("contentType", e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                >
                  {CONTENT_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">ประเภทเรื่อง</label>
                <select
                  value={form.storyType}
                  onChange={(e) => set("storyType", e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                >
                  {STORY_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">ประเภทมังงะ</label>
                <select
                  value={form.mangaType}
                  onChange={(e) => set("mangaType", e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
                >
                  {MANGA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-text flex items-center gap-1">
                  คำโปรย
                  <span className="text-muted cursor-help" title="ประโยคสั้นๆ ดึงดูดผู้อ่าน">ⓘ</span>
                </label>
                <span className="text-xs text-muted">{charCount.tagline}/200</span>
              </div>
              <textarea
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                maxLength={200}
                placeholder="คำโปรย"
                rows={2}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-text mb-2">
            ข้อมูลเนื้อเรื่อง/แนะนำเรื่อง/เรื่องย่อ
          </label>
          <div className="border border-border rounded-t-lg bg-surface px-3 py-2 flex items-center gap-1 flex-wrap">
            {["B", "U", "I", "S"].map((btn) => (
              <button key={btn} type="button" className="w-7 h-7 text-xs font-bold text-muted hover:bg-border rounded transition-colors">
                {btn === "B" ? <strong>B</strong> : btn === "U" ? <u>U</u> : btn === "I" ? <em>I</em> : <s>S</s>}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <button type="button" className="w-7 h-7 text-xs text-muted hover:bg-border rounded transition-colors">A</button>
            <button type="button" className="w-7 h-7 text-xs text-muted hover:bg-border rounded transition-colors">—</button>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="พิมพ์เนื้อหาตรงนี้"
            rows={8}
            className="w-full bg-bg border border-border border-t-0 rounded-b-lg px-3 py-3 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit buttons */}
        <div className="mt-6 flex gap-3 justify-end">
          <Link
            href="/writer/comics"
            className="px-6 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-bg transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังบันทึก..." : "บันทึกและดำเนินการต่อ"}
          </button>
        </div>
      </form>
    </div>
  );
}
