export default function MangaLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface border border-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6">
        <div className="skeleton w-44 h-60 rounded-xl mx-auto sm:mx-0 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-7 w-2/3 rounded-lg" />
          <div className="flex gap-2">
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-24 rounded-full" />
          </div>
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="flex gap-4 pt-1">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="skeleton h-9 w-28 rounded-full" />
            <div className="skeleton h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
