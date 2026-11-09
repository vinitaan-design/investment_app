import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type AlertTone = "info" | "success" | "warning" | "danger";

const toneStyles: Record<AlertTone, { box: string; bar: string; text: string; Icon: LucideIcon }> = {
  info: { box: "bg-info-subtle", bar: "bg-status-info", text: "text-fg-info", Icon: Info },
  success: {
    box: "bg-success-subtle",
    bar: "bg-status-success",
    text: "text-fg-success",
    Icon: CheckCircle2,
  },
  warning: {
    box: "bg-warning-subtle",
    bar: "bg-status-warning",
    text: "text-fg-warning",
    Icon: AlertTriangle,
  },
  danger: { box: "bg-danger-subtle", bar: "bg-status-danger", text: "text-fg-danger", Icon: AlertCircle },
};

export interface AlertProps {
  tone?: AlertTone;
  /** What happened. */
  title: string;
  /** Consequence and next step. */
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { box, bar, text, Icon } = toneStyles[tone];
  // Danger and warning interrupt assistive tech; info and success are polite.
  const role = tone === "danger" || tone === "warning" ? "alert" : "status";
  return (
    <div
      role={role}
      className={cn("relative flex gap-3 overflow-hidden rounded-lg p-4 pl-5", box, className)}
    >
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1", bar)} />
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", text)} />
      <div className="space-y-1">
        <p className={cn("type-body-strong", text)}>{title}</p>
        {children && <div className="type-body-sm text-fg">{children}</div>}
      </div>
    </div>
  );
}
