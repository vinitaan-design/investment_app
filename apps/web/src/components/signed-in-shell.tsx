import { AppShell, type NavItem, SideNav } from "@investkea/ui";
import Link from "next/link";
import { Suspense } from "react";
import { ShellNav } from "./shell-nav";
import { SignOutButton } from "./sign-out-button";

export function SignedInShell({
  navLabel,
  items,
  extraLink,
  children,
}: {
  navLabel: string;
  items: NavItem[];
  extraLink?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <AppShell
      brand={
        <Link href="/" className="type-h3 text-fg-brand">
          InvestKea
        </Link>
      }
      actions={
        <>
          {extraLink && (
            <Link href={extraLink.href} className="type-label text-fg-secondary hover:text-fg-brand">
              {extraLink.label}
            </Link>
          )}
          <SignOutButton />
        </>
      }
      nav={
        // The current path is only known at request time; until then show the nav without a highlight.
        <Suspense fallback={<SideNav label={navLabel} items={items} currentPath="" linkComponent={Link} />}>
          <ShellNav label={navLabel} items={items} />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}
