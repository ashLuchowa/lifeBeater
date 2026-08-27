import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The link in the sign-in email points here with a one-time `code`. We trade
// it for a real session, which gets written into cookies, then send the
// browser back to the dashboard.
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const supabase = createClient();
      const { error } = await withTimeout(
        supabase.auth.exchangeCodeForSession(code),
        8000,
        "exchangeCodeForSession",
      );
      if (!error) {
        return NextResponse.redirect(origin);
      }
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    } catch (err) {
      console.error("[auth/callback] failed:", err.message);
    }
  } else {
    console.error("[auth/callback] hit with no ?code param");
  }

  return NextResponse.redirect(`${origin}?auth_error=1`);
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}
