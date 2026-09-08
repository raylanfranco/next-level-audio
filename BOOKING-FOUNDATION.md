# Booking foundation: deployment and verification

This change prepares NLA for a unified booking admin. It fixes the customer appointment response, takes allowed status transitions from Who's Next, shows upstream failures, and validates checkout prices/discounts on the server. It does not replace the iframe or add a calendar yet.

## Coordinated rollout

1. In Who's Next's backend environment, configure `NLA_SERVICE_KEY` (a newly generated random secret of at least 32 characters) and `NLA_MERCHANT_ID` (NLA's actual merchant ID).
2. Configure the same secret as `WHOS_NEXT_SERVICE_KEY` in NLA's server environment. Set `WHOS_NEXT_MERCHANT_ID` to the same merchant and verify `WHOS_NEXT_API_URL`. Never use a `NEXT_PUBLIC_` prefix for the secret.
3. Apply `supabase/migrations/20260908031517_harden_profile_and_legacy_access.sql` after checking deployed grants and confirming legacy Supabase booking access is unused. It preserves historical rows, limits customer profile edits to name/phone, and removes broad legacy booking/product mutation permissions. Service-role administration remains available.
4. Deploy the companion Who's Next backend and NLA changes in a coordinated window. NLA requires the bridge credential; the new backend rejects unauthenticated management. Do not roll back the backend alone to restore access.
5. Sign in as Ben and a test customer. Verify each can see only their permitted appointments; check an authorized status change, an unauthorized direct API call, and booking error/retry behavior.
6. In Clover sandbox, verify ordinary checkout, VIP discount, coupon, changed price, and a tampered amount. Existing browser checkout tabs must refresh: item IDs are now required and totals are revalidated before charging.

## Local verification

Use Node 22.19+ and run `npm ci`, `npm test`, and `npm run typecheck`. The migration test uses isolated PGlite PostgreSQL with representative Supabase roles; it does not certify the deployed database's policies. The production build also requires the application's existing environment variables.

## Remaining work before the booking redesign launches

- Reserve slots before payment; reconcile Stripe deposits with bookings using verified, idempotent finalization/webhooks.
- Enforce scheduling conflicts atomically, validate booking times against availability, and use the merchant timezone in the booking backend.
- Add the unified Today/calendar/detail experience and services/availability controls, followed by a native customer booking route.
- Checkout now verifies totals, but payment retry idempotency, atomic coupon usage and durable post-payment reconciliation still need their own implementation.

The initial review overstated merchant credential exposure: Who's Next already uses Prisma global omission to remove password hashes and payment access tokens. That protection remains in place.
