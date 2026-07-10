-- ============================================================================
-- Product image overrides
-- ----------------------------------------------------------------------------
-- Admin-set images that take priority over the nightly scraper's baseline in
-- data/product-images.json. Keyed by Clover item id. Read/written only by the
-- service-role key (via the admin API routes) — never by anon/authenticated
-- clients, so RLS is enabled with no public policies.
--
-- Run this once in the Supabase SQL editor (Dashboard > SQL > New query).
-- ============================================================================

create table if not exists public.product_image_overrides (
  clover_item_id text primary key,
  image_url      text not null,
  storage_path   text,                    -- set when the image was uploaded (option B); null for a pasted URL (option A)
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users (id)
);

alter table public.product_image_overrides enable row level security;
-- No policies added on purpose: the service-role key bypasses RLS, and all
-- access goes through the admin-guarded API routes. This keeps the table
-- invisible to anon/authenticated clients.

-- ----------------------------------------------------------------------------
-- Storage bucket for uploaded product images (public read).
-- A public bucket serves objects at /storage/v1/object/public/... without auth,
-- which is what the storefront <img> tags need. Uploads happen server-side with
-- the service-role key.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
