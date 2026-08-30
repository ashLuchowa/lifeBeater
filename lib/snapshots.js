// Per-day snapshots, keyed by "YYYY-MM-DD". Each edited day is stored as its own
// row in Supabase; any day without one inherits the newest snapshot on or
// before it (or the seed). See components/DashboardData.jsx for the fetch/save
// calls and lib/supabase/ for the client setup.

// A week is identified by its Monday, stored as YYYY-MM-DD — the same Monday-to
// -Sunday week the income ledger uses. Keys stay date strings, so string
// ordering is still chronological ordering everywhere.
export function weekStart(s) {
  const d = fromStr(s);
  const dow = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return toStr(d);
}

export const weekEnd = (s) => addDays(weekStart(s), 6);

export const addWeeks = (s, n) => addDays(weekStart(s), n * 7);

export const thisWeek = () => weekStart(todayStr());

// The first week the dashboard has anything to show: the week containing
// 28 Aug 2026, which begins Monday 24 Aug. Nothing before it is reachable.
export const EARLIEST_WEEK = weekStart("2026-08-28");

// Snap to a Monday, then hold it inside [EARLIEST_WEEK, current week].
export const clampWeek = (s, current) => {
  if (!s) return s;
  const w = weekStart(s);
  if (w < EARLIEST_WEEK) return EARLIEST_WEEK;
  return current && w > current ? current : w;
};

// "24 – 30 August, 2026", or "31 August – 6 September, 2026" across a boundary.
export function formatWeek(s) {
  const a = fromStr(weekStart(s));
  const b = fromStr(weekEnd(s));
  const left = a.getMonth() === b.getMonth() ? `${a.getDate()}` : `${a.getDate()} ${MONTHS[a.getMonth()]}`;
  return `${left} – ${b.getDate()} ${MONTHS[b.getMonth()]}, ${b.getFullYear()}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function toStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromStr(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayStr() {
  return toStr(new Date());
}

export function addDays(s, n) {
  const d = fromStr(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

export function formatShort(s) {
  const d = fromStr(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

// Effective data for `dateStr`: the newest snapshot dated on or before it,
// otherwise the seed. Keys are YYYY-MM-DD, so string ordering is date ordering.
export function resolveForDate(map, dateStr, seed) {
  if (!dateStr) return { data: seed, source: null };
  let best = null;
  for (const key of Object.keys(map)) {
    if (key <= dateStr && (best === null || key > best)) best = key;
  }
  return best === null ? { data: seed, source: null } : { data: map[best], source: best };
}
