import "server-only";
import type { Tables } from "@/lib/supabase/database.types";
import type { DbClient } from "@/lib/supabase/types";
import { loadError } from "./advisors";

export type Goal = Tables<"goals">;
export type LedgerEntry = Tables<"ledger_entries">;
export type Holding = Tables<"holdings">;

export interface FinancialSnapshot {
  goals: Goal[];
  ledger: LedgerEntry[];
  holdings: Holding[];
}

/**
 * A person's goals, recent cash flow and holdings. Called for the user themself or by an
 * advisor; RLS returns rows only to the owner or a consented, verified advisor.
 */
export async function loadSnapshot(db: DbClient, userId: string): Promise<FinancialSnapshot> {
  const [goals, ledger, holdings] = await Promise.all([
    db.from("goals").select("*").eq("user_id", userId).order("target_year"),
    db
      .from("ledger_entries")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_on", { ascending: false })
      .limit(50),
    db.from("holdings").select("*").eq("user_id", userId).order("current_value", { ascending: false }),
  ]);
  if (goals.error) throw loadError("goals", goals.error);
  if (ledger.error) throw loadError("cash flow", ledger.error);
  if (holdings.error) throw loadError("holdings", holdings.error);
  return { goals: goals.data, ledger: ledger.data, holdings: holdings.data };
}

export async function listGoals(db: DbClient, userId: string): Promise<Goal[]> {
  const { data, error } = await db.from("goals").select("*").eq("user_id", userId).order("target_year");
  if (error) throw loadError("goals", error);
  return data;
}
