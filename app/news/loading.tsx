export default function NewsLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-44 rounded-lg mb-2" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="skeleton h-5 w-20 rounded-full" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-5 w-3/4 rounded mb-2" />
            <div className="skeleton h-4 w-full rounded mb-1" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
