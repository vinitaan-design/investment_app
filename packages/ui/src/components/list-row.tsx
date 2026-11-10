import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export interface ListRowProps {
  /** Avatar or icon. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Amount, badge, or actions on the right. */
  trailing?: ReactNode;
  className?: string;
}

/** One row in a list (transactions, bookings, clients). Use inside <ul role="list">. */
export function ListRow({ leading, title, subtitle, trailing, className }: ListRowProps) {
  return (
    <li className={cn("flex min-h-16 items-center gap-3 py-3", className)}>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate type-body-strong text-fg">{title}</div>
        {subtitle && <div className="type-body-sm text-fg-secondary">{subtitle}</div>}
      </div>
      {trailing && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{trailing}</div>}
    </li>
  );
}

/** Divided list container for ListRow. */
export function List({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    // role="list" keeps list semantics in Safari/VoiceOver when list-style is removed.
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ul role="list" aria-label={label} className={cn("divide-y divide-line", className)}>
      {children}
    </ul>
  );
}
