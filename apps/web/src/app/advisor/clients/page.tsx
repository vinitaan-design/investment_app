import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Avatar, Badge, EmptyState, List, ListRow } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireAdvisor } from "@/lib/auth/advisor";
import { listAdvisorBookings } from "@/lib/data/bookings";
import { activeShareClientIds } from "@/lib/data/shares";
import { summariseClients } from "@/lib/bookings-view";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Clients — InvestKea" };

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="type-h1 text-fg">Clients</h1>
        <p className="type-body-lg text-fg-secondary">
          Everyone who has booked you. You can see a client&apos;s finances only while they share them with
          you.
        </p>
      </header>
      <Suspense fallback={<PageLoading label="Loading clients" />}>
        <Clients />
      </Suspense>
    </div>
  );
}

async function Clients() {
  const { supabase, userId } = await requireAdvisor("/advisor/clients", { verified: true });
  const [bookings, sharing] = await Promise.all([
    listAdvisorBookings(supabase, userId),
    activeShareClientIds(supabase, userId),
  ]);
  const list = summariseClients(bookings);

  if (list.length === 0) {
    return (
      <EmptyState title="No clients yet" description="Clients appear here after they request a session." />
    );
  }
  return (
    <div className="rounded-lg border border-line bg-surface px-4 shadow-1">
      <List label="Clients">
        {list.map((c) => (
          <ListRow
            key={c.id}
            leading={<Avatar name={c.name} decorative />}
            title={
              <Link
                href={`/advisor/clients/${c.id}`}
                className="text-fg-brand underline-offset-2 hover:underline"
              >
                {c.name}
              </Link>
            }
            subtitle={`${c.sessions} ${c.sessions === 1 ? "booking" : "bookings"} · last ${formatDate(c.lastAt)}`}
            trailing={
              sharing.has(c.id) ? (
                <Badge tone="success">Sharing data</Badge>
              ) : (
                <Badge tone="neutral">Not sharing</Badge>
              )
            }
          />
        ))}
      </List>
    </div>
  );
}
