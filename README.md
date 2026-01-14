# Next Level Audio - Website Redesign

A modern, full-stack web application for Next Level Audio, featuring ecommerce capabilities, appointment booking, and admin management.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Ecommerce**: Shopify Storefront API (Headless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js (for admin panel)
- **Form Handling**: React Hook Form + Zod

## Features

- 🛒 **Ecommerce**: Shopify-powered product catalog and checkout
- 📅 **Appointment Booking**: Custom booking system with admin management
- 🎨 **Modern Design**: Based on car wash template reference
- 🔐 **Admin Panel**: Secure admin interface for managing bookings
- 📱 **Responsive**: Mobile-first design
- ⚡ **Performance**: Optimized with Next.js App Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Shopify store with Storefront API access
- Supabase account (or PostgreSQL database)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Configure your environment variables in `.env.local`:
   - Shopify Storefront API credentials
   - Supabase database credentials
   - NextAuth secret (generate with: `openssl rand -base64 32`)

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL schema from `lib/supabase/schema.sql` in the SQL editor

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin panel routes
│   ├── api/               # API routes
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── ...
├── lib/                  # Utility libraries
│   ├── shopify/          # Shopify API client
│   ├── supabase/         # Database client
│   └── ...
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Development Roadmap

- [x] Project setup and architecture
- [ ] Shopify integration
- [ ] Booking system
- [ ] Admin panel
- [ ] Design implementation (car wash template)
- [ ] AI Chatbot integration (future)
- [ ] Quote calculator (future)

## License

Private - Next Level Audio
