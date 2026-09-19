"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboardData } from "./DashboardData";
import { ConfirmDialog, TitlePill } from "./ui";
import { PlusIcon } from "./icons";
import { formatMoney } from "@/lib/money";
import {
  SIMPLE,
  STOCKS,
  assetCost,
  assetValue,
  ensurePortfolio,
  holdingTotals,
  ledgersFromPortfolio,
  liabilityDerived,
  netWorthFromPortfolio,
  newId,
  portfolioTotals,
  stockTotals,
} from "@/lib/portfolio";

// Crossed lines rather than the × text glyph — a font's × is rarely centred
// in its own em box, which is what kept these delete buttons looking off no
// matter how the button itself was centred. An SVG path is centred exactly.
function XIcon({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

const clone = (o) => JSON.parse(JSON.stringify(o));
const signed = (n) => (n < 0 ? "-" : "+") + formatMoney(Math.abs(n)).replace("-", "");
const precise = (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plBg = (v) => (v < 0 ? "#fbd9da" : v > 0 ? "#dff1e4" : "#f4f7ef");

const emptyHolding = { ticker: "", name: "", shares: "", avgCost: "", price: "", fees: "" };
const emptyAsset = { kind: SIMPLE, name: "", value: "", cost: "" };
const emptyLiability = { name: "", balance: "", original: "", rate: "", payment: "" };

// How many steps back Undo can reach. Mirrors the Income / Expense ledger.
const HISTORY_LIMIT = 50;

export default function PortfolioBoard() {
  const { data, selectedWeek, updateData } = useDashboardData();

  // Derived, never stored twice: older snapshots are promoted on read.
  const portfolio = useMemo(() => ensurePortfolio(data), [data]);
  const totals = useMemo(() => portfolioTotals(portfolio), [portfolio]);

  const [open, setOpen] = useState({ brokerage: true });
  const [assetForm, setAssetForm] = useState(null);
  const [liabForm, setLiabForm] = useState(null);
  const [holdingFor, setHoldingFor] = useState(null);
  const [holding, setHolding] = useState(emptyHolding);

  // A pending "delete this?" confirmation: { kind, name, onConfirm } or null.
  const [confirmTarget, setConfirmTarget] = useState(null);

  // Undo/redo history, same shape as the ledger's: two stacks of whole
  // portfolio snapshots. `portfolio` is derived from context, not local state,
  // so a ref keeps undo/redo reading the latest value rather than one closed
  // over at the render their button was clicked from.
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const portfolioRef = useRef(portfolio);
  useEffect(() => {
    portfolioRef.current = portfolio;
  }, [portfolio]);

  // A different week is a different document — its own history, not a
  // continuation of whatever you were undoing a moment ago.
  useEffect(() => {
    setPast([]);
    setFuture([]);
  }, [selectedWeek]);

  // One write path: save the records, then rebuild the card's ledgers and
  // netWorth from them so the dashboard cannot drift from this page.
  const applyPortfolio = (next) =>
    updateData((d) => {
      d.portfolio = next;
      d.ledgers = ledgersFromPortfolio(next);
      d.netWorth = netWorthFromPortfolio(next, d.netWorth);
      return d;
    });

  const commit = (next) => {
    setPast((p) => [...p, portfolioRef.current].slice(-HISTORY_LIMIT));
    setFuture([]);
    applyPortfolio(next);
  };

  const undo = () => {
    if (!past.length) return;
    const current = portfolioRef.current;
    const restored = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [current, ...f].slice(0, HISTORY_LIMIT));
    applyPortfolio(restored);
  };

  const redo = () => {
    if (!future.length) return;
    const current = portfolioRef.current;
    const restored = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, current].slice(-HISTORY_LIMIT));
    applyPortfolio(restored);
  };

  const toggle = (id) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  // Every delete goes through a confirmation instead of firing immediately —
  // undo covers a change of mind, but the prompt catches the mis-click
  // before it happens at all.
  const askDelete = (name, onConfirm) => setConfirmTarget({ name, onConfirm });
  const confirmDelete = () => {
    confirmTarget?.onConfirm();
    setConfirmTarget(null);
  };

  const addAsset = () => {
    if (!assetForm?.name.trim()) return;
    const row =
      assetForm.kind === STOCKS
        ? { id: newId(), kind: STOCKS, name: assetForm.name.trim(), note: "Investment account", holdings: [] }
        : {
            id: newId(),
            kind: SIMPLE,
            name: assetForm.name.trim(),
            note: "Added manually",
            value: Number(assetForm.value) || 0,
            cost: Number(assetForm.cost) || 0,
          };
    commit({ ...clone(portfolio), assets: [...portfolio.assets, row] });
    setAssetForm(null);
  };

  const addLiability = () => {
    if (!liabForm?.name.trim()) return;
    const balance = Number(liabForm.balance) || 0;
    const row = {
      id: newId(),
      name: liabForm.name.trim(),
      note: "Added manually",
      balance,
      original: Number(liabForm.original) || balance,
      rate: Number(liabForm.rate) || 0,
      payment: Number(liabForm.payment) || 0,
    };
    commit({ ...clone(portfolio), liabilities: [...portfolio.liabilities, row] });
    setLiabForm(null);
  };

  const addHolding = () => {
    if (!holdingFor || !holding.ticker.trim()) return;
    const ticker = holding.ticker.trim().toUpperCase();
    const row = {
      id: newId(),
      ticker,
      name: holding.name.trim() || ticker,
      shares: Number(holding.shares) || 0,
      avgCost: Number(holding.avgCost) || 0,
      price: Number(holding.price) || Number(holding.avgCost) || 0,
      fees: Number(holding.fees) || 0,
    };
    commit({
      ...clone(portfolio),
      assets: portfolio.assets.map((a) => (a.id === holdingFor ? { ...a, holdings: [...a.holdings, row] } : a)),
    });
    setHoldingFor(null);
    setHolding(emptyHolding);
  };

  const removeAsset = (id) => commit({ ...clone(portfolio), assets: portfolio.assets.filter((a) => a.id !== id) });
  const removeLiability = (id) =>
    commit({ ...clone(portfolio), liabilities: portfolio.liabilities.filter((l) => l.id !== id) });
  const removeHolding = (assetId, holdingId) =>
    commit({
      ...clone(portfolio),
      assets: portfolio.assets.map((a) =>
        a.id === assetId ? { ...a, holdings: a.holdings.filter((h) => h.id !== holdingId) } : a,
      ),
    });

  const stats = [
    {
      label: "Invested",
      bg: "#dcecf7",
      dot: "#4fbfd6",
      value: formatMoney(totals.investedValue),
      note: `Cost ${formatMoney(totals.investedCost)} · fees ${precise(totals.investedFees)}`,
    },
    {
      label: "Unrealised P/L",
      bg: totals.unrealised < 0 ? "#fbd9da" : "#dff1e4",
      dot: totals.unrealised < 0 ? "#dd6f74" : "#4a9c68",
      value: signed(totals.unrealised),
      note: totals.investedCost ? `${((totals.unrealised / totals.investedCost) * 100).toFixed(1)}% on cost` : "No holdings yet",
    },
    {
      label: "Debt servicing",
      bg: "#fbecc4",
      dot: "#e0a92a",
      value: formatMoney(totals.monthlyDebt) + " / mo",
      note: precise(totals.monthlyInterest) + " of it interest",
    },
  ];

  return (
    <>
      <div className="pf-board">
      <div className="ledger-toolbar">
        <div className="ledger-toolbar-actions">
          <button type="button" className="ledger-btn" onClick={undo} disabled={!past.length}>
            Undo
          </button>
          <button type="button" className="ledger-btn" onClick={redo} disabled={!future.length}>
            Redo
          </button>
        </div>
      </div>

      <div className="pf-summary">
        <div className="pf-networth">
          <div className="pf-card-top">
            <span className="pf-chip pf-chip--dark">Net Worth</span>
            <span className="pf-dot" style={{ background: "#c9e88a" }} />
          </div>
          <div>
            <div className="pf-networth-value">{formatMoney(totals.net)}</div>
            <div className="pf-note pf-note--dark">Assets minus liabilities</div>
          </div>
          <div className="pf-split">
            <div style={{ width: totals.assetShare + "%", background: "#c9e88a" }} />
            <div style={{ width: 100 - totals.assetShare + "%", background: "#dd6f74" }} />
          </div>
          <div className="pf-legend">
            <div className="pf-legend-row">
              <span className="pf-legend-label">
                <span className="pf-dot" style={{ background: "#c9e88a" }} />
                Assets
              </span>
              <span className="pf-legend-value">{formatMoney(totals.assets)}</span>
            </div>
            <div className="pf-legend-row">
              <span className="pf-legend-label">
                <span className="pf-dot" style={{ background: "#dd6f74" }} />
                Liabilities
              </span>
              <span className="pf-legend-value">{formatMoney(totals.liabilities)}</span>
            </div>
          </div>
        </div>

        <div className="pf-stats">
          {stats.map((s) => (
            <div key={s.label} className="pf-stat" style={{ background: s.bg }}>
              <div className="pf-card-top">
                <span className="pf-chip">{s.label}</span>
                <span className="pf-dot" style={{ background: s.dot }} />
              </div>
              <div>
                <div className="pf-stat-value">{s.value}</div>
                <div className="pf-note">{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Assets ---------- */}
      <section className="pf-section">
        <header className="pf-section-head">
          <div className="pf-section-title">
            <TitlePill size="lg">Assets</TitlePill>
            <span className="pf-chip pf-chip--quiet">{formatMoney(totals.assets)}</span>
          </div>
          <button type="button" className="pf-add pf-add--asset" onClick={() => setAssetForm(emptyAsset)}>
            <PlusIcon size={12} />
            Add asset
          </button>
        </header>

        {assetForm && (
          <div className="pf-form pf-form--asset">
            <div className="pf-form-head">
              <span className="pf-form-title">New asset</span>
              <div className="pf-kinds">
                {[
                  { key: SIMPLE, label: "Single holding" },
                  { key: STOCKS, label: "Investment account" },
                ].map((k) => (
                  <button
                    key={k.key}
                    type="button"
                    className={assetForm.kind === k.key ? "pf-kind pf-kind--on" : "pf-kind"}
                    onClick={() => setAssetForm((f) => ({ ...f, kind: k.key }))}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="pf-fields">
              <Field label="Name" placeholder="e.g. Brokerage" value={assetForm.name} onChange={(v) => setAssetForm((f) => ({ ...f, name: v }))} grow={1.6} />
              {assetForm.kind === SIMPLE && (
                <>
                  <Field label="Current value" type="number" placeholder="0" value={assetForm.value} onChange={(v) => setAssetForm((f) => ({ ...f, value: v }))} />
                  <Field label="Paid / cost" type="number" placeholder="0" value={assetForm.cost} onChange={(v) => setAssetForm((f) => ({ ...f, cost: v }))} />
                </>
              )}
              <button type="button" className="pf-btn pf-btn--solid" onClick={addAsset}>Add</button>
              <button type="button" className="pf-btn" onClick={() => setAssetForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {portfolio.assets.map((a) => {
          const value = assetValue(a);
          const cost = assetCost(a);
          const pl = value - cost;
          const isStock = a.kind === STOCKS;
          const st = isStock ? stockTotals(a) : null;
          const isOpen = !!open[a.id];

          return (
            <article key={a.id} className="pf-row">
              <div className="pf-row-head">
                <button type="button" className="pf-caret pf-caret--asset" onClick={() => toggle(a.id)} aria-label="Toggle details" aria-expanded={isOpen}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14150f" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>
                    <path d="M6 10l6 5 6-5" />
                  </svg>
                </button>
                <button type="button" className="pf-row-name" onClick={() => toggle(a.id)}>
                  <span className="pf-row-title">{a.name}</span>
                  <span className="pf-row-sub">{a.note}</span>
                </button>
                <span className="pf-chip pf-chip--quiet">{isStock ? "Investments" : "Holding"}</span>
                {cost > 0 && (
                  <span className="pf-pl" style={{ background: plBg(pl) }}>
                    {signed(pl)} · {((pl / cost) * 100).toFixed(1)}%
                  </span>
                )}
                <span className="pf-row-value">{formatMoney(value)}</span>
                <button type="button" className="pf-del" onClick={() => askDelete(a.name, () => removeAsset(a.id))} aria-label={`Delete ${a.name}`}><XIcon /></button>
              </div>

              {isOpen && isStock && (
                <div className="pf-row-body">
                  <div className="pf-scroller">
                    <div className="pf-table">
                      <div className="pf-tr pf-tr--head">
                        <div>Holding</div>
                        <div className="pf-num">Shares</div>
                        <div className="pf-num">Avg cost</div>
                        <div className="pf-num">Price</div>
                        <div className="pf-num">Fees</div>
                        <div className="pf-num">Value</div>
                        <div className="pf-num">P / L</div>
                        <div />
                      </div>

                      {a.holdings.map((h) => {
                        const ht = holdingTotals(h);
                        return (
                          <div key={h.id} className="pf-tr">
                            <div className="pf-td pf-td--name">
                              <span className="pf-ticker">{h.ticker}</span>
                              <span className="pf-holding-name">{h.name}</span>
                            </div>
                            <div className="pf-td pf-num">{(h.shares || 0).toLocaleString("en-US")}</div>
                            <div className="pf-td pf-num">{precise(h.avgCost)}</div>
                            <div className="pf-td pf-num">{precise(h.price)}</div>
                            <div className="pf-td pf-num pf-td--quiet">{precise(h.fees)}</div>
                            <div className="pf-td pf-num pf-td--strong">{formatMoney(ht.value)}</div>
                            <div className="pf-td pf-num pf-td--strong" style={{ background: plBg(ht.pl) }}>
                              <span>{signed(ht.pl)}</span>
                              <span className="pf-pl-pct">{ht.cost ? ht.plPct.toFixed(1) + "%" : "—"}</span>
                            </div>
                            <button type="button" className="pf-del pf-del--cell" onClick={() => askDelete(h.ticker, () => removeHolding(a.id, h.id))} aria-label={`Delete ${h.ticker}`}><XIcon size={10} /></button>
                          </div>
                        );
                      })}

                      {a.holdings.length === 0 && <div className="pf-empty">No holdings yet</div>}

                      {a.holdings.length > 0 && (
                        <div className="pf-tr pf-tr--total">
                          <div className="pf-td pf-td--dark">Total</div>
                          <div className="pf-td pf-td--dark pf-td--span pf-num">
                            {a.holdings.length} holdings · cost {formatMoney(st.cost)} · fees {precise(st.fees)}
                          </div>
                          <div className="pf-td pf-td--dark pf-num">{formatMoney(st.value)}</div>
                          <div className="pf-td pf-num pf-td--strong" style={{ background: plBg(pl) }}>{signed(pl)}</div>
                          <div />
                        </div>
                      )}
                    </div>
                  </div>

                  {holdingFor === a.id && (
                    <div className="pf-form pf-form--holding">
                      <div className="pf-fields">
                        <Field label="Ticker" placeholder="AIR" value={holding.ticker} onChange={(v) => setHolding((h) => ({ ...h, ticker: v }))} />
                        <Field label="Name" placeholder="Company" value={holding.name} onChange={(v) => setHolding((h) => ({ ...h, name: v }))} grow={1.4} />
                        <Field label="Shares" type="number" placeholder="0" value={holding.shares} onChange={(v) => setHolding((h) => ({ ...h, shares: v }))} />
                        <Field label="Avg cost" type="number" step="0.01" placeholder="0.00" value={holding.avgCost} onChange={(v) => setHolding((h) => ({ ...h, avgCost: v }))} />
                        <Field label="Price" type="number" step="0.01" placeholder="0.00" value={holding.price} onChange={(v) => setHolding((h) => ({ ...h, price: v }))} />
                        <Field label="Fees" type="number" step="0.01" placeholder="0.00" value={holding.fees} onChange={(v) => setHolding((h) => ({ ...h, fees: v }))} />
                        <button type="button" className="pf-btn pf-btn--solid" onClick={addHolding}>Save</button>
                        <button type="button" className="pf-btn" onClick={() => setHoldingFor(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className="pf-dashed"
                    onClick={() => {
                      setHoldingFor(a.id);
                      setHolding(emptyHolding);
                    }}
                  >
                    <PlusIcon size={12} color="#6d7168" />
                    Add holding
                  </button>
                </div>
              )}

              {isOpen && !isStock && (
                <div className="pf-facts">
                  <Fact label="Current value" value={formatMoney(a.value || 0)} />
                  <Fact label="Paid" value={formatMoney(a.cost || 0)} />
                  <Fact label="Change" value={signed(pl)} />
                  <Fact label="Share of assets" value={totals.assets ? ((value / totals.assets) * 100).toFixed(1) + "%" : "—"} />
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* ---------- Liabilities ---------- */}
      <section className="pf-section">
        <header className="pf-section-head">
          <div className="pf-section-title">
            <TitlePill size="lg">Liabilities</TitlePill>
            <span className="pf-chip pf-chip--quiet">{formatMoney(totals.liabilities)}</span>
          </div>
          <button type="button" className="pf-add pf-add--liab" onClick={() => setLiabForm(emptyLiability)}>
            <PlusIcon size={12} />
            Add liability
          </button>
        </header>

        {liabForm && (
          <div className="pf-form pf-form--liab">
            <span className="pf-form-title">New liability</span>
            <div className="pf-fields">
              <Field label="Name" placeholder="e.g. Car loan" value={liabForm.name} onChange={(v) => setLiabForm((f) => ({ ...f, name: v }))} grow={1.4} />
              <Field label="Balance" type="number" placeholder="0" value={liabForm.balance} onChange={(v) => setLiabForm((f) => ({ ...f, balance: v }))} />
              <Field label="Original" type="number" placeholder="0" value={liabForm.original} onChange={(v) => setLiabForm((f) => ({ ...f, original: v }))} />
              <Field label="Rate %" type="number" step="0.01" placeholder="0.00" value={liabForm.rate} onChange={(v) => setLiabForm((f) => ({ ...f, rate: v }))} />
              <Field label="Monthly" type="number" placeholder="0" value={liabForm.payment} onChange={(v) => setLiabForm((f) => ({ ...f, payment: v }))} />
              <button type="button" className="pf-btn pf-btn--solid" onClick={addLiability}>Add</button>
              <button type="button" className="pf-btn" onClick={() => setLiabForm(null)}>Cancel</button>
            </div>
          </div>
        )}

        {portfolio.liabilities.map((l) => {
          const d = liabilityDerived(l);
          const isOpen = !!open[l.id];
          return (
            <article key={l.id} className="pf-row">
              <div className="pf-row-head">
                <button type="button" className="pf-caret pf-caret--liab" onClick={() => toggle(l.id)} aria-label="Toggle details" aria-expanded={isOpen}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14150f" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(180deg)" : "none" }}>
                    <path d="M6 10l6 5 6-5" />
                  </svg>
                </button>
                <button type="button" className="pf-row-name" onClick={() => toggle(l.id)}>
                  <span className="pf-row-title">{l.name}</span>
                  <span className="pf-row-sub">{l.note}</span>
                </button>
                <span className="pf-chip pf-chip--quiet">{(d.paid * 100).toFixed(0)}% repaid</span>
                <span className="pf-row-value">{formatMoney(l.balance || 0)}</span>
                <button type="button" className="pf-del" onClick={() => askDelete(l.name, () => removeLiability(l.id))} aria-label={`Delete ${l.name}`}><XIcon /></button>
              </div>

              <div className="pf-track">
                <div style={{ width: d.paid * 100 + "%" }} />
              </div>

              {isOpen && (
                <div className="pf-facts">
                  <Fact label="Balance" value={formatMoney(l.balance || 0)} />
                  <Fact label="Original" value={formatMoney(l.original || 0)} />
                  <Fact label="Rate" value={(l.rate || 0).toFixed(2) + "%"} />
                  <Fact label="Monthly" value={formatMoney(l.payment || 0)} />
                  <Fact label="Interest / mo" value={precise(d.interest)} />
                  <Fact label="Payoff" value={d.monthsLeft ? d.monthsLeft + " mo" : "No end date"} />
                </div>
              )}
            </article>
          );
        })}

        <p className="pf-footnote">Prices are entered by hand · saved to week of {selectedWeek || "…"}</p>
      </section>
    </div>

    {confirmTarget && (
      <ConfirmDialog
        title={`Delete ${confirmTarget.name || "this"}?`}
        body="You can Undo this right after, but it's gone from the page the moment you confirm."
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmDelete}
      />
    )}
    </>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", step, grow = 1 }) {
  return (
    <label className="pf-field" style={{ flexGrow: grow }}>
      <span className="pf-field-label">{label}</span>
      <input
        className="pf-input"
        type={type}
        step={step}
        inputMode={type === "number" ? "decimal" : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Fact({ label, value }) {
  return (
    <div className="pf-fact">
      <div className="pf-fact-label">{label}</div>
      <div className="pf-fact-value">{value}</div>
    </div>
  );
}
