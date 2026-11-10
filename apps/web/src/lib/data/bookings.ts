import "server-only";
import type { Enums } from "@/lib/supabase/database.types";
import type { DbClient } from "@/lib/supabase/types";
import { loadError } from "./advisors";

export type BookingStatus = Enums<"booking_status">;

export interface UserBooking {
  id: string;
  status: BookingStatus;
  startsAt: string | null;
  topic: string | null;
  createdAt: string;
  advisor: { id: string; name: string; credential: string };
}

export interface AdvisorBooking {
  id: string;
  status: BookingStatus;
  startsAt: string | null;
  topic: string | null;
  note: string | null;
  createdAt: string;
  client: { id: string; name: string };
}

/** Bookings the signed-in user made, newest first. */
export async function listUserBookings(db: DbClient, userId: string): Promise<UserBooking[]> {
  const { data, error } = await db
    .from("bookings")
    .select("id, status, starts_at, topic, created_at, advisor:advisors(id, display_name, credential_type)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw loadError("your bookings", error);
  return data.map((b) => ({
    id: b.id,
    status: b.status,
    startsAt: b.starts_at,
    topic: b.topic,
    createdAt: b.created_at,
    advisor: {
      id: b.advisor?.id ?? "",
      name: b.advisor?.display_name ?? "Consultant no longer listed",
      credential: b.advisor?.credential_type ?? "",
    },
  }));
}

/** Bookings addressed to the signed-in advisor, newest first. */
export async function listAdvisorBookings(db: DbClient, advisorId: string): Promise<AdvisorBooking[]> {
  const { data, error } = await db
    .from("bookings")
    .select(
      "id, status, starts_at, topic, user_note, created_at, client:profiles!bookings_user_id_fkey(id, full_name)",
    )
    .eq("advisor_id", advisorId)
    .order("created_at", { ascending: false });
  if (error) throw loadError("requests", error);
  return data.map((b) => ({
    id: b.id,
    status: b.status,
    startsAt: b.starts_at,
    topic: b.topic,
    note: b.user_note,
    createdAt: b.created_at,
    client: { id: b.client?.id ?? "", name: b.client?.full_name?.trim() || "Client" },
  }));
}
