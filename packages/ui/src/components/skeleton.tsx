import { cn } from "../lib/cn";

export interface SkeletonProps {
  variant?: "text" | "card" | "row";
  /** Number of text lines (text variant). */
  lines?: number;
  className?: string;
}

/**
 * Loading placeholder. Hidden from assistive tech: put aria-busy="true" on the region
 * being loaded so screen readers know content is coming. Pulse is skipped when the
 * user prefers reduced motion.
 */
export function Skeleton({ variant = "text", lines = 3, className }: SkeletonProps) {
  const block = "rounded-sm bg-subtle motion-safe:animate-pulse";
  if (variant === "card") {
    return (
      <div aria-hidden className={cn("h-32 rounded-lg bg-subtle motion-safe:animate-pulse", className)} />
    );
  }
  if (variant === "row") {
    return (
      <div aria-hidden className={cn("flex items-center gap-3 py-3", className)}>
        <div className="size-10 rounded-full bg-subtle motion-safe:animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className={cn(block, "h-4 w-1/2")} />
          <div className={cn(block, "h-3 w-1/3")} />
        </div>
        <div className={cn(block, "h-4 w-16")} />
      </div>
    );
  }
  const count = Math.max(1, Math.floor(lines));
  return (
    <div aria-hidden className={cn("space-y-2", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn(block, "h-4", i === count - 1 && count > 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}
