# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # TypeScript check (tsc -b) + Vite production build
npm run lint       # ESLint (flat config with TS + React plugins)
npm run preview    # Preview production build locally
```

No test runner is configured yet.

## Architecture

This is the **SE Treasury Intelligence Platform** — a dark-themed financial dashboard for managing cash positions, banking partner limits, funding forecasts, and competitive analysis across 22 entities in 16 countries (Middle East & Africa).

**Stack:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + React Router 6 + Zustand

### Layout

Fixed shell: **Topbar** (52px) + **Sidebar** (200px) + scrollable **main content** + **StatusBar** (24px). The layout lives in `src/layouts/DashboardLayout.tsx` and uses React Router's `<Outlet />` for panel switching.

### Routing

`src/router/index.tsx` — 5 routes under `DashboardLayout`:
- `/overview` `/positions` `/limits` `/forecast` `/compete`
- `/` redirects to `/overview`

### Component Pattern

**Pages** (`src/pages/`) are thin wrappers that render **Panels** (`src/components/{domain}/`). Panels compose **UI primitives** (`src/components/ui/`). This three-tier pattern keeps routing separate from business logic and UI.

### State Management

Single Zustand store in `src/store/index.ts` with flat state:
- `sidebarViewMode` — region/country/ARE/bankingPartner toggle
- `selectedEntityCode` — active sidebar entity
- `currencyMode` — EUR/LCY/ACCT_CCY for position tables

### Data Layer

All data is static mock data in `src/data/` as typed constant arrays. No API calls yet. When adding API integration, replace data imports with async fetches — the type shapes in `src/types/` stay the same.

### Design Tokens (Tailwind v4)

Custom colors and fonts are defined in `src/index.css` using the `@theme` block (not tailwind.config). Key tokens:
- Colors: `bg`, `surface`, `surface-2`, `accent`, `muted`, `text-primary`
- Status: `status-green`, `status-amber`, `status-red`, `status-cyan`
- Special: `mto` (purple, for Money Transfer Only entities)
- Fonts: `font-sans` (Epilogue), `font-mono` (JetBrains Mono)

Use these as Tailwind classes: `bg-surface`, `text-muted`, `text-status-red`, `font-mono`, etc.

## Key Conventions

- Always use `cn()` from `src/utils/cn.ts` (clsx + tailwind-merge) when composing conditional classes
- Numeric values and codes use `font-mono`; body text uses `font-sans`
- Status mapping follows a consistent pattern: domain status → `StatusVariant` → Pill/color. See `PositionsPanel.tsx` for the `getStatusVariant()` pattern
- Data files export typed arrays that match interfaces in `src/types/`. The barrel export is `src/types/index.ts`
- Pixel-exact font sizes: `text-[9px]` for labels, `text-[10px]` for secondary, `text-[12px]` for body, `text-[22px]` for KPI values
