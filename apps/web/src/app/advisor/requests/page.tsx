import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingStatusBadge, EmptyState, List, ListRow, Tabs } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireAdvisor } from "@/lib/auth/advisor";
import { type AdvisorBooking, listAdvisorBookings } from "@/lib/data/bookings";
import { formatDate, formatDateTime } from "@/lib/format";
import { ConfirmedActions, RequestActions } from "./booking-actions";

export const metadata: Metadata = { title: "Requests — InvestKea" };

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="type-h1 text-fg">Requests</h1>
      <Suspense fallback={<PageLoading label="Loading requests" />}>
        <Requests />
      </Suspense>
    </div>
  );
}

function BookingList({
  label,
  bookings,
  empty,
}: {
  label: string;
  bookings: AdvisorBooking[];
  empty: string;
}) {
  if (bookings.length === 0) return <p className="py-6 type-body text-fg-secondary">{empty}</p>;
  return (
    <div className="rounded-lg border border-line bg-surface px-4 shadow-1">
      <List label={label}>
        {bookings.map((b) => (
          <ListRow
            key={b.id}
            title={b.client.name}
            subtitle={
              <span className="block space-y-1">
                <span className="block">
                  {b.topic ?? "Session"} ·{" "}
                  {b.status === "requested"
                    ? `Requested ${formatDate(b.createdAt)}`
                    : formatDateTime(b.startsAt)}
                </span>
                {b.note && <span className="block text-fg">“{b.note}”</span>}
              </span>
            }
            trailing={
              <>
                <BookingStatusBadge status={b.status} />
                {b.status === "requested" && <RequestActions bookingId={b.id} clientName={b.client.name} />}
                {b.status === "confirmed" && <ConfirmedActions bookingId={b.id} clientName={b.client.name} />}
              </>
            }
          />
        ))}
      </List>
    </div>
  );
}

async function Requests() {
  const { supabase, userId } = await requireAdvisor("/advisor/requests", { verified: true });
  const bookings = await listAdvisorBookings(supabase, userId);
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description="When someone asks for a session with you, it will appear here."
      />
    );
  }
  const requested = bookings.filter((b) => b.status === "requested");
  const confirmed = bookings
    .filter((b) => b.status === "confirmed")
    .sort((a, b) => ((a.startsAt ?? "") < (b.startsAt ?? "") ? -1 : 1));
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <Tabs
      label="Booking status"
      items={[
        {
          id: "new",
          label: `New (${requested.length})`,
          content: <BookingList label="New requests" bookings={requested} empty="No new requests." />,
        },
        {
          id: "confirmed",
          label: `Confirmed (${confirmed.length})`,
          content: (
            <BookingList label="Confirmed sessions" bookings={confirmed} empty="No confirmed sessions." />
          ),
        },
        {
          id: "past",
          label: "Past",
          content: <BookingList label="Past sessions" bookings={past} empty="Nothing here yet." />,
        },
      ]}
    />
  );
}
