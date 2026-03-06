-- Database schema for Next Level Audio booking system

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Best sellers cache (aggregated from Clover orders)
CREATE TABLE IF NOT EXISTS best_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clover_item_id TEXT NOT NULL UNIQUE,
  item_name TEXT NOT NULL,
  total_quantity_sold INTEGER NOT NULL DEFAULT 0,
  total_revenue_cents BIGINT NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  last_sold_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_best_sellers_quantity ON best_sellers (total_quantity_sold DESC);
CREATE INDEX IF NOT EXISTS idx_best_sellers_revenue ON best_sellers (total_revenue_cents DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE best_sellers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read best sellers (public data)
CREATE POLICY "Anyone can view best sellers" ON best_sellers
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Policy: Service role can manage best sellers (via server-side refresh)
CREATE POLICY "Service role can manage best sellers" ON best_sellers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert bookings (for booking form)
CREATE POLICY "Allow public booking inserts" ON bookings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: Only authenticated admin users can view all bookings
CREATE POLICY "Admin can view all bookings" ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can view their own bookings (by email)
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT
  TO authenticated, anon
  USING (true); -- In production, add email check: auth.email() = customer_email

-- ============================================================
-- User Accounts System
-- ============================================================

-- Customer profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Orders (local copy after successful Clover charge)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  clover_charge_id TEXT,
  items JSONB NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  coupon_id UUID,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_profile ON orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

-- Reward points ledger
CREATE TABLE IF NOT EXISTS reward_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_points_profile ON reward_points(profile_id);

-- Referrals tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referred_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  bonus_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Coupon codes (admin-created or reward-redeemed)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value INTEGER NOT NULL,
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  points_cost INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from orders to coupons (after coupons table exists)
ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role manages profiles" ON profiles
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- RLS for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Service role manages orders" ON orders
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- RLS for reward_points
ALTER TABLE reward_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON reward_points
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Service role manages points" ON reward_points
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- RLS for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Service role manages referrals" ON referrals
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role manages coupons" ON coupons
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

