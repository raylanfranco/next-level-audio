-- ============================================================================
-- Product image reviews (approval queue)
-- ----------------------------------------------------------------------------
-- Records the admin's approve/reject decision for images the nightly scraper
-- fetched. Scraped images are written to data/product-images.json with
-- status "pending" and are NEVER served publicly until an admin approves them
-- (approval copies the URL into product_image_overrides, which is the only
-- Supabase-backed source the storefront serves). Rejections are recorded here
-- so the item drops out of the queue and the bad URL is never shown.
--
-- Same access model as product_image_overrides: service-role only via the
-- admin API routes, RLS enabled with no public policies.
--
-- Run this once in the Supabase SQL editor (Dashboard > SQL > New query).
-- ============================================================================

create table if not exists public.product_image_reviews (
  clover_item_id text primary key,
  status         text not null check (status in ('approved', 'rejected')),
  image_url      text,                    -- the scraped URL that was reviewed
  reviewed_at    timestamptz not null default now(),
  reviewed_by    uuid references auth.users (id)
);

alter table public.product_image_reviews enable row level security;
-- No policies on purpose: service-role key bypasses RLS; all access goes
-- through the admin-guarded API routes.
