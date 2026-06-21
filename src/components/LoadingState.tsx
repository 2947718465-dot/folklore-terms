export function LoadingState() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      {/* Header skeleton */}
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[var(--hover)]" />

      {/* Category pills skeleton */}
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-[var(--hover)]" />
        ))}
      </div>

      {/* Card skeletons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
}
