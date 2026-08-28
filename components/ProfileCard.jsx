"use client";

import { useEffect, useState } from "react";
import { useDashboardData } from "./DashboardData";
import { TitlePill } from "./ui";
import { PencilIcon } from "./icons";
import ComingSoon from "./ComingSoon";

// "Perth, AU" -> { city: "Perth", country: "AU" }
function splitLocation(loc = "") {
  const i = String(loc).lastIndexOf(",");
  if (i === -1) return { city: String(loc).trim(), country: "" };
  return { city: loc.slice(0, i).trim(), country: loc.slice(i + 1).trim() };
}

// "37 yrs · Perth, AU" -> { age: "37", location: "Perth, AU" } for older snapshots
// that only stored the combined `meta` string.
function splitMeta(meta = "") {
  const [first, ...rest] = String(meta).split("·");
  const age = (first.match(/\d+/) || [""])[0];
  const location = rest.join("·").trim() || (age ? "" : first.trim());
  return { age, location };
}

// Resolve identity fields, falling back through older snapshot shapes
// (flat `location` string, then combined `meta` string).
function identity(profile) {
  const meta = splitMeta(profile.meta);
  const loc = splitLocation(profile.location ?? meta.location);
  return {
    name: profile.name ?? "",
    age: profile.age ?? meta.age ?? "",
    city: profile.city ?? loc.city ?? "",
    country: profile.country ?? loc.country ?? "",
  };
}

function detailLine(profile) {
  const { age, city, country } = identity(profile);
  const place = [city, country].filter(Boolean).join(", ");
  return [age ? `${age} yrs` : null, place].filter(Boolean).join(" · ");
}

export default function ProfileCard() {
  const { data, selectedDate, updateData } = useDashboardData();
  const { profile } = data;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  // Drop an in-progress edit if the day changes underneath us.
  useEffect(() => {
    setEditing(false);
    setDraft(null);
  }, [selectedDate]);

  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editing]);

  const startEdit = () => {
    const id = identity(profile);
    setDraft({ name: id.name, age: String(id.age || ""), city: id.city, country: id.country });
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(null);
  };
  const save = () => {
    const name = draft.name.trim();
    const city = draft.city.trim();
    const country = draft.country.trim();
    const ageNum = parseInt(draft.age, 10);
    const age = Number.isFinite(ageNum) ? ageNum : null;
    updateData((d) => {
      const place = [city, country].filter(Boolean).join(", ");
      const next = { ...d.profile, name, age, city, country, location: place };
      next.meta = [age ? `${age} yrs` : null, place].filter(Boolean).join(" · ");
      d.profile = next;
      return d;
    });
    setEditing(false);
    setDraft(null);
  };

  return (
    <>
      <div style={{ background: "#14150f", color: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0b323", flex: "none", overflow: "hidden" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.6, marginTop: 2 }}>{detailLine(profile)}</div>
          </div>
          <button
            type="button"
            onClick={startEdit}
            aria-label="Edit profile"
            style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", cursor: "pointer" }}
          >
            <PencilIcon color="#fff" size={12} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.55 }}>
            Achievements
          </div>
          {/* Badges are placeholders until achievements are earned automatically. */}
          <ComingSoon>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {profile.badges.map((b) => (
                <span
                  key={b.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.1)",
                    fontSize: 9.5,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: b.dot, display: "block" }} />
                  {b.label}
                </span>
              ))}
            </div>
          </ComingSoon>
        </div>
      </div>

      {editing && draft && (
        <div
          onMouseDown={(e) => e.target === e.currentTarget && cancel()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(20,21,15,0.45)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "5vh 16px",
            overflowY: "auto",
          }}
        >
          <div style={{ width: "min(440px, 100%)", background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <TitlePill size="lg">Edit Profile</TitlePill>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={cancel} style={btnGhost}>
                  Cancel
                </button>
                <button type="button" onClick={save} style={btnSolid}>
                  Save
                </button>
              </div>
            </div>

            <label style={field}>
              <span style={fieldLabel}>Name</span>
              <input
                value={draft.name}
                placeholder="Your name"
                autoFocus
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                style={inp}
              />
            </label>

            <label style={field}>
              <span style={fieldLabel}>Age</span>
              <input
                value={draft.age}
                placeholder="37"
                inputMode="numeric"
                onChange={(e) => setDraft((d) => ({ ...d, age: e.target.value.replace(/[^0-9]/g, "") }))}
                style={inp}
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ ...field, flex: 1 }}>
                <span style={fieldLabel}>City</span>
                <input
                  value={draft.city}
                  placeholder="Perth"
                  onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                  style={inp}
                />
              </label>

              <label style={{ ...field, flex: 1 }}>
                <span style={fieldLabel}>Country</span>
                <input
                  value={draft.country}
                  placeholder="AU"
                  onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
                  style={inp}
                />
              </label>
            </div>

            <div style={{ fontSize: 10.5, fontWeight: 600, color: "#8a8f83", lineHeight: 1.4 }}>
              Achievements are earned automatically from milestones — editing them here comes later.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const field = { display: "flex", flexDirection: "column", gap: 5 };

const fieldLabel = {
  fontSize: 9.5,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#8a8f83",
};

const inp = {
  border: "1px solid #e4e7de",
  borderRadius: 9,
  padding: "9px 11px",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  color: "#14150f",
  background: "#fff",
  outline: "none",
};

const btnGhost = {
  padding: "7px 13px",
  borderRadius: 999,
  border: "1px solid #d7ddcf",
  background: "#fff",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  color: "#14150f",
  cursor: "pointer",
};

const btnSolid = {
  padding: "7px 15px",
  borderRadius: 999,
  border: "1px solid #14150f",
  background: "#14150f",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "inherit",
  cursor: "pointer",
};
