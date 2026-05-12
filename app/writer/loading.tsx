export default function WriterLoading() {
  return (
    <div className="p-6">
      <div className="h-7 w-48 bg-surface animate-pulse rounded-lg mb-6" />
      <div className="bg-surface border border-border rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-32 bg-bg animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="bg-bg border-b border-border px-4 py-3 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-20 bg-surface animate-pulse rounded" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="w-10 h-14 bg-surface animate-pulse rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-surface animate-pulse rounded" />
              <div className="h-3 w-24 bg-surface animate-pulse rounded" />
            </div>
            <div className="h-6 w-16 bg-surface animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
