# Next Level Audio - Setup Guide

## Overview

This Next.js application now features a **unified product catalog** that supports:
- **Clover POS Inventory** (in-stock items)
- **Affiliate Products** (special order from brands like JL Audio, Rockford Fosgate, etc.)
- **Professional Admin Dashboard** for managing both

---

## 🎉 What's New

### Unified Product Catalog
- Single products page showing both in-stock and special-order items
- Visual badges: 🟢 IN STOCK | 🔵 SPECIAL ORDER | 🟡 LOW STOCK
- Filter by availability, brand, and category
- Affiliate products link directly to manufacturer sites

### Professional Admin Panel
- Clean dashboard with sidebar navigation
- Stats cards showing bookings and product counts
- Product management with Clover/Affiliate filtering
- Mark products as featured
- Delete affiliate products
- No decorative elements (scanline/grid removed from admin)

---

## 📋 Prerequisites

You'll need:
1. **Supabase Account** (free tier works great)
2. **Clover POS Account** (for inventory integration - future)
3. **Google Calendar API** (for booking integration - future)

---

## 🚀 Setup Instructions

### Step 1: Database Setup (Supabase)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for it to provision (~2 minutes)

2. **Run the Database Schema**
   - In Supabase, go to SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Paste and run it
   - This creates the `products` and `bookings` tables with sample data

3. **Get Your API Keys**
   - Go to Project Settings → API
   - Copy:
     - Project URL (looks like `https://xxxxx.supabase.co`)
     - `anon` public key
     - `service_role` secret key (keep this secure!)

### Step 2: Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Clover (Optional - for future integration)
CLOVER_API_KEY=your_clover_api_key
CLOVER_MERCHANT_ID=your_merchant_id

# Google Calendar (Optional - for future integration)
GOOGLE_CALENDAR_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=your_calendar_id

