"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { type ActionState, dbFailure, fieldErrorsFrom } from "@/lib/actions";
import { getProfile, getSession, hasCompletedOnboarding } from "@/lib/auth/session";
import { saveGoalSchema } from "@/lib/validation";

export async function saveGoal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = saveGoalSchema.safeParse({
    name: formData.get("name") ?? "",
    presentCost: formData.get("presentCost"),
    years: formData.get("years"),
    inflation: formData.get("inflation"),
    growth: formData.get("growth"),
    currentSavings: formData.get("currentSavings") || 0,
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the goal details.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const session = await getSession();
  if (!session) redirect("/login?next=%2Fgoals");
  const profile = await getProfile(session);
  if (!hasCompletedOnboarding(profile)) redirect("/onboarding?next=%2Fgoals");

  const g = parsed.data;
  const { error } = await session.supabase.from("goals").insert({
    name: g.name,
    present_cost: g.presentCost,
    target_year: new Date().getFullYear() + Math.max(1, Math.round(g.years)),
    inflation_rate: g.inflation / 100,
    expected_return: g.growth / 100,
    current_savings: g.currentSavings,
  });
  if (error) return dbFailure("save goal", error);
  revalidatePath("/app");
  return { status: "success", message: `“${g.name}” saved to your overview.` };
}
