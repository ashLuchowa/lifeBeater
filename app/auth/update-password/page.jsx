"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const card = { width: "min(360px, 100%)", background: "#eef4e8", borderRadius: 22, padding: 28, display: "flex", flexDirection: "column", gap: 16 };
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

// Reached after clicking the "reset password" email link, by which point the
// browser already has a valid (recovery) session from /auth/callback — this
// page just lets you pick a new password to replace it.
export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.replace("/"), 1200);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#6e6e6e", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={card}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#14150f" }}>Set a new password</div>
        </div>

        {done ? (
          <div style={{ fontSize: 13, fontWeight: 600, color: "#14150f" }}>Password updated — taking you to the dashboard…</div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" style={input} />
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" style={input} />
            <button
              type="submit"
              disabled={busy}
              style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #14150f", background: "#14150f", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Saving…" : "Save password"}
            </button>
            {error && <div style={{ fontSize: 11.5, fontWeight: 600, color: "#dd6f74" }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
