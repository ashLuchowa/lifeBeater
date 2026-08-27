"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#6e6e6e", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "min(360px, 100%)", background: "#eef4e8", borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#14150f" }}>Sign in</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#8a8f83", marginTop: 4 }}>
            We&rsquo;ll email you a link — no password needed.
          </div>
        </div>

        {status === "sent" ? (
          <div style={{ fontSize: 13, fontWeight: 600, color: "#14150f", background: "#fff", borderRadius: 12, padding: "12px 14px", lineHeight: 1.4 }}>
            Check <strong>{email}</strong> for a sign-in link, then come back here.
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                border: "1px solid #d7ddcf",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                outline: "none",
                background: "#fff",
                color: "#14150f",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #14150f",
                background: "#14150f",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: status === "sending" ? "default" : "pointer",
                opacity: status === "sending" ? 0.6 : 1,
              }}
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {status === "error" && (
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "#dd6f74" }}>{error}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
