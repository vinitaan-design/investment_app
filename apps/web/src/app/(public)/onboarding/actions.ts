"use server";

import { redirect } from "next/navigation";
import { type ActionState, dbFailure, fieldErrorsFrom } from "@/lib/actions";
import { safeNextPath } from "@/lib/auth/safe-next";
import { getProfile, homeFor, requireSession } from "@/lib/auth/session";
import { onboardingSchema } from "@/lib/validation";

export async function completeOnboarding(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    adult: formData.get("adult") ?? undefined,
    privacy: formData.get("privacy") ?? undefined,
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const session = await requireSession("/onboarding");
  const { error } = await session.supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      is_adult_confirmed: true,
      privacy_consent_at: new Date().toISOString(),
    })
    .eq("id", session.userId);
  if (error) return dbFailure("onboarding", error);

  const profile = await getProfile(session);
  redirect(safeNextPath(parsed.data.next, homeFor(profile.role)));
}
