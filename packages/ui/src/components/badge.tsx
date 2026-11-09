import { cn } from "../lib/cn";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-subtle text-fg-secondary",
  brand: "bg-brand-subtle text-fg-brand",
  success: "bg-success-subtle text-fg-success",
  warning: "bg-warning-subtle text-fg-warning",
  danger: "bg-danger-subtle text-fg-danger",
  info: "bg-info-subtle text-fg-info",
};

export interface BadgeProps {
  tone?: BadgeTone;
  /** Required text: colour is never the only signal. */
  children: string;
  className?: string;
}

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-3 py-1 type-label-sm", tones[tone], className)}
    >
      {children}
    </span>
  );
}
