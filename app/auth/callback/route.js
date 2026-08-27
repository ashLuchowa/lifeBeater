import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The link in the sign-in email points here with a one-time `code`. We trade
// it for a real session, which gets written into cookies, then send the
// browser back to the dashboard.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(origin);
    }
  }

  return NextResponse.redirect(`${origin}?auth_error=1`);
}
