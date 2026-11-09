import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "../lib/cn";

export interface StatTrend {
  direction: "up" | "down" | "flat";
  /** Required words, e.g. "₹4,000 more than last month". The arrow is decorative. */
  text: string;
  /** Whether this change is good for the user. Controls colour only. */
  sentiment?: "positive" | "negative" | "neutral";
}

export interface StatCardProps {
  label: string;
  /** Pre-formatted value, e.g. formatINR(125000). */
  value: string;
  /** Context such as "as of 10 Nov" or "this month". */
  context?: string;
  trend?: StatTrend;
  className?: string;
}

const icons = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight };
const sentimentColour = {
  positive: "text-fg-success",
  negative: "text-fg-warning", // muted amber: no alarm red for money changes
  neutral: "text-fg-secondary",
};

export function StatCard({ label, value, context, trend, className }: StatCardProps) {
  const Icon = trend ? icons[trend.direction] : null;
  return (
    <div className={cn("space-y-1 rounded-lg border border-line bg-surface p-5 shadow-1", className)}>
      <p className="type-body-sm text-fg-secondary">{label}</p>
      <p className="type-numeric-hero text-fg">{value}</p>
      {context && <p className="type-caption text-fg-tertiary">{context}</p>}
      {trend && Icon && (
        <p
          className={cn(
            "flex items-center gap-1 type-body-sm",
            sentimentColour[trend.sentiment ?? "neutral"],
          )}
        >
          <Icon aria-hidden className="size-4" />
          {trend.text}
        </p>
      )}
    </div>
  );
}
