// Per-day snapshots, keyed by "YYYY-MM-DD". Each edited day is stored as its own
// row in Supabase; any day without one inherits the newest snapshot on or
// before it (or the seed). See components/DashboardData.jsx for the fetch/save
// calls and lib/supabase/ for the client setup.

// The first day the dashboard has anything to show. There is no history before
// it, so the arrows stop here and the calendar will not offer an earlier day.
export const EARLIEST_DATE = "2026-08-28";

// Keys are YYYY-MM-DD, so string ordering is date ordering.
export const clampDate = (s, today) => {
  if (!s) return s;
  if (s < EARLIEST_DATE) return EARLIEST_DATE;
  return today && s > today ? today : s;
};

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

export function formatLong(s) {
  const d = fromStr(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
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
