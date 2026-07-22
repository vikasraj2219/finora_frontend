# Personal Finance Management System — Frontend

A premium, responsive React admin dashboard for the Personal Finance Management System,
built with Vite, MUI, React Router, React Hook Form, and Chart.js — the same stack as the
Loan & Interest Management System frontend. This is a standalone project; it does not share
any code with the loan management frontend.

## Tech Stack
- React 18 + Vite
- React Router v6 (protected routes)
- MUI v5 (Material UI) — light & dark theme
- React Hook Form (validation)
- Axios (with automatic access-token refresh on 401)
- Chart.js + react-chartjs-2 (dashboard/analytics charts, from Phase 5)
- notistack (toast notifications)
- Context API for auth + theme state

## Design System
- **Palette**: Primary Emerald `#146C43`, Accent Gold `#C9A227`, Success `#22C55E`,
  Warning `#F59E0B`, Danger `#EF4444`, light background `#F7F8F5` / dark `#0B1410`
- **Type**: Manrope for headings, Inter for body/data
- **Shape**: 10–12px border radius, soft shadows, 8px spacing grid

All tokens live in `src/theme/palette.js` and `src/theme/typography.js`.

## Folder Structure
```
personal-finance-frontend/
├── src/
│   ├── api/              # axios instance + per-resource API modules
│   ├── components/
│   │   ├── layout/       # Sidebar, Topbar, AppLayout (responsive shell)
│   │   ├── common/       # StatCard, and other shared widgets added per phase
│   │   └── dashboard/    # chart + panel components (Phase 5)
│   ├── context/          # AuthContext, ThemeModeContext
│   ├── hooks/            # shared hooks, added as needed
│   ├── pages/            # one folder per route/module
│   ├── routes/           # ProtectedRoute
│   ├── theme/            # palette, typography, MUI theme factory
│   ├── utils/             # formatters, chart.js registration (added per phase)
│   ├── App.jsx            # providers + route table
│   └── main.jsx           # entry point
├── index.html
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- The backend running locally (see `personal-finance-backend/README.md`)

### Installation
```
cd personal-finance-frontend
npm install
cp .env.example .env   # points to the backend API, defaults to http://localhost:5100/api/v1
npm run dev
```
The app runs at `http://localhost:5174`.

### First login
The backend has no default admin. Open the app and use **"Create the admin account"** on the
login screen — the first user registered automatically becomes admin.

## Build Phases (Frontend)

- **Phase 1: Foundation** — Vite + MUI scaffold matching the loan management
  app's structure, theme system, responsive AppLayout (Sidebar + Topbar with mobile drawer),
  AuthContext + ThemeModeContext, axios instance with auto token refresh, protected routing,
  Login/Register pages wired to the real backend, and a Dashboard placeholder with stat cards.
- **Phase 2: Accounts & Categories** — `/accounts` page with Bank Accounts / UPI
  Accounts / Cash tabs (add, edit, activate/deactivate, delete, manual balance adjustment), and a
  `/categories` page (Income/Expense tabs, add/edit/delete). New shared components: `PageHeader`,
  `StatusChip`, `EmptyState`, `ConfirmDialog`. Dashboard's "Cash in Hand" stat is now wired to real data.
- **Phase 3 (this delivery): Transactions** — `/transactions` page with a single form that adapts to
  income, expense, or transfer; filters (type, category, date range, search); a responsive table on
  desktop that becomes stacked cards on mobile (no horizontal scrolling); pagination. Dashboard's
  Monthly Income / Monthly Expense / Monthly Saving stats are now wired to real data too.
- **Phase 4 (this delivery): Imports & Merchants** — `/imports` is a 3-step wizard (upload →
  review/categorize → done): pick a bank account and a CSV/XLSX/PDF statement, review the parsed
  rows in an editable table (category + merchant per row, likely duplicates pre-unchecked with a
  warning chip), then confirm to create the transactions. `/merchants` is a simple management page
  (merchants are usually created automatically during import, but can be added/edited manually too).
- **Phase 5:** Full Dashboard analytics + charts, wired to real `/dashboard/*` endpoints.
- **Phase 6:** Reports (export UI), Receipt management, Notifications, Settings, mobile
  bottom navigation and native-app polish pass.

## Responsive Behavior
- Sidebar becomes a temporary drawer (hamburger menu) below the `md` breakpoint
- Stat cards reflow from 4-across → 2-across → 1-across using MUI's Grid breakpoints
- Built mobile-first per the design brief; tables/charts get dedicated mobile treatment
  starting Phase 3 once there's real tabular data to display

## Testing Instructions (Phase 1)
1. Start the backend (`npm run dev` in `personal-finance-backend`), then this frontend (`npm run dev`).
2. Visit `http://localhost:5174/register`, create the first (admin) account — you're redirected
   straight into the Dashboard.
3. Refresh the page → confirm you stay logged in (session restored via `/auth/me`).
4. Toggle the theme (moon/sun icon in the top bar) → confirm light/dark persists after a refresh.
5. Resize the browser below ~900px → confirm the sidebar collapses into a drawer opened by the
   hamburger icon.
6. Log out from the avatar menu → confirm you're redirected to `/login` and `/dashboard` is
   no longer accessible without logging in again.
7. Go to **Accounts** → add a bank account with an opening balance → confirm it shows on the
   Dashboard's Cash in Hand card. Add a UPI account and link it to that bank account.
8. Go to **Categories** → confirm default categories (Salary, Food & Dining, etc.) are already
   there from registration → add, edit, and delete a custom category.
9. On **Accounts**, open the Cash tab → adjust the cash balance with a positive and a negative
   amount → confirm the Dashboard total updates accordingly.
10. Go to **Transactions** → add an expense against a bank account → confirm the bank account's
    balance on the Accounts page drops by that amount, and Dashboard's Monthly Expense updates.
11. Add a transfer from that bank account to Cash → confirm the bank balance drops and the cash
    balance rises by the same amount.
12. Edit a transaction's amount → confirm the related balance adjusts to the new amount (not
    double-counted). Delete a transaction → confirm its effect on the balance is reversed.
13. Resize the browser below ~900px on the Transactions page → confirm the table becomes stacked
    cards instead of a horizontally-scrolling table.
14. Go to **Import Statement** → pick a bank account → upload a CSV with columns like
    `Date, Description, Debit, Credit` → confirm the review table shows parsed rows with a
    type badge and amount.
15. On the review screen, assign a category to a few rows, leave one unchecked, then click
    **Import** → confirm the summary shows the right created/skipped counts and the transactions
    now appear on the Transactions page.
16. Import the same file again → confirm the previously-imported rows are now flagged as
    "Possible duplicate" and pre-unchecked.
17. Go to **Merchants** → confirm merchants created during import appear with a running
    transaction count and total, and add one manually with a default category.

## Notes
Every transaction change writes an audit log entry on the backend (`GET /audit-logs`); there's no
dedicated audit log screen yet since that's more useful once Settings (Phase 6) exists to house it.

## License
MIT
