// Income / Expense ledger, keyed by financial year (1 Jul – 30 Jun).
// Figures transcribed from the tracking spreadsheet; every derived total below
// reconciles with the sheet's own Fixed/Variable/Main/Side/Other total rows.
//
// To add a year: transcribe its five groups, then add an entry to `years`.
// Everything else — the picker, the totals, the ordering — follows from that.

export const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const rows = (defs) => defs.map(([label, values]) => ({ label, values }));

const fixedCost = rows([
  ["Mobile", [34, 34, 39, 39, 39, 39, 39, 39, 39, 39, 39, 44]],
  ["Internet", [35, 35, 35, 35, 35, 50, 50, 35, 35, 35, 49.12, 35]],
  ["Rent", [1160, 1160, 1160, 1160, 1160, 1160, 1160, 1160, 1160, 1160, 1160, 1160]],
  ["RAC", [54.34, 54.34, 54.34, 54.34, 54.34, 54.34, 54.34, 54.34, 54.34, 54.34, 54.34, 54.34]],
  ["Car Rego", [89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3, 89.3]],
  ["Health Insurance", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
]);

const variableCost = rows([
  ["Groceries", [502.96, 79.21, 293.33, 215.55, 234.03, 330.28, 327.18, 355.76, 315.49, 441.79, 331.56, 382.54]],
  ["Utilities", [145.29, 0, 186, 0, 123.61, 0, 298.25, 0, 158.94, 0, 161.91, 0]],
  ["Car Fuel", [198.15, 53.94, 60.92, 34.46, 157.7, 242.41, 542.83, 552.48, 352, 480.27, 163.26, 210.64]],
  ["Loan", [2552.64, 412.98, 412.98, 1352.11, 732.98, 732.98, 2253.66, 882.98, 982.98, 4216.22, 3794.86, 3476.07]],
  ["Luxury", [956.79, 862.99, 662.04, 471.69, 455.83, 836, 670.25, 700.6, 470.12, 318.02, 667.21, 418.18]],
  ["Other", [854.21, 1291.59, 538.14, 1200.77, 2224.2, 1020.21, 294.34, 1482.63, 289.86, 981.59, 930.54, 672.25]],
]);

const mainIncome = rows([
  ["Week 1", [1055.27, 887.47, 1041.19, 1332.65, 0, 1960.1, 0, 0, 0, 1052.04, 1868.49, 1485.14]],
  ["Week 2", [974.25, 1100.15, 1306.16, 0, 0, 2123.23, 0, 0, 1603.63, 1113.95, 1481.92, 1738.21]],
  ["Week 3", [909.04, 1100.11, 0, 887.38, 1767.38, 0, 0, 0, 895.91, 1812.75, 1897.48, 1795]],
  ["Week 4", [1075.61, 2167.44, 2216.52, 2781.16, 732.82, 0, 0, 0, 1381.56, 3413.11, 1604.34, 1654.11]],
]);

const sideIncome = rows([
  ["Week 1", [131.67, 0, 0, 0, 0, 0, 1611.91, 782.9, 281.27, 367.55, 15.52, 101.09]],
  ["Week 2", [240.36, 0, 0, 0, 315.4, 0, 1127.3, 1017.02, 1.13, 586.1, 0, 122.32]],
  ["Week 3", [0, 0, 0, 0, 260.73, 0, 1457.55, 853.49, 0, 64.04, 65.61, 0]],
  ["Week 4", [0, 0, 0, 0, 0, 1375.41, 955.61, 984.69, 0, 195.06, 0, 0]],
]);

const otherIncome = rows([
  ["Week 1", [932.37, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  ["Week 2", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  ["Week 3", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  ["Week 4", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
]);

// Expenses are groups of item rows. Income is a list of *sources*, each with
// the same four fixed week rows — so a new job or gig is a new source, not a
// new row, and the source label is the thing you rename when the job changes.
const years = {
  "2025-26": {
    fixedCost,
    variableCost,
    incomeSources: [
      { label: "Bus driving", rows: mainIncome },
      { label: "Uber (gross)", rows: sideIncome },
      { label: "Gifts (net)", rows: otherIncome },
    ],
  },
};

// Oldest → newest, so the left arrow walks back the way the day nav does.
export const financialYears = Object.keys(years).sort();
export const latestFinancialYear = financialYears[financialYears.length - 1];

export const isFinancialYear = (fy) => Object.prototype.hasOwnProperty.call(years, fy);

export const ledgerFor = (fy) => years[isFinancialYear(fy) ? fy : latestFinancialYear];

// "2025-26" -> "FY 2025–26" (en dash, matching the sheet).
export const fyLabel = (fy) => `FY ${fy.replace("-", "–")}`;

// The year `delta` steps away, or null at the ends of the range.
export const adjacentYear = (fy, delta) => {
  const i = financialYears.indexOf(fy);
  if (i === -1) return null;
  return financialYears[i + delta] ?? null;
};

// The two expense groups, in render order. These are fixed — the item rows
// inside them are not.
export const EXPENSE_GROUPS = [
  { key: "fixedCost", label: "Fixed cost" },
  { key: "variableCost", label: "Variable cost" },
];

// Every income source carries the same five week rows. Five, not four, because
// a month can hold five pay runs; the fifth simply sits empty in the months it
// does not. normaliseLedger backfills it for ledgers saved when it was four.
export const WEEKS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

export const blankRow = (label = "") => ({ label, values: months.map(() => 0) });

export const blankSource = (label = "") => ({ label, rows: WEEKS.map(blankRow) });

const cleanRow = (r, fallbackLabel = "") => ({
  label: typeof r?.label === "string" ? r.label : fallbackLabel,
  values: months.map((_, i) => {
    const n = Number(r?.values?.[i]);
    return Number.isFinite(n) ? n : 0;
  }),
});

// Coerce anything loaded from the database into the shape the page renders, so
// a hand-edited or partial row can never crash the grid. Also migrates the
// original flat mainIncome / sideIncome / otherIncome shape into sources.
export const normaliseLedger = (raw, fy) => {
  const seed = ledgerFor(fy);

  const out = {};
  for (const g of EXPENSE_GROUPS) {
    const rows = Array.isArray(raw?.[g.key]) ? raw[g.key] : seed[g.key];
    out[g.key] = rows.map((r) => cleanRow(r));
  }

  let sources = raw?.incomeSources;
  if (!Array.isArray(sources)) {
    const legacy = [
      ["Main income", raw?.mainIncome],
      ["Side income (gross)", raw?.sideIncome],
      ["Other income (net)", raw?.otherIncome],
    ].filter(([, r]) => Array.isArray(r));
    sources = legacy.length ? legacy.map(([label, rows]) => ({ label, rows })) : seed.incomeSources;
  }

  out.incomeSources = sources.map((src) => ({
    label: typeof src?.label === "string" ? src.label : "",
    // Weeks are fixed: always exactly four rows, whatever the stored data says.
    rows: WEEKS.map((w, i) => cleanRow(src?.rows?.[i], w)),
  }));

  return out;
};

export const sum = (list) => list.reduce((total, n) => total + n, 0);

export const columnTotals = (groups) => months.map((_, i) => sum(groups.map((r) => r.values[i])));

// Cell display: blank-looking em dash for zero, two decimals otherwise.
export const cellAmount = (n) =>
  n === 0 ? "—" : n.toLocaleString("en-NZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const signedAmount = (n) =>
  (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-NZ", { maximumFractionDigits: 0 });

// Guarded: a year with nothing entered yet has a zero denominator.
export const share = (part, whole) => (whole ? ((part / whole) * 100).toFixed(2) : "0.00") + "%";
