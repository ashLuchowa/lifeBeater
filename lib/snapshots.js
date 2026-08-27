// Per-day snapshot storage. Each edited day is saved under its own key; any day
// without a snapshot inherits the newest snapshot on or before it (or the seed).

export const STORAGE_KEY = "lookv3:snapshots";

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

export function formatLong(s) {
  const d = fromStr(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function loadAll() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAll(map) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* quota or private mode — ignore */
  }
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
