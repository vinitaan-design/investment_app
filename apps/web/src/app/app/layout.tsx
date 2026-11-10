import { SignedInShell } from "@/components/signed-in-shell";

const items = [
  { href: "/app", label: "Overview" },
  { href: "/app/consultants", label: "Consultants" },
  { href: "/app/bookings", label: "My bookings" },
  { href: "/app/sharing", label: "Data sharing" },
];

export default function UserLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SignedInShell
      navLabel="Your account"
      items={items}
      extraLink={{ href: "/goals", label: "Goal planner" }}
    >
      {children}
    </SignedInShell>
  );
}
