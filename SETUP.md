# Setup Guide - Next Level Audio

## Quick Start Checklist

### 1. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

**Required variables:**
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Your Shopify store domain (e.g., `your-store.myshopify.com`)
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Get this from Shopify Admin → Settings → Apps and sales channels → Develop apps → Storefront API
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep this secret!)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your app URL (use `http://localhost:3000` for development)

### 2. Shopify Setup

1. **Create a Shopify Store** (if you don't have one)
   - Go to [shopify.com](https://www.shopify.com) and create a store
   - Choose a plan (Basic Shopify or higher for API access)

2. **Get Storefront API Access Token**
   - In Shopify Admin, go to: Settings → Apps and sales channels
   - Click "Develop apps" → "Create an app"
   - Name it "Next Level Audio Storefront"
   - Go to "API scopes" tab
   - Under "Storefront API", enable:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_write_checkouts`
   - Save and install the app
   - Go to "API credentials" tab
   - Copy the "Storefront API access token"
   - Add it to `.env.local` as `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`

3. **Add Products to Shopify**
   - Add your products through Shopify Admin
   - Products will automatically appear in your Next.js app

### 3. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://www.supabase.com)
   - Create a new project
   - Wait for the database to be provisioned

2. **Run Database Schema**
   - In Supabase Dashboard, go to SQL Editor
   - Copy the contents of `lib/supabase/schema.sql`
   - Paste and run it in the SQL Editor
   - This creates the `bookings` table with proper security policies

3. **Get API Keys**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 4. Install Dependencies & Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Next Steps

### Immediate Priorities:
1. ✅ Project structure and configuration
2. ⏳ Set up Shopify products
3. ⏳ Design booking form component
4. ⏳ Create admin authentication
5. ⏳ Build admin dashboard for bookings

### Design Implementation:
- Match the car wash template design
- Create reusable UI components
- Implement responsive layouts
- Add high-quality images (replace placeholders)

### Future Features:
- AI Chatbot integration
- Quote calculator
- Email notifications for bookings
- Order fulfillment webhooks to distributor

## Architecture Decisions

### Why This Stack?

**Next.js App Router**: Modern React framework with excellent performance and SEO
**Shopify Storefront API**: Headless commerce - you control the frontend, Shopify handles payments/inventory
**Supabase**: PostgreSQL database with built-in auth, real-time, and easy API
**TypeScript**: Type safety and better developer experience

### Key Design Patterns:

1. **API Routes**: All backend logic in `/app/api` using Next.js Route Handlers
2. **Server Components**: Default to server components for better performance
3. **Client Components**: Only use `'use client'` when needed (interactivity, hooks)
4. **Type Safety**: Shared types in `/types` directory
5. **Reusable Components**: UI components in `/components/ui`

## Troubleshooting

### Shopify API Errors
- Verify your Storefront API token has correct permissions
- Check that products are published in Shopify
- Ensure your store domain is correct (no `https://` prefix)

### Supabase Connection Issues
- Verify your project URL and keys are correct
- Check that Row Level Security (RLS) policies are set up
- Ensure the schema was run successfully

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that all environment variables are set
- Verify TypeScript types are correct

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

