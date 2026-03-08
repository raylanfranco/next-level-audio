# Current Work — Handoff Note

## Last Updated: 2026-03-07

## Completed This Session (QA Fixes + Chatbot)

### QA Fixes — All 13 Items DONE
1. **EN/ES language toggle** — `window.location.href` hard refresh (was `router.replace`)
2. **Saturday hours** — updated to 3PM everywhere (footer i18n, chatbot config, BayReady availability)
3. **BayReady Saturday booking** — PATCH'd availability rules to 09:00-15:00
4. **Filter Unknown customers** — `.filter(c => c.firstName || c.lastName)` in admin
5. **Phone formatting** — `lib/formatPhone.ts` → 5 forms (contact, careers, checkout, inquiry, quote flow)
6. **Careers 500 fix** — created `career_applications` table, removed job_listings entirely
7. **Quote calculator** — rewritten with $125/hr × hour ranges per service
8. **Order details** — expandable rows with line items, notes, payment state, timestamps
9. **Orders CRUD** — `app/api/clover/orders/[id]/route.ts` (GET/PATCH/DELETE), admin UI
10. **Customer cards** — card grid with email/phone from Clover expand, marketing badge
11. **Contact form** — verified Resend wiring is correct
12. **BayReady service images** — 9 category fallback images in `public/images/services/`
13. **Supabase redirect** — user configured Site URL in dashboard

### Chatbot Enhancements
- **Disabled Check Fitment** — removed button, simplified tool to "call us" response
- **Embedded Google Map** — new `map` screen with iframe + "GET DIRECTIONS" CTA
- **Dynamic pricing** — `getQuoteEstimate` tool returns real $125/hr pricing from `servicePricing` array
- **Updated Saturday hours** in chatbot config to 3PM
- **Full test suite** — 10 query types validated (pricing, combos, services, hours, location, booking, fitment)

### User Configured (Dashboard)
- `SUPABASE_SERVICE_ROLE_KEY` added to `.env.local`
- `RESEND_API_KEY` added to Vercel
- `career_applications` table + `resumes` bucket created in Supabase
- Supabase Auth Site URL + Redirect URLs set for production

## Still Running
- **Fitment scraper** — optimized: 28 popular makes, max 5 pages/vehicle (~16,613 vehicles)
  - When done: `npm run seed` → re-enable Check Fitment in config + chat route

## Key Files Changed
- `components/LanguageSwitcher.tsx`, `messages/en.json`, `messages/es.json`
- `lib/formatPhone.ts` (NEW), applied to 5 form files
- `app/api/careers/applications/route.ts` (rewritten), `app/api/careers/jobs/` (DELETED)
- `types/career.ts`, `types/clover.ts` (updated)
- `app/admin/page.tsx` (major: orders detail/CRUD, customer cards, removed jobs)
- `app/api/clover/orders/[id]/route.ts` (NEW), `app/api/clover/customers/route.ts`
- `components/QuoteCalculator.tsx` (rewritten)
- `lib/chatbot/config.ts`, `app/api/chat/route.ts` (pricing tool + fitment disabled)
- `components/ChatWidget.tsx`, `components/chat-widget/ContactActionBar.tsx`, `types.ts`
- `bayready/frontend/src/pages/BookingPage.tsx`, `ServicesPage.tsx` (default images)
- `bayready/frontend/public/images/services/` (9 new images)

## Next Session Priorities
1. Fitment scraper complete → seed → re-enable Check Fitment
2. Deploy BayReady frontend (service images)
3. Android Phases 4-7
4. Product image fixes in `data/product-images.json`
5. Wire up auth protection for account pages
