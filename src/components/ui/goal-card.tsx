import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ProgressBar, toPercent } from "@/components/ui/progress-bar";
import { formatINR } from "@/lib/goal-calculator";

export type GoalStatus = "on-track" | "behind" | "achieved";

const statusBadge: Record<GoalStatus, { tone: BadgeTone; label: string }> = {
  "on-track": { tone: "success", label: "On track" },
  behind: { tone: "warning", label: "Needs attention" },
  achieved: { tone: "brand", label: "Reached" },
};

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" });

export interface GoalCardProps {
  title: string;
  saved: number;
  target: number;
  status: GoalStatus;
  /** Date the goal is expected to be reached at the current pace. */
  onTrackDate?: Date | null;
}

export function GoalCard({ title, saved, target, status, onTrackDate }: GoalCardProps) {
  const percent = toPercent(saved, target);
  const badge = statusBadge[status];
  const validDate = onTrackDate && !Number.isNaN(onTrackDate.getTime()) ? onTrackDate : null;

  return (
    <article className="space-y-4 rounded-lg border border-line bg-surface p-5 shadow-1">
      <header className="flex items-start justify-between gap-3">
        <h3 className="type-h4 text-fg">{title}</h3>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </header>
      <div className="flex items-baseline justify-between gap-2">
        <p className="type-numeric text-fg">
          {formatINR(saved)}
          <span className="type-body-sm text-fg-secondary"> of {formatINR(target)}</span>
        </p>
        <p className="type-label text-fg-brand">{percent}%</p>
      </div>
      <ProgressBar value={saved} max={target} label={`${title} progress`} />
      {validDate && status !== "achieved" && (
        <p className="type-caption text-fg-tertiary">On track for {monthYear.format(validDate)}</p>
      )}
    </article>
  );
}
