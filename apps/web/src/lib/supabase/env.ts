/** Public Supabase settings. Both values are safe to expose; RLS protects data. */
export function supabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Copy apps/web/.env.example to apps/web/.env.local and fill it in.",
    );
  }
  return { url, key };
}
