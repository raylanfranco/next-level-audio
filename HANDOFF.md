# BayReady PWA — BDCCB Handoff Document

**Date:** March 24, 2026
**Client:** Bad Decisions Custom Cycles & Boats (Stroudsburg, PA)
**Developer:** Ray Lanfranco (Victory Rush)

---

## 1. Summary of What Was Completed This Session

### Prisma Schema Update
- Added `PushSubscription` model with `merchantId`, `endpoint`, `p256dh`, `auth`, `deviceLabel`
- Added unique constraint on `[merchantId, endpoint]` to prevent duplicate subscriptions
- Added `pushSubscriptions` relation to `Merchant` model
- Migration ready: `npx prisma migrate dev --name add_push_subscriptions`

### PWA Layer
- `public/manifest.json` — standalone PWA config with BDCCB theme color (#c22820)
- `public/sw.js` — service worker with push notification handler, notification click routing, offline dashboard shell cache (network-first strategy)
- `public/icons/icon-192.png` and `icon-512.png` — placeholder solid-color icons (replace with real BayReady logo)
- `index.html` — added manifest link, theme-color meta, iOS meta tags (apple-mobile-web-app-capable, status-bar-style, title, touch-icon)
- `main.tsx` — service worker registration (production only, via `import.meta.env.PROD` gate)

### Push Notification Backend (PushModule)
- `src/push/push.service.ts` — VAPID configuration, `subscribe()`, `unsubscribe()`, `sendToMerchant()`, `testPush()`, auto-cleanup of stale subscriptions (410/404 handling)
- `src/push/push.controller.ts` — `POST /push/subscribe`, `DELETE /push/subscribe`, `POST /push/test` (all guarded by AuthGuard)
- `src/push/push.module.ts` — registered in AppModule
- Wired into `BookingService`: fires push on new booking creation and booking status update (fire-and-forget)

### Push Notification Frontend
- `src/components/PushPrompt.tsx` — button-triggered push subscription (never automatic), checks PushManager support, persists dismissal to localStorage, renders on BookingsPage dashboard

### Stripe Backend (Real Implementation)
- Replaced stubbed `StripeService` with real Stripe SDK integration
- `createPaymentIntent()` — creates PaymentIntent with `automatic_payment_methods`
- `confirmPayment()` — retrieves PaymentIntent status
- `constructWebhookEvent()` — webhook signature verification
- Existing controller endpoints (`POST /payments/create-intent`, `POST /payments/confirm`) now functional

### Stripe Frontend (Real Implementation)
- Replaced placeholder HTML inputs with real Stripe Elements (`@stripe/react-stripe-js` + `@stripe/stripe-js`)
- `StripeCardForm.tsx` — wraps `CardElement` in `Elements` provider, exposes `getToken()` returning `paymentMethod.id`
- `BookingPage.tsx` — updated `handlePayDeposit()` to use PaymentIntent flow: create intent on backend → confirm client-side with `stripe.confirmCardPayment()`

### Build Fixes
- Fixed Prisma v7 `@types/pg` version mismatch in `PrismaService` (cast to `any`)
- Added `"types": ["vite/client"]` to `tsconfig.app.json` for `import.meta.env` support
- Both backend (`nest build`) and frontend (`tsc -b && vite build`) compile cleanly

---

## 2. Current State of the BayReady PWA

### What Works (Production-Ready)
- Auth: email/password registration + login with JWT (7-day expiry)
- Booking CRUD: full state machine (8 statuses), overlap detection, slot calculation
- Service CRUD: with dynamic intake questions (RADIO/CHECKBOX/TEXT/SELECT/TINT_ZONE)
- Customer CRUD: find-or-create, per-merchant unique email
- Vehicle CRUD: year/make/model/trim with NHTSA API + Imagin Studio preview images
- Dashboard: calendar view (week/day), list view, booking detail panel, walk-in modal, parts tracking, revenue sidebar
- Settings: business hours, timezone, deposit %, SMS toggle, blocked dates
- SMS Notifications: Twilio-powered on status change, 24h reminders, review requests
- Push Notifications: VAPID web push on booking create/status change, button-triggered subscription
- PWA: manifest, service worker, iOS meta tags, offline cache, push handler
- Stripe Payments: real PaymentIntent flow for booking deposits
- Deployment config: Procfile, CORS, vercel.json SPA rewrites, 0.0.0.0 binding

### What Needs Attention Before Production
- **Prisma migration** must be run on Railway: `npx prisma migrate dev --name add_push_subscriptions`
- **PWA icons** are solid-color placeholders — replace with real BayReady branded icons
- **Stripe webhook** endpoint not yet exposed as a NestJS route (manual confirmation works, but webhook-driven confirmation is recommended for production reliability)
- **VAPID keys** must be generated and set in env vars (see Section 5)

---

## 3. All Environment Variables Required

### Backend (.env on Railway)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Railway PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (min 32 chars) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_live_... or sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret (whsec_...) |
| `VAPID_PUBLIC_KEY` | Yes | VAPID public key for web push |
| `VAPID_PRIVATE_KEY` | Yes | VAPID private key for web push |
| `VAPID_CONTACT` | Yes | mailto:ray@victoryrush.dev |
| `FRONTEND_URL` | Yes | Comma-separated CORS origins (e.g., https://bayready-bdccb.vercel.app) |
| `PORT` | Auto | Railway assigns automatically |
| `TWILIO_ACCOUNT_SID` | No | Twilio account SID (for SMS) |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth token (for SMS) |
| `TWILIO_PHONE_NUMBER` | No | Twilio sender phone number |

### Frontend (.env on Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (e.g., https://bayready-bdccb.up.railway.app) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key (pk_live_... or pk_test_...) |
| `VITE_VAPID_PUBLIC_KEY` | Yes | Same VAPID public key as backend |

---

## 4. Deployment Sequence

```
1. Deploy backend to Railway
   - Set root directory: /bayready/backend
   - Add Procfile (already exists)
   - Set all backend env vars (DATABASE_URL auto from Railway Postgres addon)
   - Build command: prisma generate && nest build
   - Start command: node dist/src/main

2. Run Prisma migration on Railway
   - Railway shell: npx prisma migrate deploy

3. Deploy frontend to Vercel
   - Set root directory: /bayready/frontend
   - Set build command: npm run build
   - Set output directory: dist
   - Set all frontend env vars (VITE_API_URL = Railway backend URL)

4. Update CORS
   - Set FRONTEND_URL on Railway to the Vercel frontend URL

5. Generate & set VAPID keys (see Section 5)

6. Register first merchant (see Section 6)

7. Test push notifications (see Section 7)
```

---

## 5. VAPID Key Generation

```bash
npx web-push generate-vapid-keys
```

Output:
```
Public Key: BLxxxxx...
Private Key: xxxxx...
```

Set both in Railway backend env vars (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`).
Set the public key in Vercel frontend env var (`VITE_VAPID_PUBLIC_KEY`).

---

## 6. How to Register the First Merchant

```bash
curl -X POST https://YOUR_BACKEND_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "baddecisionscustomcycles@gmail.com",
    "password": "SECURE_PASSWORD_HERE",
    "businessName": "Bad Decisions Custom Cycles & Boats"
  }'
```

Response includes `{ token, merchant: { id, name, email } }`.

The merchant ID from the response is needed for the public booking URL:
`https://YOUR_FRONTEND_URL/book/MERCHANT_ID`

---

## 7. How to Test Push Notifications End-to-End

1. Log into the dashboard at `https://YOUR_FRONTEND_URL/login`
2. On the Bookings page, click "Enable" on the PushPrompt banner
3. Allow browser notification permission when prompted
4. Open a new terminal and test:
   ```bash
   curl -X POST https://YOUR_BACKEND_URL/push/test \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json"
   ```
5. You should receive a browser notification: "BayReady Test — Push notifications are working!"
6. Alternatively, create a booking via the public booking page — the merchant dashboard should receive a push notification

---

## 8. Next Session Instructions

1. **Extract BayReady as `@victory-rush/bayready-core`**
   - Create `github.com/raylanfranco/bayready-core` repo
   - Move `bayready/backend/` and `bayready/frontend/` into it
   - Set up package.json for `@victory-rush/bayready-core` scope
   - Publish to GitHub Packages
   - Update `bad-decisions` repo to consume the package

2. **Context switch to `next-level-audio` repo**
   - Begin automotive vertical adapter extraction
   - Move VehicleSelector, IntakeQuestionnaire, TintZonePicker into `@victory-rush/bayready-automotive`
   - Update NLA's embedded BayReady to point to the core package

3. **Replace placeholder PWA icons** with real BayReady branded assets

4. **Add Stripe webhook route** for production payment confirmation reliability

5. **SMS activation** — set Twilio env vars on Railway to enable SMS notifications
