# Next Level Audio

Production website, ecommerce storefront, customer account area, and operations dashboard for Next Level Audio.

## What is in this repository

- Next.js 16 App Router frontend with English and Spanish routes
- Clover-backed catalog, inventory administration, checkout, orders, and customer data
- Supabase authentication, profiles, rewards, referrals, coupons, and admin authorization
- Who's Next appointment booking integration
- Stripe-powered Next Level VIP annual memberships
- Resend email delivery and an optional OpenAI chat assistant
- Automated product-image discovery and QA

Who's Next is a separate service. This repository embeds its public booking flow and uses a server-only service credential for appointment management.

## Stack

- Node.js 22.19+
- Next.js, React, TypeScript, Tailwind CSS
- Supabase
- Clover
- Stripe
- next-intl

## Local setup

1. Install dependencies.

   ```bash
   npm ci
   ```

2. Copy the environment template and replace the placeholders.

   ```bash
   cp .env.example .env.local
   ```

3. Apply the SQL in `supabase/schema.sql`, then the files in `supabase/migrations/` in chronological order. Review each migration before applying it to an existing project.

4. Start the development server.

   ```bash
   npm run dev
   ```

The site is available at [http://localhost:3000](http://localhost:3000).

## Verification

Run all repository checks before opening a pull request:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

`npm run build` requires at least valid-looking `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values because the Supabase clients are created while Next.js collects route data.

## Important integrations

### Who's Next bookings

Server-side appointment management uses:

- `WHOS_NEXT_API_URL`
- `WHOS_NEXT_MERCHANT_ID`
- `WHOS_NEXT_SERVICE_KEY`

The same service key must be configured as `NLA_SERVICE_KEY` in Who's Next, and Who's Next must pin it to the corresponding merchant ID. Never expose the service key through a `NEXT_PUBLIC_` variable.

### Next Level VIP

VIP memberships are Stripe subscriptions synchronized into Supabase by `/api/stripe/webhook`. Configure Stripe to send at least:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### Product image QA

The `image-qa.yml` workflow refreshes `data/product-images.json`. It can also be run locally with:

```bash
npm run fetch-images -- --dry-run
```

The standalone `fitment/` package is a data-maintenance tool for the Who's Next fitment API; it is not part of the Next.js runtime.

## Repository map

```text
app/          routes and server endpoints
components/   storefront, account, booking, and admin UI
lib/          integration clients and domain logic
messages/     English and Spanish translations
supabase/     schema and migrations
tests/        contract, checkout, and RLS tests
fitment/      standalone fitment-data scraper
scripts/      product-image maintenance tools
```

## Deployment

The web app is deployed on Vercel. Who's Next is deployed independently; coordinate changes to the appointment-management contract and service credentials across both applications.

This is a private application for Next Level Audio.