# Shopify (Legacy - can be left empty)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=
```

### Step 3: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit:
- **Public Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

---

## 📦 Managing Products

### Adding Affiliate Products

There are two ways to add affiliate products:

#### Option 1: Via Admin Panel (Coming Soon)
We'll add a "New Product" button that opens a form.

#### Option 2: Via API/Database

Use the Supabase SQL Editor or make a POST request to `/api/products`:

```json
{
  "title": "Alpine iLX-W650 Digital Media Receiver",
  "description": "7-inch touchscreen with Apple CarPlay and Android Auto",
  "price": 399.99,
  "currency": "USD",
  "source": "affiliate",
  "availability": "special-order",
  "affiliateUrl": "https://www.alpine-usa.com/product/view/ilx-w650",
  "affiliateBrand": "Alpine",
  "estimatedDelivery": "3-5 business days",
  "category": "Head Units",
  "brand": "Alpine",
  "sku": "ALPINE-ILXW650",
  "featured": true,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "altText": "Alpine Head Unit"
    }
  ]
}
```

### Sample Data

The `schema.sql` file includes 5 sample affiliate products:
- JL Audio 12W7AE-3 Subwoofer ($899.99)
- Rockford Fosgate P3D4-12 Subwoofer ($279.99)
- JL Audio JX1000/1D Amplifier ($449.99)
- Kicker 46CSC654 Speakers ($79.99)
- Alpine iLX-W650 Head Unit ($399.99)

---

## 🎨 Product Badge System

### Availability Badges

| Badge | Color | Meaning | Button Action |
|-------|-------|---------|---------------|
| 🟢 IN STOCK | Green | Clover inventory available | "Add to Cart" |
| 🔵 SPECIAL ORDER | Blue | Affiliate product | "View at [Brand]" |
| 🟡 LOW STOCK | Yellow | Less than 5 in stock | "Add to Cart" |
| 🔴 OUT OF STOCK | Red | Not available | Disabled |

### Source Badges (Admin Only)

| Badge | Color | Source |
|-------|-------|--------|
| CLOVER | Green | In-store inventory |
| AFFILIATE | Blue | Special order |

---

## 🛠️ Admin Panel Features

### Overview Tab
- Total bookings, pending, confirmed counts
- Total products (Clover + Affiliate breakdown)
- Recent bookings widget

### Bookings Tab
- Full booking list with customer details
- Update booking status (pending → confirmed → completed)
- View vehicle information

### Products Tab
- Filter by: All Products | Clover Inventory | Affiliate Products
- Toggle featured status (★)
- Delete affiliate products (Clover items protected)
- View affiliate links
- Product thumbnails and availability badges

---

## 🔄 Future Integrations

### Clover POS Integration

**What You'll Need:**
1. Clover API credentials
2. Read the [Clover API docs](https://docs.clover.com/docs)
3. Update `/api/products/route.ts` to fetch from Clover

**Benefits:**
- Real-time inventory sync
- Automatic stock updates when items sell in-store
- Unified reporting

### Google Calendar Integration

**What You'll Need:**
1. Google Cloud Project
2. Calendar API enabled
3. Service account credentials

**Implementation:**
- Update `/api/bookings/route.ts`
- Add `googleapis` npm package
- Two-way sync: website ↔ Google Calendar

---

## 📊 Database Schema

### Products Table

```sql
products (
  id                  UUID PRIMARY KEY
  title               TEXT
  description         TEXT
  price               DECIMAL(10,2)
  currency            TEXT DEFAULT 'USD'
  source              TEXT (clover|affiliate|shopify)
  availability        TEXT (in-stock|special-order|low-stock|out-of-stock)

  -- Clover fields
  clover_item_id      TEXT UNIQUE
  stock_quantity      INTEGER

  -- Affiliate fields
  affiliate_url       TEXT
  affiliate_brand     TEXT
  affiliate_commission DECIMAL(5,2)
  estimated_delivery  TEXT

  -- Metadata
  category            TEXT
  brand               TEXT
  sku                 TEXT
  featured            BOOLEAN
  images              JSONB

  created_at          TIMESTAMPTZ
  updated_at          TIMESTAMPTZ
)
```

### Bookings Table

```sql
bookings (
  id                        UUID PRIMARY KEY
  customer_name             TEXT
  customer_email            TEXT
  customer_phone            TEXT
  service_type              TEXT
  vehicle_make              TEXT
  vehicle_model             TEXT
  vehicle_year              INTEGER
  appointment_date          DATE
  appointment_time          TEXT
  notes                     TEXT
  status                    TEXT (pending|confirmed|completed|cancelled)
  google_calendar_event_id  TEXT
  created_at                TIMESTAMPTZ
  updated_at                TIMESTAMPTZ
)
```

---

## 🎯 Customer Experience Flow

### In-Stock Products (Clover)
1. Customer browses products page
2. Sees 🟢 IN STOCK badge
3. Clicks "Add to Cart"
4. Checks out for local pickup
5. Picks up at shop

### Affiliate Products
1. Customer browses products page
2. Sees 🔵 SPECIAL ORDER badge
3. Clicks "View at [Brand]"
4. Opens affiliate link in new tab
5. Customer orders from manufacturer
6. (Optional) Customer books installation with you

---

## 💡 Best Practices

### For Affiliate Products

**Good Product Titles:**
- ✅ "JL Audio 12W7AE-3 Anniversary Edition Subwoofer"
- ❌ "Sub" or "12 inch subwoofer"

**Good Descriptions:**
- ✅ Include key specs, features, and benefits
- ✅ Mention power handling, impedance, etc.
- ❌ Just copy-paste manufacturer text

**Good Images:**
- ✅ High quality product photos
- ✅ Use manufacturer's official images
- ✅ Multiple angles if available

**Affiliate URLs:**
- ✅ Use your affiliate links if available
- ✅ Link to official manufacturer product page
- ❌ Link to third-party retailers without permission

### Upselling Strategy

For every affiliate product, consider:
- "Buy online + book installation"
- "We can custom-install this for you"
- Bundling (sub + amp + install = discount)

---

## 🔐 Security Notes

1. **Never commit `.env.local`** to git (it's in `.gitignore`)
2. **Keep `SUPABASE_SERVICE_ROLE_KEY` secret** - it bypasses Row Level Security
3. **Admin panel is currently unsecured** - add authentication before production
4. **Enable Row Level Security** on Supabase tables for production

---

## 📞 Support & Next Steps

### Immediate Next Steps
1. Run the Supabase schema
2. Add your environment variables
3. Test the products page
4. Add your real affiliate products
5. Get your client's product photos/data

### Future Features to Build
- [ ] Authentication for admin panel (NextAuth.js)
- [ ] Clover API integration
- [ ] Google Calendar integration
- [ ] Email notifications (Resend/SendGrid)
- [ ] Shopping cart for Clover products
- [ ] Product search/filtering improvements
- [ ] Admin form to add products via UI
- [ ] Image upload to Supabase Storage

---

## 🎨 Design Notes

**Public Site:** Keeps the full cyberpunk aesthetic
- Neon glows, cyber grid backgrounds
- Animated scanline
- Full header/footer navigation

**Admin Panel:** Professional and clean
- No decorative elements
- Sidebar navigation
- Card-based stats
- Easy-to-scan tables

---

## 📝 Sample Affiliate Products to Add

Recommended categories to populate:

**Subwoofers:**
- JL Audio W7 series
- Rockford Fosgate Punch series
- Kicker CompR/CompVR

**Amplifiers:**
- JL Audio JX/RD series
- Rockford Fosgate Prime series
- Kicker KEY series

**Speakers:**
- Hertz components
- Focal integration series
- JL Audio C2/C3 series

**Head Units:**
- Alpine Halo series
- Pioneer DMH series
- Kenwood Excelon

---

## 🚢 Deploying to Production

When ready to go live:

1. **Set up Vercel:**
   - Connect your GitHub repo
   - Add all environment variables
   - Deploy!

2. **Set up Custom Domain:**
   - Add your domain in Vercel
   - Update DNS records

3. **Enable Authentication:**
   - Set up NextAuth.js
   - Add admin email allowlist
   - Protect `/admin` routes

4. **Test Everything:**
   - Product browsing
   - Filters
   - Affiliate links
   - Booking flow
   - Admin panel

---

Built with ❤️ for Next Level Audio
