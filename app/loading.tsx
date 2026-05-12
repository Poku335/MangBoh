export default function HomeLoading() {
  return (
    <div className="space-y-10">
      {/* Search bar */}
      <div className="skeleton h-11 w-full rounded-full" />

      {/* Popular section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-6 w-48 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36">
              <div className="skeleton aspect-[3/4] rounded-xl mb-2" />
              <div className="skeleton h-3 w-full rounded mb-1" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Latest section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-6 w-36 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-36">
              <div className="skeleton aspect-[3/4] rounded-xl mb-2" />
              <div className="skeleton h-3 w-full rounded mb-1" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Rankings */}
      <section>
        <div className="skeleton h-6 w-40 rounded-lg mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="skeleton h-72 rounded-xl" />
          <div className="sm:col-span-1 lg:col-span-2 skeleton h-72 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
