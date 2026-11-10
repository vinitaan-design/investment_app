import { type NextRequest, NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * Finishes Google sign-in and email magic links (both return a one-time `code`).
 * The destination is always an in-app path.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const providerError = searchParams.get("error_description") ?? searchParams.get("error");

  const toLogin = (reason: string) => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("error", reason);
    return NextResponse.redirect(url);
  };

  if (providerError) {
    console.warn("[auth] provider returned an error", { providerError });
    return toLogin("cancelled");
  }
  if (!code) return toLogin("missing_code");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn("[auth] code exchange failed", { status: error.status, code: error.code });
    return toLogin("expired");
  }

  const destination = request.nextUrl.clone();
  destination.pathname = "/onboarding";
  destination.search = "";
  destination.searchParams.set("next", next);
  return NextResponse.redirect(destination);
}
