export const profile = {
  name: "Ash Luchowa",
  age: 37,
  city: "Perth",
  country: "AU",
  badges: [
    { label: "Verified", dot: "#e0a92a" },
    { label: "Debt-free", dot: "#c9e88a" },
    { label: "5 yrs tracking", dot: "#4fbfd6" },
    { label: "Top saver", dot: "#f2a3a6" },
    { label: "Goal setter", dot: "#c9cfe6" },
    { label: "Forklift certified", dot: "#e0a92a" },
    { label: "Emergency fund", dot: "#c9e88a" },
  ],
};

export const milestones = [
  { name: "Debt-free milestone", progress: "68%" },
  { name: "6-month emergency fund", progress: "100%" },
  { name: "$300k net worth", progress: "95%" },
  { name: "Max out 401k", progress: "100%" },
  { name: "Save 30% of income", progress: "42%" },
];

export const cashflow = [
  { month: "Oct", inH: "62%", exH: "48%" },
  { month: "Nov", inH: "70%", exH: "52%" },
  { month: "Dec", inH: "58%", exH: "66%" },
  { month: "Jan", inH: "76%", exH: "50%" },
  { month: "Feb", inH: "82%", exH: "57%" },
  { month: "Mar", inH: "94%", exH: "61%" },
];

export const ledgers = [
  {
    label: "Assets",
    total: "$482,600",
    bg: "#fbecc4",
    bar: "#e0a92a",
    items: [
      { name: "Primary residence", value: "$310,000" },
      { name: "Brokerage", value: "$96,400" },
      { name: "Retirement (401k)", value: "$54,700" },
      { name: "Cash & savings", value: "$21,500" },
    ],
  },
  {
    label: "Liabilities",
    total: "$196,400",
    bg: "#fbd9da",
    bar: "#dd6f74",
    items: [
      { name: "Mortgage", value: "$164,800" },
      { name: "Auto loan", value: "$18,300" },
      { name: "Student loan", value: "$9,100" },
      { name: "Credit cards", value: "$4,200" },
    ],
  },
];

export const netWorth = {
  amount: "$286,200",
  caption: "Assets minus liabilities",
  assetShare: 71,
};

export const health = [
  { label: "Sleep", value: "7h 12m", note: "Avg last 7 days", bg: "#fbecc4", dot: "#e0a92a" },
  { label: "Steps", value: "8,430", note: "84% of daily goal", bg: "#dff1e4", dot: "#4a9c68" },
  { label: "Resting HR", value: "62 bpm", note: "Down 3 from March", bg: "#fbd9da", dot: "#dd6f74" },
  { label: "Weight / BMI", value: "74 kg · 23.1", note: "Healthy range", bg: "#dcecf7", dot: "#4fbfd6" },
];

export const skillGroups = [
  {
    category: "Logistics / Warehouse",
    items: ["Forklift", "HR-B licence", "Stock control"],
  },
  {
    category: "Computer",
    items: ["UI/UX", "HTML", "JavaScript", "Programming"],
  },
];

export const bills = [
  { name: "Mortgage", due: "Due 1 Sep", amount: "$1,840" },
  { name: "Car insurance", due: "Due 4 Sep", amount: "$126" },
  { name: "Power & gas", due: "Due 9 Sep", amount: "$188" },
  { name: "Phone plan", due: "Due 12 Sep", amount: "$45" },
];

export const notes = [
  { text: "Review KiwiSaver contribution rate", done: false },
  { text: "Cancel unused gym membership", done: true },
  { text: "Get quote for car insurance renewal", done: false },
  { text: "Set up automatic savings transfer", done: true },
  { text: "Book forklift recertification", done: false },
];

// Baseline used for any day that has no saved snapshot on or before it.
export const seedData = {
  profile,
  milestones,
  cashflow,
  ledgers,
  netWorth,
  health,
  skillGroups,
  bills,
  notes,
};
