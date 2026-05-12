"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const GENRES = ["Action", "Fantasy", "Romance", "Sci-Fi", "Comedy", "Horror", "Drama", "Slice of Life", "Manhwa", "Manhua"];
const STATUSES = ["Ongoing", "Completed", "Hiatus"];
const RATINGS = [
  { value: "all", label: "ทุกวัย (All Ages)" },
  { value: "teen", label: "วัยรุ่น 13+ (Teen)" },
  { value: "mature", label: "ผู้ใหญ่ 18+ (Mature)" },
];
const CONTENT_TYPES = [
  { value: "comics", label: "การ์ตูน / มังงะ" },
  { value: "novel", label: "นิยาย" },
];

interface MangaData {
  id: number;
  title: string;
  altTitle: string | null;
  description: string;
  coverImage: string | null;
  genre: string;
  subGenre: string | null;
  status: string;
  contentType: string;
  rating: string;
}

export default function EditMangaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [manga, setManga] = useState<MangaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    altTitle: "",
    description: "",
    genre: "Action",
    subGenre: "",
    status: "Ongoing",
    contentType: "comics",
    rating: "all",
  });

  useEffect(() => {
    fetch(`/api/writer/comics/${params.id}`)
      .then((r) => {
        if (!r.ok) { router.push("/writer/comics"); return null; }
        return r.json();
      })
      .then((data: MangaData | null) => {
        if (!data) return;
        setManga(data);
        setForm({
          title: data.title,
          altTitle: data.altTitle ?? "",
          description: data.description,
          genre: data.genre,
          subGenre: data.subGenre ?? "",
          status: data.status,
          contentType: data.contentType,
          rating: data.rating,
        });
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("กรุณากรอกชื่อเรื่องและคำอธิบาย");
      return;
    }
    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverFile) fd.append("coverImage", coverFile);

    const res = await fetch(`/api/writer/comics/${params.id}`, { method: "PATCH", body: fd });
    if (res.ok) {
      router.push(`/writer/comics/${params.id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "เกิดข้อผิดพลาด");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!manga) return null;

  const displayCover = coverPreview ?? manga.coverImage;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <nav className="text-sm text-gray-500 mb-5 flex items-center gap-1.5">
        <Link href="/writer/comics" className="hover:text-purple-600 transition-colors">การ์ตูนของฉัน</Link>
        <span>›</span>
        <Link href={`/writer/comics/${params.id}`} className="hover:text-purple-600 transition-colors truncate max-w-[120px]">
          {manga.title}
        </Link>
        <span>›</span>
        <span className="text-gray-800">แก้ไข</span>
      </nav>

      <h1 className="text-xl font-bold text-gray-800 mb-6">แก้ไขข้อมูลการ์ตูน</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover image */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">ปกการ์ตูน</label>
          <div className="flex items-start gap-4">
            <div
              className="w-24 h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => fileRef.current?.click()}
            >
              {displayCover ? (
                <Image src={displayCover} alt="ปก" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">ปก</span>
                </div>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
              >
                เปลี่ยนรูปปก
              </button>
              <p className="text-xs text-gray-400 mt-2">รองรับ JPG, PNG, WEBP (แนะนำ 2:3)</p>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-700">ข้อมูลพื้นฐาน</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อเรื่อง <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-colors"
              placeholder="ชื่อเรื่อง"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อต้นฉบับ</label>
            <input
              value={form.altTitle}
              onChange={(e) => setForm((f) => ({ ...f, altTitle: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-colors"
              placeholder="ชื่อภาษาอื่น (ถ้ามี)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย <span className="text-red-500">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 resize-none transition-colors"
              placeholder="เนื้อเรื่องย่อ"
              required
            />
          </div>
        </div>

        {/* Category & Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-700">หมวดหมู่และสถานะ</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทเนื้อหา</label>
              <select
                value={form.contentType}
                onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
              >
                {CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select
                value={form.genre}
                onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
              >
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เรตติ้ง</label>
              <select
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 transition-colors"
              >
                {RATINGS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#7c3aed] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#6d28d9] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
          <Link
            href={`/writer/comics/${params.id}`}
            className="px-5 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:border-gray-400 transition-colors text-center"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
