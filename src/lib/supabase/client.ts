import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components. Uses only the public anon key. */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local and fill it in.");
  }
  return createBrowserClient(url, key);
}
