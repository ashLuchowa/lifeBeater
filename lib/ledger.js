// Income / Expense ledger, keyed by financial year (1 Jul – 30 Jun).
// Figures transcribed from the tracking spreadsheet; every derived total below
// reconciles with the sheet's own Fixed/Variable/Main/Side/Other total rows.
//
// The 2025-26 figures below are the seed. Any other financial year starts from
// the same categories with zeroed values, and becomes real once you edit it.

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
      { label: "Other income", kind: "other", rows: otherIncome },
    ],
  },
};

// Financial years are computed, not enumerated: "2025-26" means 1 Jul 2025 –
// 30 Jun 2026, so stepping a year is arithmetic on the start year. That means
// you can walk to a year nobody has touched yet and simply start filling it in
// — there is no list to register a new year with.
const SEED_YEAR = "2025-26";

const fyStart = (fy) => parseInt(String(fy).slice(0, 4), 10);

const makeFy = (startYear) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

// Shape check only. Membership is not a thing any more.
export const isFinancialYear = (fy) =>
  /^\d{4}-\d{2}$/.test(String(fy ?? "")) && makeFy(fyStart(fy)) === fy;

export const shiftFinancialYear = (fy, delta) => makeFy(fyStart(fy) + delta);

// The FY containing today. July starts a new one.
export const currentFinancialYear = () => {
  const now = new Date();
  return makeFy(now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1);
};

// The navigable window. One year ahead so you can plan next year, and far
// enough back to cover history — the arrows and the year picker both derive
// from this, so they can never offer different ranges.
const YEARS_BACK = 7;

export const maxFinancialYear = (anchor = currentFinancialYear()) => shiftFinancialYear(anchor, 1);
export const minFinancialYear = (anchor = currentFinancialYear()) => shiftFinancialYear(anchor, -YEARS_BACK);

// Newest first, for the picker.
export const financialYearOptions = (anchor = currentFinancialYear()) => {
  const out = [];
  const oldest = minFinancialYear(anchor);
  for (let y = maxFinancialYear(anchor); y >= oldest; y = shiftFinancialYear(y, -1)) out.push(y);
  return out;
};

// Where the page lands with no ?fy= — the year you are actually living in.
export const defaultFinancialYear = () => currentFinancialYear();

// "2025-26" -> "FY 2025–26" (en dash, matching the sheet).
export const fyLabel = (fy) => `FY ${String(fy).replace("-", "–")}`;

// A cell can hold a breakdown: the individual purchases behind the month's
// figure ("1 Jan · Coles · 300"). When a cell has lines, its value is their
// sum; when it has none, the value is simply what you typed.
// A line stores only the day of the month — the month and year are already
// known from the cell it lives in, so there is nothing else to pick.
export const blankEntry = (day = 0) => ({ day, note: "", amount: 0 });

// Earliest first. Lines with no day chosen sink to the bottom and hold their
// order among themselves — Array#sort is stable.
export const sortEntries = (list) => [...list].sort((a, b) => (a.day || Infinity) - (b.day || Infinity));

// Month index 0 is July of the financial year's start year; 11 is the June
// after it. Everything about a cell's real calendar date follows from that.
export const monthDate = (fy, monthIndex) => {
  const start = fyStart(fy);
  return monthIndex <= 5
    ? { year: start, month: 6 + monthIndex }
    : { year: start + 1, month: monthIndex - 6 };
};

// Day 0 of the next month is the last day of this one, so February lands on 28
// or 29 without a leap-year rule of our own.
export const daysInLedgerMonth = (fy, monthIndex) => {
  const { year, month } = monthDate(fy, monthIndex);
  return new Date(year, month + 1, 0).getDate();
};

export const entryDateLabel = (day, monthIndex) =>
  day ? `${day} ${months[monthIndex]}` : "";

// Today's date, but only when the cell actually is the current month — a new
// line in a past or future month gets no day rather than a meaningless one.
export const todayInLedgerMonth = (fy, monthIndex) => {
  const { year, month } = monthDate(fy, monthIndex);
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month ? now.getDate() : 0;
};

