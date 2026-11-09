import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components. Uses the public publishable key; RLS protects data. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Copy apps/web/.env.example to apps/web/.env.local and fill it in.",
    );
  }
  return createBrowserClient(url, key);
}
