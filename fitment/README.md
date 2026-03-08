# BayReady Fitment Scraper v2

Scrapes vehicle fitment data (which products fit which vehicles) from Sonic Electronix
using **Patchright** (stealth Playwright fork) to bypass Cloudflare bot protection, then seeds
the BayReady fitment database via the `/fitment/bulk` API endpoint.

## Architecture

```
NHTSA API → vehicles.json (year/make/model list, ~5000+ combos)
    ↓
Sonic Electronix (via Patchright browser) → fitments.json (products per vehicle)
    ↓
POST /fitment/bulk → BayReady PostgreSQL (fitment_entries table)
    ↓
GET /fitment?year=X&make=Y&model=Z → FitmentFlow.tsx (chatbot UI)
```

### Why Patchright?

Sonic Electronix uses Cloudflare bot protection — all HTTP requests (curl, axios, fetch)
return 403. A real browser is required to pass the JavaScript challenge. **Patchright** is
a stealth fork of Playwright that removes automation signals at the source level (CDP
`Runtime.Enable` leak, `AutomationControlled` blink feature, etc.).

### Features

- **Resumable** — saves progress every 10 vehicles to `output/fitments.json`; safe to Ctrl+C and restart
- **Rate-limited** — 2-5 second random delays between pages, max 2 concurrent
- **Cloudflare bypass** — headed Chromium via Patchright (stealth fork of Playwright)
- **Inspect mode** — dumps real HTML for selector calibration before full scrape
- **Direct DB seeding** — transforms scraped data and pushes to BayReady API in batches

## Setup

```bash
cd fitment
npm install
npm run setup   # Installs Patchright's stealth Chromium
```

## Workflow

### Step 1: Build vehicle list

```bash
npm run vehicles
```

Pulls every year/make/model from the NHTSA API (2000-2026) and saves to
`output/vehicles.json` with Sonic Electronix URLs.

### Step 2: Inspect page structure

```bash
npm run inspect
```

Opens ONE Sonic Electronix page in a real browser, waits for Cloudflare to resolve,
then dumps the rendered HTML to `output/inspect.html` and prints an analysis of
found product selectors.

**Review the output** and update the `SELECTORS` object in `scraper.mjs` if the
default selectors don't match the actual HTML structure.

### Step 3: Test with 5 vehicles

```bash
npm run test
```

Scrapes only the first 5 vehicles. Check `output/fitments.json` to verify
the data looks correct before running the full scrape.

### Step 4: Full scrape

```bash
npm run scrape
```

Scrapes all vehicles. This will take several hours. The scraper saves progress
every 10 vehicles, so you can stop and restart anytime.

**Time estimate:** ~5,000 vehicles × 3-5s per vehicle = 4-7 hours

### Step 5: Seed the database

```bash
npm run seed
```

Reads `output/fitments.json`, transforms products to FitmentEntry records,
deduplicates, and sends them in batches of 100 to the BayReady API.

### Step 6: Verify

```bash
curl "https://bayready-production.up.railway.app/fitment?year=2018&make=Honda&model=Civic"
```

Or use the NLA chatbot → "Check Fitment" → enter a vehicle → see parts.

## Output Schema

### fitments.json

```json
[
  {
    "vehicle": {
      "year": 2018,
      "make": "Honda",
      "model": "Civic"
    },
    "products": [
      {
        "name": "Metra 99-7812B DIN Size Radio Dash Kit",
        "brand": "Metra",
        "price": "$17.99",
        "category": "Dash Kits",
        "sku": "99-7812B",
        "partNumber": "99-7812B",
        "image": "https://...",
        "url": "/product/..."
      }
    ],
    "totalFound": 47,
    "scrapedAt": "2026-03-06T12:00:00Z"
  }
]
```

### FitmentEntry (seeded to DB)

```json
{
  "year": 2018,
  "make": "Honda",
  "model": "Civic",
  "trim": null,
  "category": "dash-kit",
  "partNumber": "99-7812B",
  "partName": "Metra 99-7812B DIN Size Radio Dash Kit",
  "brand": "Metra",
  "notes": null
}
```

## Configuration

Edit the `CONFIG` object at the top of `scraper.mjs`:

| Setting | Default | Description |
|---------|---------|-------------|
| `yearRange.min` | 2000 | Oldest vehicle year to include |
| `yearRange.max` | 2026 | Newest vehicle year to include |
| `maxConcurrency` | 2 | Simultaneous browser tabs |
| `minDelayMs` | 2000 | Minimum delay between pages |
| `maxDelayMs` | 5000 | Maximum delay between pages |
| `headless` | false | Set true after confirming bypass works |
| `seedBatchSize` | 100 | Entries per seed API call |
| `testVehicle` | 2018 Honda Civic | Vehicle used by `inspect` command |

## Category Mapping

Sonic Electronix categories are mapped to BayReady fitment categories:

| Sonic Electronix | BayReady |
|-----------------|----------|
| Dash Kits, Radio Installation, DIN Kit | `dash-kit` |
| Wire Harness, Wiring Harnesses | `wire-harness` |
| Speakers, Front Speakers | `speaker-front` / `speaker-rear` |
| Amplifiers | `amplifier` |
| Subwoofers | `subwoofer` |
| Antenna Adapters | `antenna-adapter` |
| Steering Wheel Controls | `steering-wheel-control` |

Unmapped categories are slugified automatically (e.g., "Signal Processor" → `signal-processor`).

## Troubleshooting

**Inspect shows Cloudflare challenge page:**
Try:
- Make sure `headless: false` (headed mode works better)
- Wait longer — some challenges take 10-15 seconds
- Update Patchright: `npm update patchright && npm run setup`

**Scraper returns 0 products:**
The HTML selectors need calibration. Run `npm run inspect`, open `output/inspect.html`
in your browser, and update the `SELECTORS` object in `scraper.mjs`.

**Getting blocked after many requests:**
- Increase delays (`minDelayMs`, `maxDelayMs`)
- Reduce `maxConcurrency` to 1
- If IP is flagged, consider a residential proxy

**JSON file getting massive:**
The full dataset could be hundreds of MB. Consider narrowing the year range or
scraping only common makes (Honda, Toyota, Ford, Chevy, etc.).
