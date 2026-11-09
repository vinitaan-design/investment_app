import { Badge, type BadgeTone } from "./badge";

export type BookingStatus = "requested" | "confirmed" | "completed" | "cancelled";

/** Matches the booking_status enum in supabase/migrations/0001_init.sql. */
export const bookingStatusDisplay: Record<BookingStatus, { label: string; tone: BadgeTone }> = {
  requested: { label: "Requested", tone: "info" },
  confirmed: { label: "Confirmed", tone: "success" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const { label, tone } = bookingStatusDisplay[status];
  return (
    <Badge tone={tone} className={className}>
      {label}
    </Badge>
  );
}
