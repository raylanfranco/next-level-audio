# Next Level Audio contributor guide

This repository is the production Next Level Audio website. Treat the code,
database migrations, and tests as the source of truth. `VR-PLATFORM.md` is a
product/design reference, not a deployment runbook.

## Runtime

- Node.js 20.9 or newer
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- English routes use the unprefixed URL; Spanish routes use `/es`
- Vercel hosts this app

Run these checks before handing work off:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The build needs valid-looking `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` values because Supabase clients are initialized
while route data is collected. Never commit real credentials.

## Architecture

- `app/[locale]/` contains the public storefront and customer account pages.
- `app/admin/` contains the protected operations dashboard.
- `app/api/` contains server endpoints for Clover, Supabase, Stripe, Resend,
  product images, and the Who's Next proxy.
- `components/` contains shared storefront, account, booking, and admin UI.
- `lib/` contains integration clients and domain logic.
- `messages/` contains English and Spanish translations.
- `supabase/` contains the base schema and chronological migrations.
- `tests/` contains booking, checkout, and row-level-security contract tests.
- `fitment/` is a standalone maintenance utility that seeds fitment data in
  Who's Next; it is not part of the Next.js runtime.

## External systems

### Clover

Clover is the source of truth for inventory, orders, payments, and Clover
customers. Browser payment fields are hosted by Clover; the server performs the
charge. Keep sandbox and production credentials aligned with
`CLOVER_CHARGE_ENV`.

Do not reintroduce the removed `/api/products` compatibility routes. Storefront
and admin catalog access goes through `/api/clover/inventory` and
`/api/clover/inventory/[id]`.

### Supabase

Supabase provides authentication and stores profiles, rewards, referrals,
coupons, inquiries, image-review data, and VIP membership state. Public clients
use the anon key. Service-role access is server-only and must remain behind
authorization checks.

Apply `supabase/schema.sql` only when creating a new project. For an existing
project, review and apply missing files in `supabase/migrations/` in order.

### Who's Next

Who's Next is a separate repository and deployment:

- Repository: `github.com/raylanfranco/whos-next`
- API: `https://whos-next-production.up.railway.app`
- NLA server integration: `lib/whos-next.ts` and `/api/bookings`
- Public booking UI: embedded by `components/BookingWizardModal.tsx`
- Fitment UI: `components/chat-widget/FitmentFlow.tsx`

Use `WHOS_NEXT_API_URL`, `WHOS_NEXT_MERCHANT_ID`, and the server-only
`WHOS_NEXT_SERVICE_KEY`. The corresponding Who's Next deployment must set the
same secret as `NLA_SERVICE_KEY` and pin it to the intended merchant. The old
`BAYREADY_*` names remain temporary compatibility fallbacks; do not add new uses.

Booking timestamps cross a deployment boundary. Who's Next must interpret a
submitted local date/time in the merchant's IANA timezone before persisting an
instant. NLA formats the returned instant for the shop timezone. Never construct
a persisted appointment from a bare `new Date("YYYY-MM-DDTHH:mm:ss")` on a UTC
server; that creates the exact multi-hour shift customers have reported.

### Stripe VIP

Stripe Checkout creates the annual VIP subscription. `/api/stripe/webhook`
synchronizes subscription state to `vip_memberships`, while
`vip_benefit_usage` records benefit consumption. Stripe is the billing source of
truth; Supabase is the application-facing projection.

### Email and AI

Resend delivers transactional email. The OpenAI chat path is optional and must
remain disabled unless `NEXT_PUBLIC_AI_CHAT_ENABLED=true` and the server has an
`OPENAI_API_KEY`.

## Security rules

- Never expose service-role, Clover private, Stripe secret, webhook, or Who's
  Next service credentials through `NEXT_PUBLIC_*` variables.
- Admin routes require both a valid Supabase session and `profiles.role = admin`.
- Price, discount, reward, coupon, and VIP eligibility calculations are
  server-authoritative. Do not trust totals supplied by the browser.
- Preserve Supabase row-level security and extend `tests/rls.test.mjs` when
  policies change.
- Webhook handlers must verify signatures before mutating data.

## Data and UI conventions

- Keep customer-facing copy in both `messages/en.json` and `messages/es.json`.
- Prefer Server Components unless browser state or APIs require a Client
  Component.
- Use `next/image` for stable local or allow-listed remote images. Direct `<img>`
  elements are acceptable only when URLs are dynamic and the optimization tradeoff
  is deliberate.
- Product-image automation updates `data/product-images.json`; admin approval
  controls what is shown publicly.
- Avoid committing generated output, local transcripts, editor settings, or
  secrets. The repository-level `.gitignore` covers the known local artifacts.

## Deployment ownership

NLA and Who's Next deploy independently. A change to the booking contract,
authentication header, merchant identity, allowed origins, or timestamp behavior
must be verified in both repositories before release.
