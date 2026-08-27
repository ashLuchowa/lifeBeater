"use client";

// Browser-side Supabase client — used by client components (sign-in, queries).
// Safe to use the public URL + anon key here; Row Level Security is what
// actually restricts which rows each signed-in user can see or change.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
