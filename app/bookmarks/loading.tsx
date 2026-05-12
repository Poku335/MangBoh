export default function BookmarksLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-32 rounded-lg mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid gap-4 rounded-3xl border border-border bg-surface p-4 sm:grid-cols-[auto_1fr_auto] items-center">
            <div className="skeleton w-24 h-32 sm:h-28 rounded-3xl flex-shrink-0" />
            <div className="space-y-2">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/4 rounded" />
            </div>
            <div className="skeleton w-8 h-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
