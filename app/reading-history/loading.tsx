export default function ReadingHistoryLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-48 rounded-lg mb-2" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-border bg-surface p-4">
            <div className="flex gap-4 items-center">
              <div className="skeleton w-20 h-28 rounded-3xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/3 rounded" />
              </div>
              <div className="text-right space-y-1 flex-shrink-0">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
