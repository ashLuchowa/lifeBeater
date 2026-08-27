// Ledger values are stored as display strings ("$310,000"). These helpers let the
// Assets & Liabilities card do arithmetic on them (totals, net worth, share).

export function parseMoney(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(n) {
  const num = Number.isFinite(n) ? n : 0;
  const sign = num < 0 ? "-" : "";
  return `${sign}$${Math.round(Math.abs(num)).toLocaleString("en-US")}`;
}

export function sumMoney(items) {
  return items.reduce((acc, it) => acc + parseMoney(it.value), 0);
}
