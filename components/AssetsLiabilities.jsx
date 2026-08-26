import { ledgers, netWorth } from "@/lib/data";
import { TitlePill } from "./ui";
import { DotsIcon } from "./icons";

export default function AssetsLiabilities() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <TitlePill size="lg">Assets &amp; Liabilities</TitlePill>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 31, height: 31, borderRadius: "50%", border: "1px solid #e4e7de", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DotsIcon />
          </div>
        </div>
      </div>

      <div className="assets-grid">
        {ledgers.map((l) => (
          <div key={l.label} style={{ borderRadius: 14, padding: 12, background: l.bg, display: "flex", flexDirection: "column", gap: 9, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <div style={{ padding: "5px 9px", borderRadius: 8, background: "#fff", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flex: "none" }}>
                {l.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{l.total}</div>
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
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{netWorth.amount}</div>
            <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.66, marginTop: 2, whiteSpace: "nowrap" }}>{netWorth.caption}</div>
          </div>
          <div style={{ display: "flex", height: 6, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.16)" }}>
            <div style={{ width: netWorth.assetShare + "%", background: "#c9e88a" }} />
            <div style={{ width: 100 - netWorth.assetShare + "%", background: "#dd6f74" }} />
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
  );
}
