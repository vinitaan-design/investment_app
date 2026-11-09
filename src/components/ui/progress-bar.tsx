import { cn } from "@/lib/cn";

/** Clamp a value/max pair to a whole-number percentage between 0 and 100. */
export function toPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.round(Math.min(100, Math.max(0, (value / max) * 100)));
}

export interface ProgressBarProps {
  value: number;
  max: number;
  /** Accessible name, e.g. "Emergency fund progress". */
  label: string;
  className?: string;
}

export function ProgressBar({ value, max, label, className }: ProgressBarProps) {
  const percent = toPercent(value, max);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-subtle", className)}
    >
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${percent}%` }} />
    </div>
  );
}
