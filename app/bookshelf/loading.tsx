export default function BookshelfLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-36 rounded-lg mb-2" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 flex gap-4">
            <div className="skeleton w-16 rounded-lg flex-shrink-0" style={{ height: "88px" }} />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
              <div className="flex gap-2 pt-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="skeleton h-7 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
