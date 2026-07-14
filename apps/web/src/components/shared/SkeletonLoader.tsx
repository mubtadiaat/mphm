"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
    />
  );
}

export function SkeletonLoader({ type = "table" }: { type?: "table" | "cards" | "profile" }) {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 flex flex-col gap-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 flex flex-col md:flex-row gap-6 w-full items-center">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 flex flex-col gap-3 w-full">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  // Default: Table Shimmer Rows
  return (
    <div className="w-full flex flex-col gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex-1"></div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
