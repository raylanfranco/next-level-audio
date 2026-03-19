# Lighthouse Optimization Plan — Mobile Homepage

## Current Scores: 46 / 100 / 88 / 92 (Performance / Accessibility / Best Practices / SEO)

## Target: 90+ across all four categories

---

## The Diagnosis

### Why Performance is 46

The homepage loads **~25 MB of unoptimized assets** on mobile:

| Asset | Size | Problem |
|-------|------|---------|
| `hero-video.mp4` | 2.8 MB | Autoplays immediately, no poster, no compression |
| `about.mp4` | 1.6 MB | Second autoplay video further down |
| `about-short.png` | 2.2 MB | Raw PNG, no next/image optimization |
| `auto-parts.png` | 2.0 MB | Service card image, raw PNG |
| `car-audio.png` | 472 KB | Service card image, raw PNG |
| `window-tints.png` | 379 KB | Service card image, raw PNG |
| `logo.png` | 876 KB | Logo loaded on every page |
| `logo-new.png` | 664 KB | Second logo variant |
| Product images | Variable | Loaded from 29 external domains (DNS overhead) |

**Other issues:**
- Zero `next/image` usage (except logo in Header) — no automatic WebP/AVIF, no srcset, no lazy loading
- No `width`/`height` on `<img>` tags → CLS (layout shift)
- `'use client'` on homepage → entire page is client-rendered (kills FCP/LCP)
- All providers (Auth, Cart, Booking, Chat) hydrate on every page
- Scanline CSS animation runs continuously
- No `next.config.ts` image optimization config
- Inline SVG QR code in financing section (~3 KB of path data)

---

## Phase 1: Image Optimization (Biggest Win — Performance +15-20 pts)

### 1A. Convert all self-hosted images to WebP

Use `sharp` (already in node_modules via Next.js) to batch-convert. One-time conversion, commit the WebP files, delete the originals.

**Target conversions:**
| File | Current | Expected WebP |
|------|---------|---------------|
| `about-short.png` (2.2 MB) | PNG | ~150-200 KB |
| `auto-parts.png` (2.0 MB) | PNG | ~120-160 KB |
| `logo.png` (876 KB) | PNG | ~40-60 KB |
| `logo-new.png` (664 KB) | PNG | ~30-50 KB |
| `car-audio.png` (472 KB) | PNG | ~40-60 KB |
| Service PNGs (4 files) | PNG | ~30-60 KB each |
| Competition PNGs (7 files) | PNG | ~20-40 KB each |
| Gallery `join-us.png` (639 KB) | PNG | ~50-70 KB |

**Estimated savings: ~8-10 MB → ~1-1.5 MB** (85% reduction)

### 1B. Switch all `<img>` to `next/image`

Replace every `<img src=...>` with `<Image>` from `next/image`:
- Automatic WebP/AVIF serving (browser negotiation)
- Responsive `srcset` generation
- Built-in lazy loading (default) + `priority` for above-fold
- Blur placeholder support (eliminates CLS)
- Width/height enforcement

**Files to update:**
- `app/[locale]/page.tsx` — service cards (3), brand logos (6), about image
- `app/[locale]/gallery/page.tsx` — gallery grid
- `app/[locale]/services/page.tsx` — service detail images
- `components/ProductsSection.tsx` — product images (external URLs)

### 1C. Configure `next.config.ts` for image optimization

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // All 29 external product image domains
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'pisces.bbystatic.com' },
      { protocol: 'https', hostname: 'i.ebayimg.com' },
      { protocol: 'https', hostname: 'cdn11.bigcommerce.com' },
      // ... etc
      // Supabase Storage (for self-hosted product images)
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

---

## Phase 2: Video Optimization (Performance +5-10 pts)

### 2A. Compress hero video

