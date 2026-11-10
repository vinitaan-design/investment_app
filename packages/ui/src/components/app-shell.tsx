import type { ComponentType, ReactNode } from "react";
import { cn } from "../lib/cn";

/** Minimal props a link component must accept (works with Next.js <Link> or <a>). */
export interface LinkLikeProps {
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  /** Small count shown after the label, e.g. open requests. */
  count?: number;
}

export interface SideNavProps {
  /** Accessible name, e.g. "Advisor portal". */
  label: string;
  items: NavItem[];
  /** Path of the current page; the matching item (or its parent) is marked current. */
  currentPath: string;
  linkComponent?: ComponentType<LinkLikeProps>;
  className?: string;
}

/** True when `path` is `href` or a page beneath it (but "/app" doesn't match "/apple"). */
export function isActivePath(href: string, path: string): boolean {
  return path === href || path.startsWith(href.endsWith("/") ? href : `${href}/`);
}

/** Index of the most specific matching item, so "/advisor" isn't current on "/advisor/clients". */
export function activeIndex(items: NavItem[], path: string): number {
  let best = -1;
  items.forEach((item, i) => {
    if (isActivePath(item.href, path) && (best === -1 || item.href.length > items[best].href.length)) {
      best = i;
    }
  });
  return best;
}

function DefaultLink({ href, children, ...rest }: LinkLikeProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/**
 * Vertical navigation on wide screens; a horizontally scrolling row on phones.
 * The current page is marked with aria-current and a weight + bar, not colour alone.
 */
export function SideNav({ label, items, currentPath, linkComponent, className }: SideNavProps) {
  const Link = linkComponent ?? DefaultLink;
  const current = activeIndex(items, currentPath);
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {items.map((item, i) => {
          const isCurrent = i === current;
          const hasCount = item.count !== undefined && item.count > 0;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={hasCount ? `${item.label} (${item.count} pending)` : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-md px-3 transition-colors focus-visible:shadow-focus",
                  isCurrent
                    ? "bg-brand-subtle type-label text-fg-brand"
                    : "type-body text-fg-secondary hover:bg-subtle hover:text-fg",
                )}
              >
                {isCurrent && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand md:inset-x-auto md:inset-y-2 md:left-0 md:h-auto md:w-1"
                  />
                )}
                {item.icon && (
                  <span aria-hidden className="inline-flex size-5 shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="whitespace-nowrap">{item.label}</span>
                {hasCount && (
                  <>
                    <span
                      aria-hidden
                      className="ml-auto rounded-full bg-surface px-2 type-label-sm text-fg-brand"
                    >
                      {item.count}
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface AppShellProps {
  /** Brand/home link and anything else on the left of the top bar. */
  brand: ReactNode;
  /** Right side of the top bar: account menu, sign out. */
  actions?: ReactNode;
  nav: ReactNode;
  children: ReactNode;
}

/** Signed-in layout: top bar, navigation, and the main content region. */
export function AppShell({ brand, actions, nav, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-6">
          {brand}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 md:grid-cols-[13rem_1fr] md:px-6 md:py-8">
        <div className="md:sticky md:top-8 md:self-start">{nav}</div>
        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
