import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { DbClient } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;
export type AppRole = Profile["role"];

export interface SessionContext {
  supabase: DbClient;
  userId: string;
  email: string | null;
}

/**
 * The signed-in user, verified with getClaims() (JWT signature checked against the
 * project's keys). Never getSession(): its user object comes from a spoofable cookie.
 */
export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  return { supabase, userId: data.claims.sub, email };
}

export async function requireSession(nextPath: string): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return session;
}

/** Role and consent come only from the database row, never from token metadata. */
export async function getProfile(ctx: SessionContext): Promise<Profile> {
  const { data, error } = await ctx.supabase.from("profiles").select("*").eq("id", ctx.userId).single();
  if (error || !data) {
    console.error("[auth] profile lookup failed", { userId: ctx.userId, code: error?.code });
    throw new Error("We couldn't load your account. Please sign in again.");
  }
  return data;
}

export function hasCompletedOnboarding(profile: Profile): boolean {
  return profile.is_adult_confirmed && profile.privacy_consent_at !== null;
}

/** Home screen for a role. */
export function homeFor(role: AppRole): string {
  return role === "advisor" ? "/advisor" : "/app";
}

/** Signed in + onboarded. Optionally restricted to roles. */
export async function requireUser(
  nextPath: string,
  roles?: AppRole[],
): Promise<SessionContext & { profile: Profile }> {
  const ctx = await requireSession(nextPath);
  const profile = await getProfile(ctx);
  if (!hasCompletedOnboarding(profile)) redirect(`/onboarding?next=${encodeURIComponent(nextPath)}`);
  if (roles && !roles.includes(profile.role)) redirect(homeFor(profile.role));
  return { ...ctx, profile };
}