```bash
ffmpeg -i hero-video.mp4 -vcodec libx264 -crf 28 -preset slow -vf scale=1280:-2 -an hero-video.mp4
```
- `-crf 28`: Good quality for dark background video overlaid with gradients
- `-vf scale=1280:-2`: Cap width at 1280px (mobile doesn't need 4K)
- `-an`: Strip audio (video is permanently muted)
- Expected: 2.8 MB → ~500-800 KB

### 2B. Add poster image for hero video

```bash
ffmpeg -i hero-video.mp4 -ss 00:00:01 -frames:v 1 -q:v 2 hero-poster.webp
```
Add `poster="/images/hero-poster.webp"` so the browser shows content immediately while video loads. This directly improves LCP.

### 2C. Lazy-load the about video

The about/preview video is below the fold:
- `preload="none"` instead of `preload="metadata"`
- Use IntersectionObserver to call `.play()` only when visible
- Respect `prefers-reduced-motion` and `navigator.connection.saveData`

### 2D. Mobile video strategy

On mobile (< 768px), replace hero video with the static poster image entirely:
- Video autoplay on mobile is unreliable and wastes bandwidth
- Poster with gradient overlay looks identical to the user
- Saves 500+ KB on mobile load

---

## Phase 3: Bundle & Rendering Optimization (Performance +10-15 pts)

### 3A. Convert homepage to Server Component

The homepage (`app/[locale]/page.tsx`) is `'use client'`. This ships the entire page JS to the browser.

**Fix:** Use `next-intl`'s server-side `getTranslations` instead of client-side `useTranslations`:
```typescript
// Before (client component)
'use client';
import { useTranslations } from 'next-intl';

// After (server component)
import { getTranslations } from 'next-intl/server';
export default async function Home() {
  const t = await getTranslations('home');
  // ... rest is pure HTML/JSX, no client JS needed
}
```

Interactive sections (HeroSection, ProductsSection, etc.) stay as `'use client'` — they're dynamically imported.

### 3B. Dynamic imports for below-fold components

```typescript
import dynamic from 'next/dynamic';

const ProductsSection = dynamic(() => import('@/components/ProductsSection'), {
  loading: () => <div className="h-96 bg-black" />,
});
const VideoSection = dynamic(() => import('@/components/VideoSection'), {
  loading: () => <div className="h-96 bg-black" />,
});
const StatsCounter = dynamic(() => import('@/components/StatsCounter'));
```

### 3C. Lazy-load ChatWidget

The ChatWidget loads on every page but isn't needed immediately:
```typescript
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
  loading: () => null, // Invisible until loaded
});
```

### 3D. Defer CheckoutModal

CheckoutModal loads via ClientLayout on every page. Dynamic import it:
```typescript
const CheckoutModal = dynamic(() => import('@/components/CheckoutModal'), {
  ssr: false,
});
```

### 3E. Remove unused dependencies

| Package | Size Impact | Action |
|---------|------------|--------|
| `@shopify/storefront-api-client` | ~50 KB | Remove (migrated to Clover) |
| `next-auth` | ~40 KB | Remove (using Supabase Auth) |
| `playwright` | ~100 MB node_modules | Move to devDependencies |

### 3F. Reduce Oxanium font weights

Currently loading 5 weights (400-800), only using 2:
```typescript
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: 'swap',
  weight: ["600", "700"], // Down from 5 weights → saves ~30 KB
});
```

Add `display: 'swap'` to all three font imports to eliminate FOUT.

---

## Phase 4: CSS & Animation Optimization (Performance +3-5 pts)

### 4A. Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  .scanline { display: none !important; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4B. Disable scanline on mobile

```css
@media (max-width: 768px) {
  .scanline { display: none; }
}
```
The scanline animation is a full-viewport pseudo-element animating every 8s. On mobile it's barely visible and wastes GPU/battery.

### 4C. Simplify neon-glow on mobile

```css
@media (max-width: 768px) {
  .neon-glow { text-shadow: 0 0 5px var(--neon-blue); }
  .neon-border-soft { box-shadow: none; border-color: var(--neon-blue); }
}
```
Multi-layered text-shadows are expensive on mobile GPUs. Single shadow is visually equivalent on small screens.

### 4D. Create `.font-oxanium` utility class

Replace 50+ inline `style={{ fontFamily: 'var(--font-oxanium)' }}` with a CSS class:
```css
.font-oxanium { font-family: var(--font-oxanium); }
```
Saves ~10 KB of repeated inline styles in the HTML payload.

### 4E. Move chat animations to conditional CSS

`chat-panel-enter`, `typing-bounce` keyframes only used if chat is open. Move them to a separate file imported by ChatWidget only, so they don't bloat the main stylesheet.

---

## Phase 5: Micro-Optimizations (Performance +2-5 pts)

### 5A. Throttle scroll listeners

**Header scroll** (`Header.tsx`): fires `setIsScrolled()` on every scroll event (60+ fps). Add debounce:
```typescript
const handleScroll = () => {
  requestAnimationFrame(() => setIsScrolled(window.scrollY > 20));
};
```

**Hero parallax** (`HeroSection.tsx`): `setScrollY(window.scrollY)` causes re-render on every scroll frame. Use `requestAnimationFrame` or CSS `transform` via ref instead of state:
```typescript
const handleScroll = () => {
  if (videoRef.current) {
    videoRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }
};
```
This eliminates React re-renders entirely — direct DOM manipulation for scroll transforms.

### 5B. Add preconnect hints

In `app/layout.tsx` `<head>`:
```html
<link rel="preconnect" href="https://checkout.clover.com" />
<link rel="dns-prefetch" href="https://api.openai.com" />
```
Saves ~300-500ms on first Clover checkout or chat interaction.

### 5C. Cache middleware auth check

`middleware.ts` calls `supabase.auth.getSession()` up to 3-4 times per request through branching logic. Consolidate to a single call:
```typescript
const { data: { session } } = await supabase.auth.getSession();
// Use this single session object for all checks
```

### 5D. Remove console.log from production

- `HeroSection.tsx:57`: `console.log('Video autoplay prevented:', error)`
- `CheckoutModal.tsx`: `console.error('Clover init error:', err)`
- Various API routes with `console.error()`

Strip or gate behind `process.env.NODE_ENV === 'development'`.

### 5E. ProductsSection fetch optimization

Currently fires 3 sequential fetches (best-sellers → categories → inventory). Parallelize:
```typescript
const [bestSellers, categories, items] = await Promise.all([
  fetch('/api/best-sellers').then(r => r.json()),
  fetch('/api/clover/categories').then(r => r.json()),
  fetch('/api/clover/inventory?limit=8').then(r => r.json()),
]);
```

### 5F. Hero video — respect data saver

```typescript
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData = (navigator as any).connection?.saveData === true;
if (!prefersReduced && !saveData && videoRef.current) {
  videoRef.current.play().catch(() => {});
}
```

---

## Phase 6: Product Image Strategy — Self-Hosting

### 6A. Why self-host

Vercel's `next/image` proxy cache is temporary — when the cache expires and the original source is gone (Amazon deletes listing, domain expires), the image breaks permanently. Self-hosting eliminates this risk.

### 6B. Download all product images to Supabase Storage

Write a Node script:
1. Read `product-images.json` (~4,500 entries with URLs)
2. Download each image
3. Convert to WebP via sharp (resize to max 800px width)
4. Upload to Supabase Storage `product-images` bucket
5. Update `product-images.json` with new Supabase URLs

**Storage math:**
- ~4,500 images × ~50-100 KB each (after WebP conversion) = ~225-450 MB
- Supabase free tier = 1 GB storage → fits comfortably
- Single domain (`yourproject.supabase.co`) instead of 29 external domains

### 6C. Update next.config.ts

Add Supabase Storage to remotePatterns:
```typescript
{ protocol: 'https', hostname: '*.supabase.co' },
```

### 6D. Fallback strategy

Keep the original external URLs as fallbacks in case the download script misses any:
```typescript
// In product image component
<Image
  src={supabaseUrl || originalExternalUrl || '/images/placeholder.webp'}
  ...
/>
```

### 6E. Benefits after migration

| Before | After |
|--------|-------|
| 29 external domains (29 DNS lookups) | 1 domain (Supabase CDN) |
| No format control (JPG/PNG/whatever) | All WebP, ~50-100 KB each |
| Images can disappear anytime | Permanently self-hosted |
| No cache control | Supabase CDN caching + Vercel proxy |
| ~200-2000 KB per image | ~50-100 KB per image (WebP, resized) |

---

## Phase 7: Accessibility Polish (Accessibility → 100)

### 7A. Color contrast

`#E01020` on `#0a0a0a` = 4.6:1 ratio. Passes WCAG AA for large text (18px+), fails for body text.

Fix for small text: use `#FF2A3A` (lighter red, 5.2:1) or add a subtle background behind small red text.

### 7B. ARIA labels

Audit all icon-only buttons:
- Cart button in Header
- Chat toggle button
- Mobile menu hamburger
- Close buttons on modals
- Language toggle

### 7C. Focus management

- Mobile menu should trap focus when open
- Modals (checkout, booking) should trap focus
- Ensure visible focus indicators on all interactive elements (some may be hidden by the cyberpunk styling)

### 7D. Video accessibility

- Add `aria-hidden="true"` to decorative hero video
- Add `title` attribute to BayReady iframe

---

## Phase 8: SEO & Best Practices (SEO → 98+)

### 8A. Structured data (JSON-LD)

```typescript
const structuredData = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "Next Level Audio",
  "image": "https://nextlevelaudiopa.com/images/logo.webp",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "944 North 9th Street",
    "addressLocality": "Stroudsburg",
    "addressRegion": "PA",
    "postalCode": "18360",
    "addressCountry": "US"
  },
  "telephone": "(570) 730-4433",
  "email": "nextlevelauto@ymail.com",
  "url": "https://nextlevelaudiopa.com",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "19:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "15:00" }
  ],
  "priceRange": "$$",
  "sameAs": ["https://facebook.com/nextlevelaudio", "https://instagram.com/nextlevelaudio"]
};
```

### 8B. Open Graph + Twitter Card meta

```tsx
export const metadata: Metadata = {
  title: 'Next Level Audio | Car Audio, Tinting & Custom Electronics',
  description: 'Professional car audio installation, window tinting, remote start, and custom electronics in Stroudsburg, PA.',
  openGraph: {
    title: 'Next Level Audio',
    description: '...',
    url: 'https://nextlevelaudiopa.com',
    siteName: 'Next Level Audio',
    images: [{ url: '/images/og-image.webp', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next Level Audio',
    description: '...',
    images: ['/images/og-image.webp'],
  },
};
```

### 8C. Canonical URLs for i18n

Prevent Google from seeing EN and ES as duplicate content:
```tsx
<link rel="canonical" href="https://nextlevelaudiopa.com/" />
<link rel="alternate" hrefLang="en" href="https://nextlevelaudiopa.com/" />
<link rel="alternate" hrefLang="es" href="https://nextlevelaudiopa.com/es/" />
```

---

## Services You Need to Sign Up For

### None required!

| Service | Needed? | Why |
|---------|---------|-----|
| **Cloudinary** | No | Vercel `next/image` + Supabase Storage covers everything |
| **Imgix** | No | Same — Vercel handles optimization |
| **AWS CloudFront** | No | Vercel's edge network is the CDN |
| **Video CDN (Mux)** | No | ffmpeg compression sufficient for 2 short videos |
| **Sentry** | Optional | For production error logging (replaces console.error) |

### Tools we'll use (all free/built-in):
- **sharp** (already installed) — one-time PNG → WebP conversion
- **ffmpeg** (install locally) — video compression
- **next/image** — automatic optimization at serve time
- **Supabase Storage** (already have account) — self-host product images
- **Vercel's edge CDN** — caching + global distribution (included)

---

## Execution Order (Tomorrow's Session)

### Quick Wins First (~30 min)
1. Remove unused deps (`@shopify/storefront-api-client`, `next-auth`, move `playwright`)
2. Add `display: 'swap'` to all fonts, trim Oxanium weights
3. Create `.font-oxanium` CSS class, batch replace inline styles
4. Add preconnect hints to layout
5. Strip console.log from production code

### Image Overhaul (~45 min)
6. Batch convert all PNGs → WebP via sharp
7. Configure `next.config.ts` with `images` block + remotePatterns
8. Replace all `<img>` with `<Image>` across homepage components
9. Add blur placeholders for above-fold images

### Video Optimization (~20 min)
10. ffmpeg compress hero + about videos
11. Generate poster frame for hero
12. Lazy-load about video (IntersectionObserver)
13. Mobile: poster-only, no video autoplay

### Bundle & Rendering (~30 min)
14. Convert homepage to server component (`getTranslations`)
15. Dynamic import below-fold components
16. Lazy-load ChatWidget + CheckoutModal
17. Parallelize ProductsSection fetches

### CSS & Animations (~15 min)
18. `prefers-reduced-motion` media query
19. Disable scanline + simplify neon-glow on mobile
20. Move chat animations to conditional CSS

### Micro-Optimizations (~15 min)
21. Throttle scroll listeners (RAF instead of state)
22. Consolidate middleware auth call
23. Hero video: respect data saver

### Product Images (~30 min)
24. Write download script → Supabase Storage
25. Update `product-images.json` with self-hosted URLs
26. Add Supabase to remotePatterns

### SEO & Accessibility (~20 min)
27. JSON-LD structured data
28. Open Graph + Twitter Card meta
29. Canonical URLs for i18n
30. ARIA label audit
31. Color contrast fixes for small text

### Verify (~10 min)
32. Run Lighthouse on mobile
33. Compare before/after scores
34. Deploy

**Estimated total: ~3.5 hours**

---

## Expected Final Scores

| Category | Current | Target | Key Improvements |
|----------|---------|--------|------------------|
| Performance | 46 | 90+ | Images (WebP, next/image), video compression, server components, code splitting, scroll throttling |
| Accessibility | 100 | 100 | Maintain + ARIA labels, contrast fixes, focus traps, reduced motion |
| Best Practices | 88 | 95+ | HTTPS images, proper sizing, no deprecated APIs, no console.log in prod |
| SEO | 92 | 98+ | Structured data, OG tags, canonical URLs, unique meta descriptions |

---

## Impact Summary

| Optimization | Estimated Size Savings | Perf Impact |
|-------------|----------------------|-------------|
| PNG → WebP conversion | ~8 MB saved | +10-15 pts |
| Video compression | ~3.5 MB saved | +5-8 pts |
| Server component + code splitting | ~200 KB JS saved | +8-12 pts |
| next/image (auto srcset, lazy, AVIF) | Variable | +5-8 pts |
| Unused deps removal | ~90 KB JS saved | +2-3 pts |
| Font optimization | ~30 KB saved | +1-2 pts |
| Scroll throttling + RAF | 0 KB (CPU savings) | +2-3 pts |
| CSS cleanup (mobile) | ~5 KB saved | +1-2 pts |
| Product image self-hosting | 29 → 1 domain | +3-5 pts |
| **TOTAL** | **~12 MB saved** | **~37-58 pts** |
