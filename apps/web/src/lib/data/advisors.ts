import "server-only";
import type { Tables } from "@/lib/supabase/database.types";
import type { DbClient } from "@/lib/supabase/types";

export type Advisor = Tables<"advisors">;

/** Verified advisors only (RLS also hides unverified ones from non-owners). */
export async function listVerifiedAdvisors(db: DbClient): Promise<Advisor[]> {
  const { data, error } = await db
    .from("advisors")
    .select("*")
    .eq("status", "verified")
    .order("display_name");
  if (error) throw loadError("advisors", error);
  return data;
}

export async function getOwnAdvisor(db: DbClient, userId: string): Promise<Advisor | null> {
  const { data, error } = await db.from("advisors").select("*").eq("id", userId).maybeSingle();
  if (error) throw loadError("own advisor", error);
  return data;
}

export function loadError(what: string, error: { code?: string; message?: string }): Error {
  console.error(`[db] loading ${what} failed`, { code: error.code, message: error.message });
  return new Error(`We couldn't load ${what}. Please refresh the page.`);
}
