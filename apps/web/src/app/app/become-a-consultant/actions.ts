"use server";

import { redirect } from "next/navigation";
import { type ActionState, dbFailure, fieldErrorsFrom } from "@/lib/actions";
import { requireUser } from "@/lib/auth/session";
import { advisorApplicationSchema, parseLanguages } from "@/lib/validation";

export async function applyAsAdvisor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = advisorApplicationSchema.safeParse({
    displayName: formData.get("displayName") ?? "",
    credentialType: formData.get("credentialType") ?? "",
    registrationNumber: formData.get("registrationNumber") ?? "",
    bio: formData.get("bio") || undefined,
    languages: formData.get("languages") || undefined,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }
  const { supabase, userId } = await requireUser("/app/become-a-consultant");
  const { error } = await supabase.from("advisors").insert({
    id: userId,
    display_name: parsed.data.displayName,
    credential_type: parsed.data.credentialType,
    registration_number: parsed.data.registrationNumber,
    bio: parsed.data.bio ?? null,
    languages: parseLanguages(parsed.data.languages),
  });
  if (error?.code === "23505") redirect("/advisor");
  if (error) return dbFailure("advisor application", error);
  redirect("/advisor");
}
