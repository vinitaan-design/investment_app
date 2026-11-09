import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface EmptyStateProps {
  title: string;
  description: string;
  /** One action, e.g. <Button>Add your first goal</Button>. */
  action?: ReactNode;
  icon?: ReactNode;
  /** Heading level that fits the page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      {icon && (
        <span
          aria-hidden
          className="mb-1 inline-flex size-12 items-center justify-center rounded-full bg-accent-subtle text-fg-accent"
        >
          {icon}
        </span>
      )}
      <Heading className="type-h3 text-fg">{title}</Heading>
      <p className="max-w-sm type-body text-fg-secondary">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
