export default function ReferLoading() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-40 rounded-lg mb-2" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="bg-surface border border-border rounded-xl p-6 mb-4">
        <div className="text-center mb-6 space-y-3">
          <div className="skeleton w-16 h-16 rounded-full mx-auto" />
          <div className="skeleton h-6 w-48 rounded mx-auto" />
          <div className="skeleton h-4 w-72 rounded mx-auto" />
        </div>
        <div className="bg-bg rounded-xl p-4 mb-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-5 w-full rounded" />
          ))}
        </div>
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <div className="skeleton h-4 w-40 rounded mx-auto mb-3" />
          <div className="flex gap-2">
            <div className="skeleton flex-1 h-9 rounded-lg" />
            <div className="skeleton w-20 h-9 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
