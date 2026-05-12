"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GENRES = ["Action", "Fantasy", "Romance", "Sci-Fi", "Comedy", "Horror", "Drama", "Slice of Life"];
const STATUSES = ["Ongoing", "Completed", "Hiatus"];
const MANGA_TYPES = [
  { value: "MANHWA", label: "Manhwa" },
  { value: "MANGA", label: "Manga" },
  { value: "MANHUA", label: "Manhua" },
];

export default function NewMangaPage() {
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/manga", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create manga");
      router.push(`/admin/dashboard/manga/${json.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">เพิ่มมังงะใหม่</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Cover upload */}
        <div>
          <label className="block text-sm font-medium mb-2 text-muted">รูปปก</label>
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-44 bg-surface rounded-lg border border-border overflow-hidden flex-shrink-0">
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted text-xs gap-1">
                  <span className="text-3xl">🖼️</span>
                  <span>No cover</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleCoverChange}
                className="block w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-accent file:text-bg file:font-semibold file:cursor-pointer hover:file:bg-accent-hover"
              />
              <p className="text-xs text-muted mt-1">Optional. JPG, PNG, WebP up to 10MB.</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="Manga title"
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5 text-muted">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Synopsis / description..."
            className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent resize-none"
          />
        </div>

        {/* Genre + Status + Type */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted">Genre</label>
            <select
              name="genre"
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted">Status</label>
            <select
              name="status"
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-muted">Type</label>
            <select
              name="type"
              defaultValue="MANHWA"
              className="w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-inset focus:ring-accent focus:border-transparent"
            >
              {MANGA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-bg font-semibold px-6 py-2 rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "กำลังสร้าง..." : "สร้างมังงะ"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-muted text-sm px-4 py-2 hover:text-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
