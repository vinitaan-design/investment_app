"use client";

import { type NavItem, SideNav } from "@investkea/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** SideNav that knows the current route (client-only: the path is request-time data). */
export function ShellNav({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();
  return <SideNav label={label} items={items} currentPath={pathname} linkComponent={Link} />;
}
