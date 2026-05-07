export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-card rounded ${className}`}
      aria-hidden
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg overflow-hidden">
      <Skeleton className="h-44 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BlogRowSkeleton() {
  return (
    <div className="py-5 border-b border-surface-border space-y-2">
      <div className="flex gap-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
