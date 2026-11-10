"use server";

import { revalidatePath } from "next/cache";
import { type ActionState, dbFailure, fieldErrorsFrom } from "@/lib/actions";
import { requireAdvisor } from "@/lib/auth/advisor";
import type { Enums } from "@/lib/supabase/database.types";
import { confirmBookingSchema, uuid } from "@/lib/validation";

function refresh() {
  revalidatePath("/advisor");
  revalidatePath("/advisor/requests");
  revalidatePath("/advisor/clients");
}

export async function confirmBooking(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = confirmBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
    startsAt: formData.get("startsAt") || undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const { supabase, userId } = await requireAdvisor("/advisor/requests", { verified: true });
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "confirmed", starts_at: parsed.data.startsAt })
    .eq("id", parsed.data.bookingId)
    .eq("advisor_id", userId)
    .eq("status", "requested")
    .select("id");
  if (error) return dbFailure("confirm booking", error);
  if (data.length === 0)
    return { status: "error", message: "This request was already answered or cancelled." };
  refresh();
  return { status: "success", message: "Session confirmed." };
}

/** Decline a request, cancel a confirmed session, or mark it completed. */
export async function updateBookingStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuid.safeParse(formData.get("bookingId"));
  const to = formData.get("to");
  const allowedFrom: Partial<Record<Enums<"booking_status">, Enums<"booking_status">[]>> = {
    cancelled: ["requested", "confirmed"],
    completed: ["confirmed"],
  };
  if (!id.success || (to !== "cancelled" && to !== "completed")) {
    return { status: "error", message: "That change isn't possible." };
  }
  const { supabase, userId } = await requireAdvisor("/advisor/requests", { verified: true });
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: to })
    .eq("id", id.data)
    .eq("advisor_id", userId)
    .in("status", allowedFrom[to]!)
    .select("id");
  if (error) return dbFailure("update booking", error);
  if (data.length === 0)
    return { status: "error", message: "This booking has already changed. Refresh to see it." };
  refresh();
  return { status: "success", message: to === "completed" ? "Marked as completed." : "Booking cancelled." };
}
