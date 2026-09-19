import { formatMoney, parseMoney } from "./money";

// The detail records behind the Assets & Liabilities card. The card itself only
// ever showed {name, value} strings; this is the same information with the
// working out kept — holdings, cost basis, fees, rates, payments — so the
// drill-down page can show P/L and payoff without a second source of truth.
//
// `ledgers` and `netWorth` stay in the snapshot, but are DERIVED from here on
// every save (see ledgersFromPortfolio), so the two can no longer disagree.

export const STOCKS = "stocks";
export const SIMPLE = "simple";

export const newId = () => "p" + Math.random().toString(36).slice(2, 9);

// Seeded to the same totals as lib/data.js ledgers ($482,600 / $196,400), so a
// fresh account sees identical numbers on the card and on the detail page.
export const seedPortfolio = {
  assets: [
    { id: "residence", kind: SIMPLE, name: "Primary residence", note: "Bought Mar 2021", value: 310000, cost: 268000 },
    {
      id: "brokerage",
      kind: STOCKS,
      name: "Brokerage",
      note: "NZX / US holdings",
      holdings: [
        { id: "voo", ticker: "VOO", name: "Vanguard S&P 500", shares: 120, avgCost: 412.4, price: 498.2, fees: 18 },
        { id: "fph", ticker: "FPH", name: "Fisher & Paykel H.", shares: 700, avgCost: 26.1, price: 33.4, fees: 12 },
        { id: "air", ticker: "AIR", name: "Air New Zealand", shares: 22821, avgCost: 0.62, price: 0.58, fees: 24.5 },
      ],
    },
    {
      id: "retirement",
      kind: STOCKS,
      name: "Retirement (401k)",
      note: "Employer scheme",
      holdings: [
        { id: "grw", ticker: "GRW", name: "Growth fund units", shares: 10940, avgCost: 4.12, price: 5, fees: 0 },
      ],
    },
    { id: "cash", kind: SIMPLE, name: "Cash & savings", note: "On call", value: 21500, cost: 21500 },
  ],
  liabilities: [
    { id: "mortgage", name: "Mortgage", note: "Fixed to 2027", balance: 164800, original: 214000, rate: 6.35, payment: 1840 },
    { id: "auto", name: "Auto loan", note: "36 months remaining", balance: 18300, original: 26000, rate: 8.9, payment: 512 },
    { id: "student", name: "Student loan", note: "Interest free", balance: 9100, original: 21000, rate: 0, payment: 180 },
    { id: "cards", name: "Credit cards", note: "Revolving", balance: 4200, original: 6000, rate: 19.95, payment: 250 },
  ],
};

export function stockTotals(asset) {
  return (asset.holdings || []).reduce(
    (t, h) => {
      const value = (h.shares || 0) * (h.price || 0);
      const cost = (h.shares || 0) * (h.avgCost || 0) + (h.fees || 0);
      return { value: t.value + value, cost: t.cost + cost, fees: t.fees + (h.fees || 0) };
    },
    { value: 0, cost: 0, fees: 0 },
  );
}

export function holdingTotals(h) {
  const value = (h.shares || 0) * (h.price || 0);
  const cost = (h.shares || 0) * (h.avgCost || 0) + (h.fees || 0);
  const pl = value - cost;
  return { value, cost, pl, plPct: cost ? (pl / cost) * 100 : 0 };
}

export const assetValue = (a) => (a.kind === STOCKS ? stockTotals(a).value : a.value || 0);
export const assetCost = (a) => (a.kind === STOCKS ? stockTotals(a).cost : a.cost || 0);

// Monthly interest, the principal each payment actually retires, and how many
// payments are left at that rate. A payment that does not cover the interest
// never pays the balance off, so monthsLeft is null rather than Infinity.
export function liabilityDerived(l) {
  const balance = l.balance || 0;
  const interest = (balance * ((l.rate || 0) / 100)) / 12;
  const principal = Math.max(0, (l.payment || 0) - interest);
  return {
    interest,
    principal,
    monthsLeft: principal > 0 ? Math.ceil(balance / principal) : null,
    paid: l.original ? Math.max(0, Math.min(1, 1 - balance / l.original)) : 0,
  };
}

export function portfolioTotals(p) {
  const assets = (p.assets || []).reduce((t, a) => t + assetValue(a), 0);
  const cost = (p.assets || []).reduce((t, a) => t + assetCost(a), 0);
  const liabilities = (p.liabilities || []).reduce((t, l) => t + (l.balance || 0), 0);
  const invested = (p.assets || []).filter((a) => a.kind === STOCKS).map(stockTotals);
  const investedValue = invested.reduce((t, s) => t + s.value, 0);
  const investedCost = invested.reduce((t, s) => t + s.cost, 0);
  const denom = assets + liabilities;

  return {
    assets,
    cost,
    liabilities,
    net: assets - liabilities,
    assetShare: denom > 0 ? Math.round((assets / denom) * 100) : 50,
    investedValue,
    investedCost,
    investedFees: invested.reduce((t, s) => t + s.fees, 0),
    unrealised: investedValue - investedCost,
    monthlyDebt: (p.liabilities || []).reduce((t, l) => t + (l.payment || 0), 0),
    monthlyInterest: (p.liabilities || []).reduce((t, l) => t + liabilityDerived(l).interest, 0),
  };
}

// The card's shape, rebuilt from the records. Keeps the existing bg/bar colours
// so nothing about how the card renders has to change.
export function ledgersFromPortfolio(p) {
  const t = portfolioTotals(p);
  return [
    {
      label: "Assets",
      total: formatMoney(t.assets),
      bg: "#fbecc4",
      bar: "#e0a92a",
      items: (p.assets || []).map((a) => ({ name: a.name, value: formatMoney(assetValue(a)) })),
    },
    {
      label: "Liabilities",
      total: formatMoney(t.liabilities),
      bg: "#fbd9da",
      bar: "#dd6f74",
      items: (p.liabilities || []).map((l) => ({ name: l.name, value: formatMoney(l.balance || 0) })),
    },
  ];
}

export function netWorthFromPortfolio(p, previous) {
  const t = portfolioTotals(p);
  return {
    caption: "Assets minus liabilities",
    ...(previous || {}),
    amount: formatMoney(t.net),
    assetShare: t.assetShare,
  };
}

// Snapshots saved before this feature existed have `ledgers` but no
// `portfolio`. Promote each ledger row to a record so those weeks open with
// real data instead of the seed. Pure — callers decide whether to persist.
export function ensurePortfolio(data) {
  if (data?.portfolio?.assets) return data.portfolio;

  const ledgers = data?.ledgers;
  if (!Array.isArray(ledgers) || ledgers.length < 2) return seedPortfolio;

  const assetItems = ledgers[0]?.items || [];
  const liabItems = ledgers[1]?.items || [];

  return {
    assets: assetItems.map((it) => {
      const value = parseMoney(it.value);
      return { id: newId(), kind: SIMPLE, name: it.name, note: "From earlier snapshot", value, cost: value };
    }),
    liabilities: liabItems.map((it) => {
      const balance = parseMoney(it.value);
      return { id: newId(), name: it.name, note: "From earlier snapshot", balance, original: balance, rate: 0, payment: 0 };
    }),
  };
}
