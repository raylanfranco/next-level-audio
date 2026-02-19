# Next Level Audio + BayReady — Complete Project Documentation

This document is the single source of truth for whitelabeling and extending both projects. It instructs Claude Code sessions on exactly how to recreate, modify, and deploy everything.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [NLA Website — Next.js Frontend](#nla-website)
3. [BayReady — Booking Platform](#bayready)
4. [Clover POS Integration](#clover-pos-integration)
5. [Design System](#design-system)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)
8. [Whitelabel Guide](#whitelabel-guide)
9. [Gotchas & Lessons Learned](#gotchas)

---

## Architecture Overview

Two interconnected projects:

```
next-level-audio/          ← NLA: Customer-facing website (Next.js on Vercel)
├── app/                   ← Pages & API routes
├── components/            ← React components
├── lib/                   ← Clover client, Supabase, Resend email
├── types/                 ← TypeScript interfaces
├── hooks/                 ← Custom hooks
├── data/                  ← Static JSON data
└── bayready/              ← BayReady: Booking platform (monorepo subfolder)
    ├── backend/           ← NestJS API (Railway)
    │   ├── src/           ← Modules: clover, merchant, service, booking, customer, vehicle, payment
    │   └── prisma/        ← Schema + migrations
    └── frontend/          ← React + Vite (Vercel)
        └── src/           ← Pages, components, types
```

**How they connect:** NLA embeds BayReady's public booking page (`/book/:merchantId`) inside an iframe via `BookingWizardModal.tsx`. Product purchases go through NLA's own Clover checkout. Appointment bookings go through BayReady.

---

## NLA Website

### Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (PostCSS plugin, NOT tailwind.config.js — config via `@theme inline` in `app/globals.css`)
- **Database:** Supabase (PostgreSQL) — for inquiries, bookings, contact submissions
- **Email:** Resend — sends notifications to admin email
- **Payments:** Clover Ecommerce Hosted iFrame SDK
- **Deployment:** Vercel

### Pages (app/ directory)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage — hero, stats counter, featured products, services, video |
| `/products` | `app/products/page.tsx` | Product catalog from Clover inventory — filterable by category, search, stock |
| `/services` | `app/services/page.tsx` | Service listings (car audio, tinting, remote start, etc.) |
| `/gallery` | `app/gallery/page.tsx` | Photo gallery of completed work |
| `/contact` | `app/contact/page.tsx` | Contact form (sends email via Resend) |
| `/admin` | `app/admin/page.tsx` | Admin dashboard — inventory, orders, payments, customers, bookings, inquiries |

### API Routes (app/api/)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/clover/inventory` | GET | Fetch items from Clover with category/search filters |
| `/api/clover/categories` | GET | Fetch product categories from Clover |
| `/api/clover/orders` | GET | Fetch orders from Clover |
| `/api/clover/payments` | GET | Fetch payments from Clover |
| `/api/clover/customers` | GET | Fetch customers from Clover |
| `/api/clover/charge` | POST | Charge a tokenized card via Clover ecommerce |
| `/api/clover/pakms` | GET | Fetch PAKMS API key for Clover SDK initialization |
| `/api/products` | GET | Fetch products (wrapper for Clover inventory) |
| `/api/products/[id]` | GET | Fetch single product detail |
| `/api/product-image` | GET | Get product image from cache/mapping |
| `/api/featured-products` | GET | Get featured products for homepage |
| `/api/contact` | POST | Submit contact form (sends Resend email) |
| `/api/inquiries` | GET/POST | List/create product inquiries |
| `/api/inquiries/[id]` | PATCH | Update inquiry status |
| `/api/bookings` | GET/POST | List/create bookings (proxied from BayReady or direct) |
| `/api/bookings/[id]` | PATCH/DELETE | Update/delete bookings |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `ClientLayout` | `components/ClientLayout.tsx` | Wraps app in CartProvider + BookingModalProvider |
| `ConditionalLayout` | `components/ConditionalLayout.tsx` | Shows Header/Footer for non-admin routes, scanline effect |
| `Header` | `components/layout/Header.tsx` | Navigation bar with cart icon, mobile menu |
| `Footer` | `components/layout/Footer.tsx` | Footer with links, social, business info |
| `AnimateOnScroll` | `components/AnimateOnScroll.tsx` | Scroll-triggered CSS animations (uses `useInView` hook) |
| `HeroSection` | `components/HeroSection.tsx` | Homepage hero with staggered entrance |
| `StatsCounter` | `components/StatsCounter.tsx` | Animated counter for business stats |
| `ProductsSection` | `components/ProductsSection.tsx` | Featured products grid on homepage |
| `VideoSection` | `components/VideoSection.tsx` | Embedded video section |
| `VideoLightbox` | `components/VideoLightbox.tsx` | Lightbox for video playback |
| `QuoteCalculator` | `components/QuoteCalculator.tsx` | Service price estimator |
| `BookingWizardModal` | `components/BookingWizardModal.tsx` | iFrame wrapper for BayReady booking page |
| `BookingModalContext` | `components/BookingModalContext.tsx` | React context for booking modal open/close state |
| `CheckoutModal` | `components/CheckoutModal.tsx` | Full product checkout flow with Clover card iframe |
| `CartContext` | `components/CartContext.tsx` | Shopping cart state with localStorage persistence (`nla-cart`) |
| `InquiryModal` | `components/InquiryModal.tsx` | Product inquiry/backorder form |

### Lib Files

| File | Purpose |
|------|---------|
| `lib/clover/client.ts` | Clover API client — `cloverFetch()` function, `isCloverConfigured` check |
| `lib/supabase/client.ts` | Supabase client (browser) + `createServerClient()` (admin) |
| `lib/email/resend.ts` | Resend email functions: `sendInquiryNotification()`, `sendContactNotification()` |
| `lib/mockProducts.ts` | Fallback mock products if Clover API is down |

### Types

| File | Key Types |
|------|-----------|
| `types/clover.ts` | `CloverItem`, `CloverOrder`, `CloverPayment`, `CloverCustomer`, `CloverCategory` |
| `types/booking.ts` | `Booking`, `BookingStatus` |
| `types/inquiry.ts` | `Inquiry`, `InquiryStatus`, `InquiryFormData` |
| `types/product.ts` | Product type definitions |
| `types/shopify.ts` | Legacy Shopify types (unused — migrated to Clover) |

### Checkout Flow (Product Purchases)

1. Customer browses `/products`, adds items to cart (stored in `CartContext` → localStorage `nla-cart`)
2. Opens `CheckoutModal` from cart icon
3. **Cart step:** Review items, quantities, total
4. **Payment step:**
   - Loads Clover SDK script (`checkout.clover.com/sdk.js`)
   - Fetches PAKMS API key from `/api/clover/pakms`
   - Initializes `new Clover(apiAccessKey, { merchantId })` — **NOT** `{ publishableKey }`
   - Creates individual card elements: `CARD_NUMBER`, `CARD_DATE`, `CARD_CVV`, `CARD_POSTAL_CODE`
   - **CRITICAL:** Do NOT listen for `ready` event — it throws an error. Only supported events: `blur`, `change`, `focus`, `paymentMethod`
   - Customer enters card info directly into Clover iframe (PCI compliant)
   - On submit: `clover.createToken()` returns `{ token?, errors? }` — NOT a plain string
   - Token sent to `/api/clover/charge` → backend charges via Clover ecommerce API
5. **Success/Error step:** Shows result with charge reference ID

---

## BayReady

### Tech Stack
- **Backend:** NestJS + Prisma v7 + PostgreSQL (Railway)
- **Frontend:** React 18 + Vite + TailwindCSS
- **Auth:** Clover OAuth v2 (merchant onboarding)
- **Payments:** Clover Ecommerce Hosted iFrame SDK

### Backend Modules (NestJS)

| Module | Path | Purpose |
|--------|------|---------|
| `PrismaModule` | `src/prisma/` | Database service with Prisma v7 adapter pattern |
| `CloverModule` | `src/clover/` | OAuth flow, token management, charges, Clover API proxy |
| `MerchantModule` | `src/merchant/` | Merchant CRUD, settings, onboarding |
| `ServiceModule` | `src/service/` | Service definitions (name, category, price, duration, parts mappings) |
| `CustomerModule` | `src/customer/` | Customer find-or-create, CRUD |
| `VehicleModule` | `src/vehicle/` | Vehicle records linked to customers |
| `BookingModule` | `src/booking/` | Booking CRUD, availability slots, overlap detection |
| `PaymentModule` | `src/payment/` | Card charge endpoint (wraps CloverService.createCharge) |

### Prisma Schema (Key Models)

```
Merchant → has many: Service, Customer, Booking, AvailabilityRule, BlockedDate
  - cloverMerchantId (unique), OAuth tokens, timezone, settings (JSON)

Service → belongs to Merchant, has many Booking
  - name, category, durationMins, priceCents, partsMappings (JSON)

Customer → belongs to Merchant, has many Vehicle, Booking
  - name, email, phone, unique per [merchantId, email]

Vehicle → belongs to Customer, has many Booking
  - year, make, model, trim, photos (JSON)

Booking → belongs to Merchant, Service, Customer, Vehicle?
  - startsAt, endsAt, status (enum), intakeData (JSON)
  - depositAmountCents, depositPaidAt, cloverChargeId

AvailabilityRule → belongs to Merchant
  - dayOfWeek (0-6), startTime, endTime, isBlocked
  - unique per [merchantId, dayOfWeek]

BlockedDate → belongs to Merchant
  - date, reason — blocks specific days off
```

### Backend API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/clover/authorize` | Get Clover OAuth authorization URL |
| GET | `/clover/oauth/callback` | Handle OAuth callback, exchange code for tokens |
| GET | `/merchants` | List all merchants |
| GET | `/merchants/:id` | Get merchant by ID (includes settings) |
| PATCH | `/merchants/:id` | Update merchant (settings, hours, etc.) |
| GET | `/merchants/:id/services` | List services for a merchant |
| POST | `/merchants/:id/services` | Create a service |
| PATCH | `/services/:id` | Update a service |
| DELETE | `/services/:id` | Delete a service |
| GET | `/merchants/:id/customers` | List customers for a merchant |
| POST | `/merchants/:id/customers` | Create a customer |
| GET | `/merchants/:id/vehicles` | List vehicles |
| POST | `/vehicles` | Create a vehicle |
| GET | `/merchants/:id/bookings` | List bookings (filterable by status, date range) |
| POST | `/merchants/:id/bookings` | Create a booking (with overlap detection) |
| PATCH | `/bookings/:id/status` | Update booking status |
| GET | `/merchants/:id/bookings/slots` | Get available time slots for a date + service |
| POST | `/payments/charge` | Charge a tokenized card via Clover |

### Frontend Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `LandingPage.tsx` | BayReady marketing landing page |
| `/book/:merchantId` | `BookingPage.tsx` | Public booking wizard (5 steps) |
| `/dashboard` | — | Redirects to bookings |
| `/dashboard/bookings` | `BookingsPage.tsx` | Calendar view + booking management |
| `/dashboard/services` | `ServicesPage.tsx` | Service CRUD |
| `/dashboard/customers` | `CustomersPage.tsx` | Customer list |
| `/dashboard/settings` | `SettingsPage.tsx` | Business hours, availability rules, blocked dates |

### Booking Wizard Flow (BookingPage.tsx)

5 steps: **Service → Date & Time → Vehicle Intake → Your Info → Confirm**

1. **Service:** Two-phase selection — first picks a category (if multiple exist), then picks a service within that category. If only one category exists, skips straight to service list. Shows price + duration.
2. **Date & Time:** Calendar grid (CalendarGrid.tsx) → picks a date → fetches `/merchants/:id/bookings/slots?serviceId=X&date=Y` → shows available time slots
3. **Vehicle Intake:** VehicleSelector (year/make/model/trim dropdowns) + IntakeQuestionnaire (dynamic questions based on service)
4. **Your Info:** Name, email, phone
5. **Confirm:** Summary of all selections → POST to `/merchants/:id/bookings`

### Frontend Components

| Component | File | Purpose |
|-----------|------|---------|
| `BookingBlock` | `BookingBlock.tsx` | Individual booking card in calendar view |
| `CalendarGrid` | `CalendarGrid.tsx` | Month calendar with booking indicators |
| `VehicleSelector` | `VehicleSelector.tsx` | Year/Make/Model/Trim cascading dropdowns (NHTSA API) |
| `IntakeQuestionnaire` | `IntakeQuestionnaire.tsx` | Dynamic service-specific questions |
| `CloverCardForm` | `CloverCardForm.tsx` | Clover hosted iframe card form for deposits |

---

## Clover POS Integration

### Two Separate Clover Integrations

**NLA (Next.js):** Direct integration using merchant API token + ecommerce keys.
- Inventory reads: `CLOVER_API_TOKEN` (merchant API token) → `api.clover.com/v3/merchants/{id}/items`
- Card charges: `CLOVER_ECOMM_PRIVATE_KEY` → `scl.clover.com/v1/charges`
- Card tokenization: `CLOVER_ECOMM_PUBLIC_KEY` → Clover hosted iframe SDK

**BayReady (NestJS):** OAuth-based integration for multi-merchant support.
- OAuth onboarding: Merchant authorizes via Clover OAuth v2 → tokens stored in DB
- API calls: Auto-refreshing OAuth access tokens → `api.clover.com/v3/merchants/{id}/...`
- Card charges: `CLOVER_ECOMM_PRIVATE_KEY` env var (or falls back to OAuth token)

### Clover SDK Initialization

```typescript
// Load script
const script = document.createElement('script');
script.src = 'https://checkout.clover.com/sdk.js';

// Initialize
const clover = new window.Clover(apiAccessKey, { merchantId });
// NOT { publishableKey } — it's the second positional arg with { merchantId }

// Create elements
const elements = clover.elements();
const cardNumber = elements.create('CARD_NUMBER', styles);
const cardDate = elements.create('CARD_DATE', styles);
const cardCvv = elements.create('CARD_CVV', styles);
const cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);

// Mount (ensure DOM elements exist first — use setTimeout if needed)
cardNumber.mount('#card-number');
cardDate.mount('#card-date');
cardCvv.mount('#card-cvv');
cardPostalCode.mount('#card-postal-code');

// CRITICAL: Do NOT listen for 'ready' event — it throws an error!
// Supported events: blur, change, focus, paymentMethod

// Tokenize
const result = await clover.createToken();
// result = { token?: string, errors?: Record<string, string> }
// NOT a plain string — check result.token and result.errors
```

### Charge Flow

```
[Customer Card] → [Clover Iframe] → createToken() → { token }
  → POST /api/clover/charge (NLA) or POST /payments/charge (BayReady)
  → Bearer {CLOVER_ECOMM_PRIVATE_KEY}
  → POST https://scl.clover.com/v1/charges (production)
  → POST https://scl-sandbox.dev.clover.com/v1/charges (sandbox)
  → { id, amount, status, paid }
```

### Sandbox vs Production URLs

| Purpose | Sandbox | Production |
|---------|---------|------------|
| SDK script | `checkout.sandbox.dev.clover.com/sdk.js` | `checkout.clover.com/sdk.js` |
| Charge endpoint | `scl-sandbox.dev.clover.com/v1/charges` | `scl.clover.com/v1/charges` |
| REST API | `apisandbox.dev.clover.com/v3/merchants/` | `api.clover.com/v3/merchants/` |
| OAuth (browser) | `sandbox.dev.clover.com/oauth/v2/authorize` | `www.clover.com/oauth/v2/authorize` |
| Test card | `4242 4242 4242 4242` (any future exp, any CVV) | Real cards only |

### Current Setup (Full Production)

Both NLA and BayReady are running in **full production mode** — real inventory reads AND real charges:

- `CLOVER_API_TOKEN` + `CLOVER_API_BASE_URL=https://api.clover.com` → production inventory reads
- `CLOVER_ECOMM_PUBLIC_KEY` + `CLOVER_ECOMM_PRIVATE_KEY` → production ecomm keys for charges
- `CLOVER_CHARGE_ENV=production` → routes charges to production endpoint
- `NEXT_PUBLIC_CLOVER_MERCHANT_ID=5C5J719BX6571` → production merchant ID (for SDK initialization)
- CheckoutModal SDK URL: `https://checkout.clover.com/sdk.js`

**To revert to sandbox for testing:** Set `CLOVER_CHARGE_ENV=sandbox`, swap ecomm keys to sandbox values, set `NEXT_PUBLIC_CLOVER_MERCHANT_ID` to sandbox merchant ID, and change SDK URL in `CheckoutModal.tsx` to `https://checkout.sandbox.dev.clover.com/sdk.js`.

### Token Types (Easy to Confuse!)

| Token | Where to Get | Used For |
|-------|-------------|----------|
| Merchant API Token | Clover Dashboard > Setup > API Tokens | Inventory reads (`/v3/merchants/...`) |
| Ecomm Public Key | Clover Dashboard > Setup > Ecommerce | SDK iframe initialization |
| Ecomm Private Key | Clover Dashboard > Setup > Ecommerce | Charge endpoint Authorization header |
| OAuth Access Token | From OAuth flow (stored in DB) | Multi-merchant API access (BayReady) |

**Important:** Merchant API token and ecomm private key are DIFFERENT tokens. The merchant API token is for REST API reads. The ecomm private key is for `/v1/charges`. Don't mix them up.

---

## Design System

### NLA Theme (Cyberpunk)

- **Primary color:** `#00A0E0` (cyan/neon blue)
- **Background:** `#0a0a0a` (near-black)
- **Fonts:**
  - Headings: `Oxanium` (via `--font-oxanium`)
  - Body/code: `Geist Mono` (via `--font-geist-mono`)
  - Sans fallback: `Geist` (via `--font-geist-sans`)
- **Global rule:** `* { border-radius: 0 !important; }` — NO rounded corners anywhere
- **Config:** Tailwind v4 with `@theme inline` in `app/globals.css` — no `tailwind.config.js`

### CSS Classes (globals.css)

| Class | Effect |
|-------|--------|
| `neon-glow` | Cyan text shadow (strong) |
| `neon-glow-soft` | Cyan text shadow (subtle) on white text |
| `neon-border` | Cyan box shadow (strong, with inset) |
| `neon-border-soft` | Cyan box shadow (medium) |
| `pulse-glow` | Animated pulsing cyan box shadow |
| `cyber-button` | Button with sweep highlight on hover |
| `cyber-grid` | Background grid lines at 50px intervals |
| `glitch-text` | Glitch animation with magenta/cyan |
| `hover-glitch` | Skew glitch on hover (for headings) |
| `scanline` | Fixed animated scanline across viewport |
| `scrollbar-hide` | Hides scrollbar (cross-browser) |
| `line-clamp-2` | Two-line text truncation |

### Animation Classes

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-fade-up` | Fade in + slide up 30px | 0.7s |
| `animate-fade-in` | Fade in only | 0.6s |
| `animate-slide-left` | Fade in + slide from right 60px | 0.7s |
| `animate-slide-right` | Fade in + slide from left 60px | 0.7s |
| `animate-scale-up` | Fade in + scale from 0.92 | 0.6s |
| `hero-stagger` | Hero-specific entrance (opacity 0 → 1, translateY) | 0.8s |

Stagger delays: `stagger-1` (0.1s) through `stagger-6` (0.6s), `hero-stagger-1` through `hero-stagger-4`.

### AnimateOnScroll Usage

```tsx
import AnimateOnScroll from '@/components/AnimateOnScroll';

// In a server component — AnimateOnScroll is 'use client' but can be imported from server components
<AnimateOnScroll animation="fade-up" delay={0.2}>
  <div>Content appears on scroll</div>
</AnimateOnScroll>
```

### Cart Pattern

```tsx
import { useCart } from '@/components/CartContext';

const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, openCheckout } = useCart();

// Add item (price in cents)
addItem({ id: 'clover-item-id', name: 'Product Name', price: 9999, imageUrl: '/img.jpg' });
```

Cart persists to `localStorage` key `nla-cart`.

---

## Environment Variables

### NLA (.env.local on Vercel)

```bash
# Clover (Production)
CLOVER_API_TOKEN=              # Merchant API token — for /v3/merchants/... reads
CLOVER_API_BASE_URL=           # https://api.clover.com (prod) or https://apisandbox.dev.clover.com (sandbox)
CLOVER_MERCHANT_ID=            # Production merchant ID (server-side only)
NEXT_PUBLIC_CLOVER_MERCHANT_ID= # Merchant ID for frontend SDK — must match charge environment
CLOVER_ECOMM_PUBLIC_KEY=        # Ecomm public key for iframe SDK
CLOVER_ECOMM_PRIVATE_KEY=       # Ecomm private key for /v1/charges
CLOVER_CHARGE_ENV=              # "sandbox" or "production" — overrides URL derivation

# Supabase
NEXT_PUBLIC_SUPABASE_URL=       # Supabase project URL (also used as direct PostgreSQL connection string)
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (for admin operations)

# Email
RESEND_API_KEY=                 # Resend API key for sending emails
```

### BayReady Backend (.env on Railway)

```bash
DATABASE_URL=                   # Railway internal PostgreSQL URL
CLOVER_APP_ID=                  # Clover OAuth App ID
CLOVER_APP_SECRET=              # Clover OAuth App Secret
CLOVER_API_BASE_URL=            # https://www.clover.com (prod) or https://sandbox.dev.clover.com (sandbox)
CLOVER_ECOMM_PRIVATE_KEY=       # Ecomm private key for charges
FRONTEND_URL=                   # Comma-separated allowed origins for CORS
PORT=                           # Railway assigns this (default 3001 locally)
```

### BayReady Frontend (.env on Vercel)

```bash
VITE_API_URL=                   # Backend API URL (https://bayready-production.up.railway.app)
VITE_CLOVER_ECOMM_PUBLIC_KEY=   # Ecomm public key for iframe SDK
VITE_CLOVER_MERCHANT_ID=        # Merchant ID for SDK initialization
```

---

## Deployment

### NLA Website (Vercel)

- **Repo:** `raylanfranco/next-level-audio` (or appropriate repo)
- **Framework:** Next.js (auto-detected by Vercel)
- **Build:** `next build`
- **Root:** `/` (project root)
- **Node version:** 18+ required

### BayReady Backend (Railway)

- **Repo:** `raylanfranco/bayready`, root: `/backend`
- **Build:** `prisma generate && nest build`
- **Start:** `node dist/src/main` (specified in `Procfile`)
- **Must bind `0.0.0.0`** in `main.ts` for Railway
- **Prisma v7 note:** Uses adapter pattern — `@prisma/adapter-pg` + `pg` pool. No `datasourceUrl` in Prisma client options.

### BayReady Frontend (Vercel)

- **Repo:** `raylanfranco/bayready`, root: `/frontend`
- **Framework:** Vite (React)
- **Build:** `npm run build`
- **Requires `vercel.json`** with SPA rewrites:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

### CORS Configuration

BayReady backend needs `FRONTEND_URL` env var with comma-separated origins:
```
https://bayready.vercel.app,https://next-level-audio.vercel.app,http://localhost:5173
```

NLA embeds BayReady in an iframe — the iframe's `sandbox` attribute must include:
```
allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox
```

---

## Whitelabel Guide

### Step 1: Fork & Rename

1. Fork both repos (or the monorepo)
2. Search-and-replace business-specific strings:
   - `Next Level Audio` → new business name
   - `nextlevelaudio` → new business slug
   - `NLA` / `nla` → new abbreviation
   - Phone number `(570) 730-4433` → new phone
   - Email `nextlevelauto@ymail.com` → new admin email (in `lib/email/resend.ts`)
   - Address in Footer component → new address

### Step 2: Clover Setup

1. **Create Clover developer account** at [clover.com/developers](https://www.clover.com/developers)
2. **Create an app** (for BayReady OAuth): Get App ID + App Secret
3. **Generate ecommerce keys** from merchant dashboard:
   - Dashboard > Setup > Ecommerce > "Create API Token"
   - Select "Hosted iFrame + API/SDK" type
   - Get public key + private key
4. **Get merchant API token** for inventory reads:
   - Dashboard > Setup > API Tokens
5. Set all env vars per the Environment Variables section above

### Step 3: Supabase Setup

1. Create a Supabase project
2. Get the project URL, anon key, and service role key
3. Create required tables:
   - `inquiries` — for product inquiries/backorders
   - (bookings and other data are in BayReady's Railway PostgreSQL)

### Step 4: Design Customization

1. **Colors:** Edit CSS variables in `app/globals.css`:
   ```css
   :root {
     --neon-blue: #YOUR_PRIMARY_COLOR;
     --neon-blue-dark: #YOUR_DARKER_SHADE;
     --neon-blue-light: #YOUR_LIGHTER_SHADE;
   }
   ```
   Also search-and-replace `#00A0E0` across all component files (used as Tailwind arbitrary values like `text-[#00A0E0]`).

2. **Fonts:** Edit `app/layout.tsx` to import different Google Fonts. Update `@theme inline` in `globals.css`.

3. **Border radius:** Remove `* { border-radius: 0 !important; }` from `globals.css` if you want rounded corners.

4. **Animations:** Modify keyframes in `globals.css` or remove the `scanline` div from `ConditionalLayout.tsx`.

5. **Business content:** Update:
   - `components/HeroSection.tsx` — hero text, images
   - `app/services/page.tsx` — service descriptions
   - `app/gallery/page.tsx` — gallery images
   - `components/layout/Footer.tsx` — business info, links
   - `data/product-images.json` — product image mappings

### Step 5: BayReady Customization

1. **Services:** Configured per-merchant in the BayReady dashboard (`/dashboard/services`)
2. **Business hours:** Configured in dashboard settings (`/dashboard/settings`)
3. **Booking page branding:** Edit `frontend/src/pages/BookingPage.tsx`
4. **Embed URL:** Update `BOOKING_URL` in NLA's `components/BookingWizardModal.tsx` with new merchant ID

### Step 6: Email Setup

1. Set up Resend account at [resend.com](https://resend.com)
2. Add your domain for custom `from` addresses (or use `onboarding@resend.dev` for testing)
3. Update `FROM_EMAIL` and `ADMIN_EMAIL` in `lib/email/resend.ts`

### Step 7: Deploy

1. **NLA:** Connect repo to Vercel, set env vars, deploy
2. **BayReady Backend:** Connect repo to Railway, set root to `/backend`, add Procfile, set env vars
3. **BayReady Frontend:** Connect repo to Vercel, set root to `/frontend`, add `vercel.json`, set env vars
4. **Clover onboarding:** Visit `{backend-url}/clover/authorize` to initiate OAuth for the merchant

---

## Gotchas

### Clover SDK
- **`ready` event is NOT supported** on Clover elements. Listening for it throws `Uncaught Error`. Only use `blur`, `change`, `focus`, `paymentMethod` events.
- **`createToken()` returns an object**, not a string: `{ token?: string, errors?: Record<string, string> }`.
- **Constructor syntax:** `new Clover(apiKey, { merchantId })` — second argument is an options object with `merchantId`, NOT `publishableKey`.
- **Mount timing:** Card elements need their DOM containers to exist before mounting. Use `setTimeout(() => { element.mount('#id') }, 100)` if mounting in a React effect.

### Clover Charges
- The charge endpoint uses the **ecomm private key** (NOT the merchant API token).
- Include `accept: 'application/json'` and `x-forwarded-for` headers for best results.
- Sandbox test card: `4242 4242 4242 4242` (any future exp, any 3-digit CVV, any ZIP).
- **Sandbox and production charge URLs are completely different hosts** — you can't just swap the base URL. Production: `scl.clover.com`, Sandbox: `scl-sandbox.dev.clover.com`.

### Prisma v7 (BayReady)
- No `datasourceUrl` in PrismaClient options — use the adapter pattern (`@prisma/adapter-pg` + `pg.Pool`).
- Schema `datasource db` block has `provider` only, no `url` — connection string comes from `prisma.config.ts` or adapter.
- Must run `prisma generate` before `nest build` (client needs to be generated before TypeScript compilation).
- NestJS doesn't auto-load `.env` — add `import 'dotenv/config'` at top of `main.ts`.

### Tailwind CSS v4 (NLA)
- No `tailwind.config.js` — all config is in `app/globals.css` using `@theme inline { }`.
- Use `@import "tailwindcss"` at top of globals.css (not `@tailwind base; @tailwind components; @tailwind utilities`).
- Custom theme values go inside the `@theme inline` block as CSS custom properties.

### Next.js App Router
- Server components CAN import client components — you don't need `'use client'` on a page just because it renders client components.
- `page.tsx` (like the homepage) is a server component by default. It imports `AnimateOnScroll` (a client component) and that works fine.
- API routes in `app/api/` use `NextRequest`/`NextResponse` (not the old `req`/`res` pattern).

### Admin Page
- Located at `/admin` — hidden from public navigation, protected by Supabase Auth.
- `ConditionalLayout.tsx` detects `/admin` routes and hides Header/Footer/scanline.
- Has its own theme system (`AdminThemeProvider`) with dark/light toggle.
- **Authentication:** Supabase Auth with email/password via `middleware.ts`. Unauthenticated users are redirected to `/admin/login`. Login page at `app/admin/login/page.tsx`. Logout calls `supabase.auth.signOut()`.
- Auth clients: `lib/supabase/browser.ts` (browser singleton), `lib/supabase/server.ts` (server-side with cookies), `lib/supabase/middleware.ts` (SSR client for middleware checks).

### Environment Decoupling
- NLA uses `CLOVER_CHARGE_ENV` to decouple charge routing from inventory API base URL. This allows switching between sandbox/production charges independently.
- BayReady derives charge URL from `CLOVER_API_BASE_URL` — if it contains "sandbox", charges go to sandbox endpoint.
- **Current state:** Both NLA and BayReady are fully on production.

### Switching Production → Sandbox (For Testing)

**NLA:**
1. `CheckoutModal.tsx`: Change SDK URL to `https://checkout.sandbox.dev.clover.com/sdk.js`
2. `.env.local`: Set sandbox ecomm keys, set `CLOVER_CHARGE_ENV=sandbox`, set `NEXT_PUBLIC_CLOVER_MERCHANT_ID` to sandbox merchant ID
3. Vercel env vars: Update to match

**BayReady:**
1. `CloverCardForm.tsx`: Change SDK URL to `https://checkout.sandbox.dev.clover.com/sdk.js`
2. `frontend/.env`: Set sandbox ecomm public key + merchant ID
3. `backend/.env`: Set `CLOVER_API_BASE_URL=https://sandbox.dev.clover.com`, sandbox ecomm private key
4. Railway + Vercel env vars: Update to match
