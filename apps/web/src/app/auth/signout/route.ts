import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) console.warn("[auth] sign-out failed", { status: error.status });
  const home = request.nextUrl.clone();
  home.pathname = "/";
  home.search = "";
  // 303 so the browser follows with GET.
  return NextResponse.redirect(home, { status: 303 });
}
