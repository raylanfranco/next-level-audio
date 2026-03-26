# Session Handoff — 2026-03-25/26

## What Was Done

### 1. Victory Rush Package Ecosystem
- Created `victory-rush` GitHub org (free tier)
- **`@victory-rush/bayready-core@0.1.0`** — published to GitHub Packages
  - Repo: `victory-rush/bayready-core` (forked from `raylanfranco/bayready-core`)
  - 108 files, 215kB — full NestJS + React + Prisma booking platform
  - GitHub Actions workflow auto-publishes on release
- **`@victory-rush/bayready-automotive@0.1.0`** — published to GitHub Packages
  - Repo: `victory-rush/bayready-automotive`
  - 25 files, 11.3kB — vehicle intake, fitment DB, tint zones, parts tracking

### 2. Infrastructure Renames
- Railway: `bayready-bdccb` → `bayready-core` (domain: `bayready-core-production.up.railway.app`)
- Vercel: `bayready-bdccb` → `bayready-core` (frontend: `bayready-core.vercel.app`)
- VITE_API_URL and FRONTEND_URL updated accordingly

### 3. Billy's BayReady Instance (Bad Decisions Motorcycle & Boat)
- Merchant registered: `cmn6u870r000001n6gicohrsc`
- 4 services: Custom Paint, Powder Coating, Metal Fabrication, Cycle Repair (60-min, $0 TBD)
- Availability: Mon-Fri 9-5, Sat 9-1, Sun closed
- Full E2E booking flow tested and working
- PWA installed on iPad — push notifications confirmed working

### 4. Bug Fixes (committed to `raylanfranco/bayready-core`)
- Vehicle step conditional: `merchant.settings.vertical === 'automotive'`
- Calendar UTC rendering: `getUTCHours()`/`getUTCMinutes()` for booking positioning
- Week range off-by-one: replaced `toISOString()` with `toLocalDateString()` helper
- Dashboard content area scrolling: added `overflow-y-auto` to main content

### 5. Stripe Connect (Standard) — Multi-Tenant Payments
- **Backend:** OAuth flow (`GET /stripe/connect`, callback, disconnect, status)
- **Backend:** `StripeService.createPaymentIntent` uses `Stripe-Account` header for connected merchants
- **Frontend:** SettingsPage Payments section (Connect/Disconnect buttons + toast)
- **Frontend:** BookingPage fetches per-merchant publishable key dynamically
- **Prisma migration:** `stripeAccessToken`, `stripePublishableKey`, `stripeConnected`, `stripeConnectedAt`
- **Env vars added:** `STRIPE_CLIENT_ID`, `STRIPE_REDIRECT_URI` on Railway
- **Stripe Connect verified working** — OAuth flow completes, returns to dashboard
- Live keys activated after Stripe Connect approval came through

### 6. PWA Icons
- Generated 192px, 512px, and 180px (apple-touch-icon) PNGs from logo.svg
- Manifest and index.html updated

### 7. Product Images
- Ran `fill-missing-images.ts` against UPCitemdb API
- Filled previously-null entries with retailer image URLs
- Script added to `scripts/` for future use

### 8. UI Revamp — ATTEMPTED, REVERTED
- Extracted dark amber design system from Variant exports into CSS
- Rewrote DashboardLayout with dark theme (looked good)
- Attempted sed-based reskin of BookingsPage, ServicesPage, CustomersPage, SettingsPage
- **sed on JSX caused pervasive syntax errors** — orphaned double quotes, broken className/style splits
- **Reverted all UI changes** to restore working light theme
- Variant design exports preserved in `bayready-ui-revamp/` for future session

**Lesson learned:** Never use sed to modify JSX/TSX files. Use the Write tool to rewrite components completely, or use Python scripts with proper string handling.

## Current State

### Deployed & Working
- **BayReady Core Backend:** `bayready-core-production.up.railway.app`
- **BayReady Core Frontend:** `bayready-core.vercel.app` (light theme, fully functional)
- **Public booking URL:** `bayready-core.vercel.app/book/cmn6u870r000001n6gicohrsc`
- **Dashboard login:** `bayready-core.vercel.app/login`

### Stripe Connect
- Live keys active, OAuth flow working
- Billy needs to connect his Stripe via the dashboard Settings page
- Ben needs Stripe keys wired when he migrates to core

## Next Session Priorities

### 1. UI Revamp (Dark Amber Theme) — REDO
- Variant exports ready in `bayready-ui-revamp/`
- Approach: rewrite each component file completely (Write tool), NOT sed
- Order: DashboardLayout → BookingsPage → ServicesPage → CustomersPage → SettingsPage
- Design system CSS already extracted (revert undid it, but it's in bayready-ui-revamp/index.css)

### 2. Billy's Stripe Test
- Connect Stripe via dashboard Settings
- Test booking with deposit using test card 4242...
- Verify PaymentIntent in Billy's Stripe dashboard

### 3. Ben (NLA) Migration
- Get Stripe API keys
- Set `merchant.settings.vertical = 'automotive'`
- Update BookingWizardModal iframe URL
- Test automotive booking flow

### 4. Outstanding Items
- Product images: some still wrong/null in `data/product-images.json`
- Wire up auth protection for NLA account pages
- Fitment migration + seed on Railway
- Android Phases 4-7
