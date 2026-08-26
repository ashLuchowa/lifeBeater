# Dashboard — Next.js

Next.js 14 (App Router), JavaScript only — no TypeScript, no Tailwind. Styling is inline,
matching the design one-to-one. Static presentation only: no add/edit behaviour yet.

## Run

    npm install
    npm run dev

Open http://localhost:3000.

## Structure

| Path | What it is |
| --- | --- |
| `app/page.jsx` | Page shell: 1238×878 panel, three-column body grid |
| `app/layout.jsx` | Html shell, Plus Jakarta Sans, global resets |
| `app/globals.css` | Font import, body background, link colors |
| `components/TopBar.jsx` | Nav pills (Home / Assets & Liabilities / Income / Expense), search, avatar |
| `components/TitleRow.jsx` | "Home", date stepper, Today pill |
| `components/ProfileCard.jsx` | Dark profile card with achievement badges |
| `components/Milestones.jsx` | Milestone rows with progress bars |
| `components/CashflowChart.jsx` | Grouped income/expense bar chart |
| `components/AssetsLiabilities.jsx` | Itemized asset + liability tiles and net worth tile |
| `components/HealthCard.jsx` | Sleep / Steps / Resting HR / Weight-BMI tiles |
| `components/SkillsCard.jsx` | Skills grouped by category |
| `components/BillsCard.jsx` | Upcoming bills list |
| `components/NotesCard.jsx` | Notes checklist |
| `components/ui.jsx` | TitlePill, DotsButton, CardHeader |
| `components/icons.jsx` | Inline SVG icons |
| `lib/data.js` | All displayed content |

## Notes

- Avatars are plain colored circles — swap in `next/image` when real photos exist.
- The panel is fixed-size to match the design. For a fluid app, replace the width/height
  on the panel in `app/page.jsx` with `width: "100%", maxWidth: 1400` and drop the height.
- All content lives in `lib/data.js`; wire it to an API later without touching components.
