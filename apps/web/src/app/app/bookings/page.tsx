import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BookingStatusBadge, EmptyState, List, ListRow, buttonClasses } from "@investkea/ui";
import { PageLoading } from "@/components/page-loading";
import { requireUser } from "@/lib/auth/session";
import { listUserBookings } from "@/lib/data/bookings";
import { formatDate, formatDateTime } from "@/lib/format";
import { CancelBookingButton } from "./cancel-booking";

export const metadata: Metadata = { title: "My bookings — InvestKea" };

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="type-h1 text-fg">My bookings</h1>
      <Suspense fallback={<PageLoading label="Loading your bookings" />}>
        <Bookings />
      </Suspense>
    </div>
  );
}

async function Bookings() {
  const { supabase, userId } = await requireUser("/app/bookings");
  const bookings = await listUserBookings(supabase, userId);
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        description="When you request a session with a consultant, it will appear here."
        action={
          <Link href="/app/consultants" className={buttonClasses("primary", "md")}>
            Find a consultant
          </Link>
        }
      />
    );
  }
  return (
    <div className="rounded-lg border border-line bg-surface px-4 shadow-1">
      <List label="Bookings">
        {bookings.map((b) => (
          <ListRow
            key={b.id}
            title={`${b.advisor.name}${b.advisor.credential ? ` · ${b.advisor.credential}` : ""}`}
            subtitle={
              <>
                {b.topic ?? "Session"} ·{" "}
                {b.status === "requested"
                  ? `Requested ${formatDate(b.createdAt)}`
                  : formatDateTime(b.startsAt)}
              </>
            }
            trailing={
              <>
                <BookingStatusBadge status={b.status} />
                {(b.status === "requested" || b.status === "confirmed") && (
                  <CancelBookingButton bookingId={b.id} advisorName={b.advisor.name} />
                )}
              </>
            }
          />
        ))}
      </List>
    </div>
  );
}
