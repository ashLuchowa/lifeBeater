"use client";

import { useAuth } from "./AuthProvider";
import LoginScreen from "./LoginScreen";

export default function AppShell({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#6e6e6e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600 }}>
        Loading…
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return children;
}
