-- Next Level Audio Database Schema
-- Unified products table supporting Clover, Affiliate, and legacy Shopify products

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic product info
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('clover', 'affiliate', 'shopify')),
  availability TEXT DEFAULT 'in-stock' CHECK (availability IN ('in-stock', 'special-order', 'low-stock', 'out-of-stock')),

  -- Clover-specific fields
  clover_item_id TEXT UNIQUE,
  stock_quantity INTEGER,

  -- Affiliate-specific fields
  affiliate_url TEXT,
  affiliate_brand TEXT,
  affiliate_commission DECIMAL(5, 2), -- Percentage (e.g., 5.00 = 5%)
  estimated_delivery TEXT,

  -- Common metadata
  category TEXT,
  brand TEXT,
  sku TEXT,
  featured BOOLEAN DEFAULT FALSE,

  -- Legacy Shopify support
  handle TEXT,

  -- Images stored as JSONB array
  images JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT check_clover_fields CHECK (
    (source = 'clover' AND clover_item_id IS NOT NULL) OR source != 'clover'
  ),
  CONSTRAINT check_affiliate_fields CHECK (
    (source = 'affiliate' AND affiliate_url IS NOT NULL) OR source != 'affiliate'
  )
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_clover_item_id ON products(clover_item_id) WHERE clover_item_id IS NOT NULL;

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Bookings table (from your existing requirements)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Service details
  service_type TEXT NOT NULL,

  -- Vehicle info (optional)
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,

  -- Appointment details
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  notes TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

  -- Google Calendar integration
  google_calendar_event_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);

-- Trigger for bookings updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for products (anyone can view)
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can manage products (for admin panel)
-- NOTE: In production, you'll want to add role-based checks here
CREATE POLICY "Authenticated can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can create bookings
CREATE POLICY "Public can create bookings"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can view and manage all bookings (admin)
CREATE POLICY "Authenticated can manage bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sample affiliate products data
-- Run this after creating the tables to populate with sample affiliate products
INSERT INTO products (title, description, price, currency, source, availability, affiliate_url, affiliate_brand, category, brand, sku, featured, images)
VALUES
  (
    'JL Audio 12W7AE-3 Anniversary Edition Subwoofer',
    'The 12W7AE-3 Anniversary Edition subwoofer delivers exceptional bass performance with JL Audio''s patented W-Cone technology. Features a 3-ohm voice coil and can handle 1000W RMS power.',
    899.99,
    'USD',
    'affiliate',
    'special-order',
    'https://www.jlaudio.com/products/12w7ae-3-car-audio-w7-subwoofer-drivers-92141',
    'JL Audio',
    'Subwoofers',
    'JL Audio',
    'JL-12W7AE-3',
    true,
    '[{"url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800", "altText": "JL Audio Subwoofer"}]'::jsonb
  ),
  (
    'Rockford Fosgate P3D4-12 Punch P3 12" Subwoofer',
    'The Punch P3 series subwoofer with dual 4-ohm voice coils delivers powerful, accurate bass. Anodized aluminum voice coil former ensures efficient heat dissipation.',
    279.99,
    'USD',
    'affiliate',
    'special-order',
    'https://www.rockfordfosgate.com/products/details/p3d4-12',
    'Rockford Fosgate',
    'Subwoofers',
    'Rockford Fosgate',
    'RF-P3D4-12',
    false,
    '[{"url": "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=800", "altText": "Rockford Fosgate Subwoofer"}]'::jsonb
  ),
  (
    'JL Audio JX1000/1D Monoblock Class D Amplifier',
    '1000W monoblock amplifier perfect for powering subwoofers. Features variable low-pass crossover, bass boost, and thermal/short circuit protection.',
    449.99,
    'USD',
    'affiliate',
    'special-order',
    'https://www.jlaudio.com/products/jx1000-1d-car-audio-jx-amplifiers-98641',
    'JL Audio',
    'Amplifiers',
    'JL Audio',
    'JL-JX1000-1D',
    true,
    '[{"url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800", "altText": "JL Audio Amplifier"}]'::jsonb
  ),
  (
    'Kicker 46CSC654 CS Series 6.5" Speakers',
    'Upgrade your factory speakers with Kicker CS Series coaxial speakers. Features neodymium tweeters and polypropylene woofers for crisp, clear sound.',
    79.99,
    'USD',
    'affiliate',
    'special-order',
    'https://www.kicker.com/cs-series-6-5-inch-coaxial',
    'Kicker',
    'Speakers',
    'Kicker',
    'KICKER-CSC654',
    false,
    '[{"url": "https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=800", "altText": "Kicker Speakers"}]'::jsonb
  ),
  (
    'Alpine iLX-W650 Digital Media Receiver',
    'Mechless digital media receiver with 7" capacitive touchscreen. Apple CarPlay and Android Auto compatible. Works with backup cameras and steering wheel controls.',
    399.99,
    'USD',
    'affiliate',
    'special-order',
    'https://www.alpine-usa.com/product/view/ilx-w650',
    'Alpine',
    'Head Units',
    'Alpine',
    'ALPINE-ILXW650',
    true,
    '[{"url": "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800", "altText": "Alpine Head Unit"}]'::jsonb
  );

-- Add some comment documentation
COMMENT ON TABLE products IS 'Unified product catalog supporting Clover inventory, affiliate products, and legacy Shopify integration';
COMMENT ON TABLE bookings IS 'Customer appointment bookings with Google Calendar integration';
COMMENT ON COLUMN products.source IS 'Product source: clover (in-stock inventory), affiliate (special order), shopify (legacy)';
COMMENT ON COLUMN products.availability IS 'Product availability status displayed to customers';
COMMENT ON COLUMN bookings.google_calendar_event_id IS 'Google Calendar event ID for two-way sync';
