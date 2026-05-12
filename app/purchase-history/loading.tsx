export default function PurchaseHistoryLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-44 rounded-lg mb-2" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 flex gap-3 items-center">
            <div className="skeleton w-10 flex-shrink-0 rounded" style={{ height: "56px" }} />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
            <div className="skeleton h-5 w-14 rounded flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
