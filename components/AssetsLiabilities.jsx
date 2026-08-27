"use client";

import { useEffect, useState } from "react";
import { useDashboardData } from "./DashboardData";
import { TitlePill } from "./ui";
import { DotsIcon, PencilIcon, PlusIcon } from "./icons";
import { formatMoney, parseMoney, sumMoney } from "@/lib/money";

const clone = (o) => JSON.parse(JSON.stringify(o));

export default function AssetsLiabilities() {
  const { data, selectedDate, updateData } = useDashboardData();
  const { ledgers, netWorth } = data;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  // Abandon an in-progress edit if the day changes underneath us.
  useEffect(() => {
    setEditing(false);
    setDraft(null);
  }, [selectedDate]);

  // Lock body scroll while the editor modal is open.
  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editing]);

  const startEdit = () => {
    setDraft({ ledgers: clone(ledgers) });
    setEditing(true);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(null);
  };
  const save = () => {
    const next = draft.ledgers;
    updateData((d) => {
      d.ledgers = next;
      const a = sumMoney(next[0]?.items || []);
      const li = sumMoney(next[1]?.items || []);
      d.netWorth = {
        ...d.netWorth,
        amount: formatMoney(a - li),
        assetShare: a + li > 0 ? Math.round((a / (a + li)) * 100) : 50,
      };
      return d;
    });
    setEditing(false);
    setDraft(null);
  };

  const setItem = (li, ii, field, val) =>
    setDraft((dr) => {
      const n = clone(dr);
      n.ledgers[li].items[ii][field] = val;
      return n;
    });
  const addItem = (li) =>
    setDraft((dr) => {
      const n = clone(dr);
      n.ledgers[li].items.push({ name: "", value: "" });
      return n;
    });
  const removeItem = (li, ii) =>
    setDraft((dr) => {
      const n = clone(dr);
      n.ledgers[li].items.splice(ii, 1);
      return n;
    });

  const totals = ledgers.map((l) => sumMoney(l.items));
  const net = (totals[0] || 0) - (totals[1] || 0);
  const denom = (totals[0] || 0) + (totals[1] || 0);
  const assetShare = denom > 0 ? Math.round((totals[0] / denom) * 100) : 50;

  return (
    <>
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <TitlePill size="lg">Assets &amp; Liabilities</TitlePill>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={startEdit}
              aria-label="Edit assets and liabilities"
              style={{ width: 31, height: 31, borderRadius: "50%", border: "1px solid #e4e7de", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <PencilIcon />
            </button>
          </div>
        </div>

        <div className="assets-grid">
          {ledgers.map((l, li) => (
            <div key={l.label} style={{ borderRadius: 14, padding: 12, background: l.bg, display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <div style={{ padding: "5px 9px", borderRadius: 8, background: "#fff", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flex: "none" }}>
                  {l.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{formatMoney(totals[li])}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {l.items.map((it) => (
                  <div key={it.name} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 9, padding: "5px 9px" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.bar, flex: "none", display: "block" }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {it.name}
                    </span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{it.value}</span>
                  </div>
                ))}
                {l.items.length === 0 && (
                  <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.5, padding: "4px 2px" }}>No items</div>
                )}
              </div>
            </div>
          ))}

          <div style={{ borderRadius: 14, padding: 13, background: "#14150f", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ padding: "5px 9px", borderRadius: 8, background: "rgba(255,255,255,0.12)", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                Net Worth
              </div>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DotsIcon size={12} color="#fff" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{formatMoney(net)}</div>
              <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.66, marginTop: 2, whiteSpace: "nowrap" }}>{netWorth.caption}</div>
            </div>
            <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.16)" }}>
              <div style={{ width: assetShare + "%", background: "#c9e88a" }} />
              <div style={{ width: 100 - assetShare + "%", background: "#dd6f74" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <span style={{ fontSize: 9.5, fontWeight: 600, opacity: 0.66, whiteSpace: "nowrap" }}>{netWorth.updated}</span>
              <span style={{ padding: "4px 9px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                {netWorth.delta}
              </span>
            </div>
          </div>
        </div>
      </div>

      {editing && draft && (
        <Editor
          draft={draft}
          selectedDate={selectedDate}
          onSetItem={setItem}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onCancel={cancel}
          onSave={save}
        />
      )}
    </>
  );
}

function Editor({ draft, selectedDate, onSetItem, onAddItem, onRemoveItem, onCancel, onSave }) {
  const totals = draft.ledgers.map((l) => sumMoney(l.items));
  const net = (totals[0] || 0) - (totals[1] || 0);
  const denom = (totals[0] || 0) + (totals[1] || 0);
  const assetShare = denom > 0 ? Math.round((totals[0] / denom) * 100) : 50;

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
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
      <div
        style={{
          width: "min(560px, 100%)",
          background: "#fff",
          borderRadius: 18,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <TitlePill size="lg">Edit Assets &amp; Liabilities</TitlePill>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={onCancel} style={btnGhost}>
              Cancel
            </button>
            <button type="button" onClick={onSave} style={btnSolid}>
              Save
            </button>
          </div>
        </div>

        {draft.ledgers.map((l, li) => (
          <div key={l.label} style={{ borderRadius: 14, padding: 12, background: l.bg, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <div style={{ padding: "5px 9px", borderRadius: 8, background: "#fff", fontSize: 10, fontWeight: 700 }}>{l.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>{formatMoney(totals[li])}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {l.items.map((it, ii) => (
                <div key={ii} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", borderRadius: 9, padding: "5px 6px 5px 9px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: l.bar, flex: "none" }} />
                  <input
                    value={it.name}
                    placeholder="Name"
                    onChange={(e) => onSetItem(li, ii, "name", e.target.value)}
                    style={{ ...inp, flex: 1, minWidth: 0 }}
                  />
                  <input
                    value={it.value}
                    placeholder="$0"
                    inputMode="decimal"
                    onChange={(e) => onSetItem(li, ii, "value", e.target.value)}
                    onBlur={(e) => e.target.value.trim() && onSetItem(li, ii, "value", formatMoney(parseMoney(e.target.value)))}
                    style={{ ...inp, width: 110, textAlign: "right", fontWeight: 700 }}
                  />
                  <button type="button" onClick={() => onRemoveItem(li, ii)} aria-label="Delete row" style={delBtn}>
                    &times;
                  </button>
                </div>
              ))}
              {l.items.length === 0 && (
                <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.5, padding: "2px 2px" }}>No items yet</div>
              )}
            </div>

            <button type="button" onClick={() => onAddItem(li)} style={addBtn}>
              <PlusIcon size={12} />
              Add {l.label === "Liabilities" ? "liability" : "asset"}
            </button>
          </div>
        ))}

        <div style={{ borderRadius: 14, padding: 13, background: "#14150f", color: "#fff", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ padding: "5px 9px", borderRadius: 8, background: "rgba(255,255,255,0.12)", fontSize: 10, fontWeight: 700 }}>Net Worth</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>{formatMoney(net)}</div>
          </div>
          <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.16)" }}>
            <div style={{ width: assetShare + "%", background: "#c9e88a" }} />
            <div style={{ width: 100 - assetShare + "%", background: "#dd6f74" }} />
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 500, opacity: 0.66 }}>Totals update as you edit · saved to {selectedDate}</div>
        </div>
      </div>
    </div>
  );
}

const inp = {
  border: "1px solid #e4e7de",
  borderRadius: 7,
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "inherit",
  color: "#14150f",
  background: "#fff",
  outline: "none",
};

const delBtn = {
  width: 24,
  height: 24,
  flex: "none",
  borderRadius: 6,
  border: "1px solid #eaded9",
  background: "#fff",
  color: "#dd6f74",
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
};

const addBtn = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  padding: "8px 10px",
  borderRadius: 9,
  border: "1px dashed rgba(20,21,15,0.35)",
  background: "rgba(255,255,255,0.4)",
  fontSize: 11,
  fontWeight: 700,
  fontFamily: "inherit",
  color: "#14150f",
  cursor: "pointer",
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
