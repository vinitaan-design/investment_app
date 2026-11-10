"use server";

import { revalidatePath } from "next/cache";
import { type ActionState, dbFailure, fieldErrorsFrom } from "@/lib/actions";
import { requireUser } from "@/lib/auth/session";
import { bookingRequestSchema, uuid } from "@/lib/validation";

export async function requestSession(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = bookingRequestSchema.safeParse({
    advisorId: formData.get("advisorId"),
    topic: formData.get("topic") ?? "",
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const { supabase, userId } = await requireUser("/app/consultants");
  if (parsed.data.advisorId === userId) {
    return { status: "error", message: "You can't book a session with yourself." };
  }
  const { error } = await supabase.from("bookings").insert({
    user_id: userId,
    advisor_id: parsed.data.advisorId,
    topic: parsed.data.topic,
    user_note: parsed.data.note ?? null,
  });
  if (error) return dbFailure("request session", error);
  revalidatePath("/app/bookings");
  return { status: "success", message: "Request sent. The consultant will confirm a time with you." };
}

export async function cancelBooking(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = uuid.safeParse(formData.get("bookingId"));
  if (!id.success) return { status: "error", message: "That booking no longer exists." };
  const { supabase, userId } = await requireUser("/app/bookings");
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id.data)
    .eq("user_id", userId)
    .in("status", ["requested", "confirmed"])
    .select("id");
  if (error) return dbFailure("cancel booking", error);
  if (data.length === 0) return { status: "error", message: "This booking can no longer be cancelled." };
  revalidatePath("/app/bookings");
  revalidatePath("/app");
  return { status: "success", message: "Booking cancelled." };
}

/** Turn data sharing with one advisor on or off. Off = revoked immediately. */
export async function setSharing(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const advisor = uuid.safeParse(formData.get("advisorId"));
  const turnOn = formData.get("share") === "on";
  if (!advisor.success) return { status: "error", message: "That consultant no longer exists." };
  const { supabase, userId } = await requireUser("/app/sharing");

  if (!turnOn) {
    const { error } = await supabase
      .from("data_shares")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("advisor_id", advisor.data)
      .is("revoked_at", null);
    if (error) return dbFailure("stop sharing", error);
    revalidatePath("/app/sharing");
    return { status: "success", message: "Sharing stopped. They can no longer see your data." };
  }

  // Re-activate an earlier consent if one exists, otherwise create it.
  const { data: reactivated, error: updateError } = await supabase
    .from("data_shares")
    .update({ revoked_at: null })
    .eq("user_id", userId)
    .eq("advisor_id", advisor.data)
    .select("id");
  if (updateError) return dbFailure("resume sharing", updateError);
  if (reactivated.length === 0) {
    const { error } = await supabase
      .from("data_shares")
      .insert({ user_id: userId, advisor_id: advisor.data });
    if (error) return dbFailure("start sharing", error);
  }
  revalidatePath("/app/sharing");
  return { status: "success", message: "Sharing on. They can now see your goals, cash flow and holdings." };
}
