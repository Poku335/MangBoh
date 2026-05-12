export default function ReaderLoading() {
  return (
    <div className="-mx-4 -my-6 min-h-screen bg-bg pb-12 sm:-mx-6 sm:-my-8 lg:-mx-8">
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
        <div className="h-full w-1/3 bg-accent/40 animate-pulse" />
      </div>

      <main className="mx-auto w-full max-w-[864px] px-3 py-4 sm:px-0">
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="skeleton h-4 w-4 rounded" />
          <div className="skeleton h-4 w-3 rounded" />
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-3 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>

        <div className="overflow-hidden bg-surface border border-border rounded-xl shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="skeleton h-5 w-28 rounded" />
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-5 w-5 rounded" />
              ))}
            </div>
          </div>

          <div className="px-3 py-16 sm:px-8">
            <div className="mb-11 flex flex-col items-center gap-2">
              <div className="skeleton h-8 w-40 rounded" />
              <div className="skeleton h-5 w-28 rounded" />
            </div>
            <div className="mx-auto flex max-w-[760px] flex-col items-center gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton w-full rounded" style={{ aspectRatio: "900/1300" }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