export const entriesTotal = (list) =>
  (list || []).reduce((t, e) => t + (Number.isFinite(Number(e?.amount)) ? Number(e.amount) : 0), 0);

// Breakdowns are not carried into a new year — last July's receipts are not
// this July's, even where the amount recurs.
const zeroRow = (r) => ({ label: r.label, values: months.map(() => 0), entries: months.map(() => []) });

// What a year inherits when you open one nobody has saved yet.
//
// Fixed costs keep their figures: rent, phone, rego and the like recur at much
// the same amount, so re-typing them every July is busywork. Variable costs and
// income keep only their labels — those are the numbers you actually track, and
// last year's would be wrong the moment they appeared.
export const carryForward = (ledger) => ({
  fixedCost: ledger.fixedCost.map((r) => ({
    label: r.label,
    values: [...r.values],
    entries: months.map(() => []),
  })),
  variableCost: ledger.variableCost.map(zeroRow),
  incomeSources: ledger.incomeSources.map((src) => ({
    label: src.label,
    kind: src.kind,
    rows: src.rows.map(zeroRow),
  })),
});

export const ledgerFor = (fy) => (fy === SEED_YEAR ? years[SEED_YEAR] : carryForward(years[SEED_YEAR]));

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

// The one income source that is always present and always last. Regular sources
// are a wage you type straight into the grid; this is the irregular bucket —
// gifts and one-offs — so it is the only income section with a breakdown.
export const OTHER_INCOME = "other";

export const isOtherIncome = (src) => src?.kind === OTHER_INCOME;

const cleanEntries = (raw) =>
  sortEntries(
  (Array.isArray(raw) ? raw : []).map((e) => {
    // Lines written before the day picker held free text like "1 Jan"; take the
    // first number out of it so nothing typed by hand is lost.
    const fromText = parseInt(String(e?.date ?? "").match(/\d+/)?.[0] ?? "", 10);
    const day = Number(e?.day) || (Number.isFinite(fromText) ? fromText : 0);
    return {
      day: day >= 1 && day <= 31 ? day : 0,
      note: typeof e?.note === "string" ? e.note : "",
      amount: Number.isFinite(Number(e?.amount)) ? Number(e.amount) : 0,
    };
  }),
  );

const cleanRow = (r, fallbackLabel = "") => {
  const entries = months.map((_, i) => cleanEntries(r?.entries?.[i]));
  return {
    label: typeof r?.label === "string" ? r.label : fallbackLabel,
    // A month with a breakdown always takes its total from the lines, so the
    // two can never drift apart no matter what is in the database.
    values: months.map((_, i) => {
      if (entries[i].length) return entriesTotal(entries[i]);
      const n = Number(r?.values?.[i]);
      return Number.isFinite(n) ? n : 0;
    }),
    entries,
  };
};

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

  let cleaned = sources.map((src) => ({
    label: typeof src?.label === "string" ? src.label : "",
    kind: src?.kind === OTHER_INCOME ? OTHER_INCOME : undefined,
    // Weeks are fixed: always exactly five rows, whatever the stored data says.
    rows: WEEKS.map((w, i) => cleanRow(src?.rows?.[i], w)),
  }));

  // Exactly one "other income" source always exists, and always sits last. In
  // ledgers saved before it was marked, the trailing source is the one that
  // played that role, so it keeps its label and simply becomes the pinned one.
  if (!cleaned.length) cleaned = [{ ...blankSource("Other income"), kind: OTHER_INCOME }];
  let otherIdx = cleaned.findIndex((s) => s.kind === OTHER_INCOME);
  if (otherIdx === -1) otherIdx = cleaned.length - 1;
  const [other] = cleaned.splice(otherIdx, 1);
  other.kind = OTHER_INCOME;
  cleaned.push(other);

  out.incomeSources = cleaned;

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
