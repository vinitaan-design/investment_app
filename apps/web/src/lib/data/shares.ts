import "server-only";
import type { DbClient } from "@/lib/supabase/types";
import { loadError } from "./advisors";

/** Advisor ids the user currently shares data with. */
export async function activeShareAdvisorIds(db: DbClient, userId: string): Promise<Set<string>> {
  const { data, error } = await db
    .from("data_shares")
    .select("advisor_id")
    .eq("user_id", userId)
    .is("revoked_at", null);
  if (error) throw loadError("sharing settings", error);
  return new Set(data.map((s) => s.advisor_id));
}

/** Client ids currently sharing with this advisor. */
export async function activeShareClientIds(db: DbClient, advisorId: string): Promise<Set<string>> {
  const { data, error } = await db
    .from("data_shares")
    .select("user_id")
    .eq("advisor_id", advisorId)
    .is("revoked_at", null);
  if (error) throw loadError("sharing status", error);
  return new Set(data.map((s) => s.user_id));
}
