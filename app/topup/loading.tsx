export default function TopUpLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="skeleton h-9 w-36 rounded-lg mx-auto mb-2" />
        <div className="skeleton h-5 w-56 rounded mx-auto" />
      </div>
      <div className="skeleton h-16 w-full rounded-xl mb-6" />
      {/* Packages skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-2 border-border rounded-xl p-5">
            <div className="text-center space-y-2">
              <div className="skeleton w-12 h-12 rounded-full mx-auto" />
              <div className="skeleton h-8 w-16 rounded mx-auto" />
              <div className="skeleton h-3 w-12 rounded mx-auto" />
              <div className="skeleton h-6 w-20 rounded mx-auto" />
              <div className="skeleton h-4 w-16 rounded mx-auto" />
              <div className="skeleton h-9 w-full rounded-lg mt-2" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton h-32 w-full rounded-xl mb-4" />
      <div className="skeleton h-28 w-full rounded-xl" />
    </div>
  );
}
