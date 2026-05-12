export default function SettingsLoading() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <div className="skeleton h-8 w-36 rounded-lg mb-2" />
        <div className="skeleton h-4 w-48 rounded" />
      </div>
      {/* Profile card skeleton */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-4 w-48 rounded" />
            <div className="skeleton h-4 w-20 rounded-full" />
          </div>
        </div>
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
      {/* Form skeleton */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="skeleton h-5 w-28 rounded mb-4" />
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
      <div className="bg-surface border border-border rounded-xl p-5 mb-4">
        <div className="skeleton h-5 w-36 rounded mb-4" />
        <div className="space-y-3">
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-11 w-full rounded-lg" />
    </div>
  );
}
