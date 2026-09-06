"use client";

// Browser-side Supabase client — used by client components (sign-in, queries).
// Safe to use the public URL + anon key here; Row Level Security is what
// actually restricts which rows each signed-in user can see or change.
import { createBrowserClient } from "@supabase/ssr";

// One client for the whole tab. Each createBrowserClient() is a separate
// instance with its own in-memory auth state, and they do not learn about a
// fresh sign-in from each other synchronously — so a second instance can fire
// a request with no/stale token and get a 401 right after login. Every caller
// shares this one instead.
let client;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }
  return client;
}
