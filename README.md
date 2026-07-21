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

- **Phase 1 (this delivery): Foundation** — Vite + MUI scaffold matching the loan management
  app's structure, theme system, responsive AppLayout (Sidebar + Topbar with mobile drawer),
  AuthContext + ThemeModeContext, axios instance with auto token refresh, protected routing,
  Login/Register pages wired to the real backend, and a Dashboard placeholder with stat cards.
- **Phase 2:** Bank & UPI Account management pages (list, add/edit dialogs, cash tracking).
- **Phase 3:** Transactions module — list/filter/search/pagination, add/edit/transfer forms.
- **Phase 4:** Statement import UI, duplicate review, merchant mapping.
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

## License
MIT
