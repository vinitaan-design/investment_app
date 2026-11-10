import "server-only";
import { redirect } from "next/navigation";
import { type Advisor, getOwnAdvisor } from "@/lib/data/advisors";
import { requireUser } from "./session";

/**
 * Signed-in advisor with their advisor row. With `verified: true`, anyone not yet verified
 * is sent to the dashboard, which explains their status.
 */
export async function requireAdvisor(path: string, { verified }: { verified: boolean }) {
  const ctx = await requireUser(path, ["advisor"]);
  const advisor = await getOwnAdvisor(ctx.supabase, ctx.userId);
  if (!advisor) redirect("/app/become-a-consultant");
  if (verified && advisor.status !== "verified") redirect("/advisor");
  return { ...ctx, advisor: advisor as Advisor };
}
