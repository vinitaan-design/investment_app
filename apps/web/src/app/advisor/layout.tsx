import { SignedInShell } from "@/components/signed-in-shell";

const items = [
  { href: "/advisor", label: "Dashboard" },
  { href: "/advisor/requests", label: "Requests" },
  { href: "/advisor/clients", label: "Clients" },
];

export default function AdvisorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SignedInShell navLabel="Advisor portal" items={items} extraLink={{ href: "/app", label: "My account" }}>
      {children}
    </SignedInShell>
  );
}
