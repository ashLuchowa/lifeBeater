"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const card = { width: "min(360px, 100%)", background: "#eef4e8", borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 16 };
const label = { fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#14150f" };
const sub = { fontSize: 12.5, fontWeight: 600, color: "#8a8f83", marginTop: 4 };
const input = {
  border: "1px solid #d7ddcf",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
  color: "#14150f",
};
const primaryBtn = (busy) => ({
  padding: "10px 14px",
  borderRadius: 999,
  border: "1px solid #14150f",
  background: "#14150f",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: busy ? "default" : "pointer",
  opacity: busy ? 0.6 : 1,
});
const linkBtn = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: 11.5,
  fontWeight: 700,
  color: "#14150f",
  textDecoration: "underline",
  cursor: "pointer",
  alignSelf: "flex-start",
};

export default function LoginScreen() {
  const [mode, setMode] = useState("signin"); // signin | forgot | forgot-sent
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    // On success, AuthProvider's onAuthStateChange picks up the session automatically.
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
    } else {
      setMode("forgot-sent");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#6e6e6e", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={card}>
        {mode === "signin" && (
          <>
            <div>
              <div style={label}>Sign in</div>
              <div style={sub}>Your dashboard, just for you.</div>
            </div>
            <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={input} />
              <button type="submit" disabled={busy} style={primaryBtn(busy)}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
              {error && <div style={{ fontSize: 11.5, fontWeight: 600, color: "#dd6f74" }}>{error}</div>}
              <button type="button" style={linkBtn} onClick={() => { setMode("forgot"); setError(""); }}>
                Forgot password?
              </button>
            </form>
          </>
        )}

        {mode === "forgot" && (
          <>
            <div>
              <div style={label}>Reset password</div>
              <div style={sub}>We&rsquo;ll email you a link to set a new one.</div>
            </div>
            <form onSubmit={sendReset} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={input} />
              <button type="submit" disabled={busy} style={primaryBtn(busy)}>
                {busy ? "Sending…" : "Send reset link"}
              </button>
              {error && <div style={{ fontSize: 11.5, fontWeight: 600, color: "#dd6f74" }}>{error}</div>}
              <button type="button" style={linkBtn} onClick={() => { setMode("signin"); setError(""); }}>
                Back to sign in
              </button>
            </form>
          </>
        )}

        {mode === "forgot-sent" && (
          <>
            <div>
              <div style={label}>Check your email</div>
              <div style={sub}>
                Sent a reset link to <strong>{email}</strong>.
              </div>
            </div>
            <button type="button" style={linkBtn} onClick={() => setMode("signin")}>
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
