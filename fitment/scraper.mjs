// ============================================================================
// BayReady Fitment Scraper v2 — Patchright + Crawlee
// ============================================================================
// Scrapes fitment data from Sonic Electronix using a real browser to bypass
// Cloudflare bot protection. Uses Crawlee for resumable queue management.
//
// Usage:
//   npm run setup       Install Patchright's stealth Chromium
//   npm run vehicles    Build vehicle list from NHTSA API
//   npm run inspect     Open one page in browser, dump HTML for selector review
//   npm run test        Scrape first 5 vehicles (verify selectors)
//   npm run scrape      Full scrape (resumable — safe to Ctrl+C and restart)
//   npm run seed        Push fitments.json to BayReady database
//
// Requirements:
//   npm install
//   npm run setup
// ============================================================================

import { chromium } from 'patchright';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Railway deployment: set RAILWAY_VOLUME_MOUNT_PATH=/data to use persistent volume
const isRailway = !!process.env.RAILWAY_ENVIRONMENT;
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || '.';

const CONFIG = {
  // Sonic Electronix fitment URL pattern
  baseUrl: 'https://www.sonicelectronix.com/find-parts-that-fit-',

  // Rate limiting — be polite, avoid triggering Cloudflare
  maxConcurrency: 2,
  minDelayMs: 2000,
  maxDelayMs: 5000,

  // Retry
  maxRetries: 3,

  // NHTSA
  yearRange: { min: 2000, max: 2026 },

  // Popular makes filter — only scrape these to keep the job manageable.
  // Set to null to scrape ALL makes (warning: 34K+ vehicles, takes days).
  popularMakes: [
    'ACURA', 'AUDI', 'BMW', 'BUICK', 'CADILLAC', 'CHEVROLET', 'CHRYSLER',
    'DODGE', 'FORD', 'GMC', 'HONDA', 'HYUNDAI', 'INFINITI', 'JEEP', 'KIA',
    'LEXUS', 'LINCOLN', 'MAZDA', 'MERCEDES-BENZ', 'MITSUBISHI', 'NISSAN',
    'RAM', 'SCION', 'SUBARU', 'TESLA', 'TOYOTA', 'VOLKSWAGEN', 'VOLVO',
  ],

  // Max pages to paginate per vehicle (20 products/page).
  // First 3-5 pages have vehicle-specific parts; later pages are universal.
  maxPagesPerVehicle: 5,

  // Output — use persistent volume on Railway, local ./output otherwise
  outputDir: `${dataDir}/output`,
  vehiclesFile: `${dataDir}/output/vehicles.json`,
  fitmentsFile: `${dataDir}/output/fitments.json`,

  // BayReady API for seeding
  bayreadyApi: process.env.BAYREADY_API_URL || 'https://bayready-production.up.railway.app',
  seedBatchSize: 100,

  // Browser — on Railway, Xvfb provides a virtual display so we can run "headed"
  // Headed mode is critical for Cloudflare bypass via Patchright
  headless: false,

  // Test page for inspect/calibration
  testVehicle: { year: 2018, make: 'Honda', model: 'Civic' },
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
  return CONFIG.minDelayMs + Math.random() * (CONFIG.maxDelayMs - CONFIG.minDelayMs);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildVehicleUrl(year, make, model) {
  const slug = `${year}-${slugify(make)}-${slugify(model)}`;
  return `${CONFIG.baseUrl}${slug}`;
}

function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Category Mapping
// ---------------------------------------------------------------------------
// Maps Sonic Electronix category names to our BayReady fitment categories.
// Will be refined after inspecting actual page content.

const CATEGORY_MAP = {
  // Dash kits / radio installation
  'dash kit': 'dash-kit',
  'dash kits': 'dash-kit',
  'radio installation': 'dash-kit',
  'installation kit': 'dash-kit',
  'mounting kit': 'dash-kit',
  'radio mounting': 'dash-kit',
  'din kit': 'dash-kit',
  'single din': 'dash-kit',
  'double din': 'dash-kit',

  // Wire harnesses
  'wire harness': 'wire-harness',
  'wiring harness': 'wire-harness',
  'wiring harnesses': 'wire-harness',
  'harness': 'wire-harness',
  'harness adapter': 'wire-harness',
  'radio harness': 'wire-harness',

  // Speakers
  'speakers': 'speaker',
  'speaker': 'speaker',
  'front speakers': 'speaker-front',
  'rear speakers': 'speaker-rear',
  'front door speakers': 'speaker-front',
  'rear door speakers': 'speaker-rear',
  'rear deck speakers': 'speaker-rear',
  'component speakers': 'speaker',
  'coaxial speakers': 'speaker',

  // Amplifiers
  'amplifier': 'amplifier',
  'amplifiers': 'amplifier',
  'amp': 'amplifier',
  'amps': 'amplifier',

  // Subwoofers
  'subwoofer': 'subwoofer',
  'subwoofers': 'subwoofer',
  'sub': 'subwoofer',
  'subs': 'subwoofer',
  'subwoofer box': 'subwoofer-enclosure',
  'subwoofer enclosure': 'subwoofer-enclosure',

  // Antenna
  'antenna adapter': 'antenna-adapter',
  'antenna adapters': 'antenna-adapter',
  'antenna': 'antenna-adapter',

  // Steering wheel controls
  'steering wheel control': 'steering-wheel-control',
  'steering wheel controls': 'steering-wheel-control',
  'steering wheel interface': 'steering-wheel-control',
  'swc interface': 'steering-wheel-control',
  'swc': 'steering-wheel-control',

  // Misc
  'backup camera': 'backup-camera',
  'signal processor': 'signal-processor',
  'sound damping': 'sound-damping',
  'sound deadening': 'sound-damping',
};

function mapCategory(rawCategory) {
  if (!rawCategory) return 'other';
  const key = rawCategory.toLowerCase().trim();
  return CATEGORY_MAP[key] || slugify(rawCategory);
}

// ---------------------------------------------------------------------------
// Step 1: Build Vehicle List from NHTSA API
// ---------------------------------------------------------------------------

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'BayReady-Fitment-Bot/2.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function buildVehicleList() {
  console.log('Building vehicle list from NHTSA API...');
  console.log(`Year range: ${CONFIG.yearRange.min} — ${CONFIG.yearRange.max}`);
  const vehicles = [];

  // Get all car makes
  const makesData = await fetchJSON(
    'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json'
  );
  let makes = makesData.Results.map(r => r.MakeName);
  console.log(`Found ${makes.length} car makes from NHTSA`);

  // Filter to popular makes if configured
  if (CONFIG.popularMakes) {
    const popularSet = new Set(CONFIG.popularMakes.map(m => m.toUpperCase()));
    makes = makes.filter(m => popularSet.has(m.toUpperCase()));
    console.log(`Filtered to ${makes.length} popular makes: ${makes.join(', ')}`)
  }

  for (let year = CONFIG.yearRange.min; year <= CONFIG.yearRange.max; year++) {
    console.log(`\nProcessing year ${year}...`);
    let yearCount = 0;

    for (const make of makes) {
      await sleep(100); // Polite NHTSA delay

      try {
        const modelsData = await fetchJSON(
          `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
        );
        const models = modelsData.Results.map(r => r.Model_Name);

        for (const model of models) {
          vehicles.push({
            year,
            make,
            model,
            slug: `${year}-${slugify(make)}-${slugify(model)}`,
            url: buildVehicleUrl(year, make, model),
          });
        }

        if (models.length > 0) {
          yearCount += models.length;
        }
      } catch (err) {
        // Skip failed makes silently (NHTSA sometimes 404s on obscure makes)
      }
    }

    console.log(`  ${year}: ${yearCount} models`);
  }

  ensureOutputDir();
  fs.writeFileSync(CONFIG.vehiclesFile, JSON.stringify(vehicles, null, 2));
  console.log(`\nSaved ${vehicles.length} vehicles to ${CONFIG.vehiclesFile}`);
  return vehicles;
}

// ---------------------------------------------------------------------------
// Step 2: Inspect — Load One Page and Dump HTML
// ---------------------------------------------------------------------------

async function inspectPage() {
  const { year, make, model } = CONFIG.testVehicle;
  const url = buildVehicleUrl(year, make, model);
  console.log(`Inspecting: ${url}`);
  console.log('Opening browser (headed mode)...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    // Navigate — use 'domcontentloaded' since 'networkidle' may never fire
    console.log('Navigating...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for any Cloudflare challenge to resolve
    let title = await page.title();
    console.log(`Initial title: ${title}`);

    const startTime = Date.now();
    while (
      (title.toLowerCase().includes('just a moment') ||
       title.toLowerCase().includes('challenge') ||
       title.toLowerCase().includes('attention')) &&
      Date.now() - startTime < 45000
    ) {
      await sleep(2000);
      title = await page.title();
      console.log(`  Waiting for CF... title: ${title}`);
    }

    // Let the page render
    console.log('Page loaded. Waiting for JS rendering...');
    await sleep(5000);

    // Take a screenshot to see what we're looking at
    ensureOutputDir();
    await page.screenshot({ path: './output/inspect-1-initial.png', fullPage: false });
    console.log('Screenshot saved: output/inspect-1-initial.png');

    // Check for vehicle body/trim confirmation modal
    // Sonic Electronix often asks to confirm body style (sedan, coupe, etc.)
    console.log('\nChecking for vehicle confirmation modal...');
    const modalOrSelector = await page.evaluate(() => {
      // Look for modal/overlay/popup elements
      const modals = document.querySelectorAll(
        '[class*="modal"], [class*="popup"], [class*="overlay"], [class*="dialog"], ' +
        '[role="dialog"], [class*="select-body"], [class*="vehicle-select"], ' +
        '[class*="confirm"], [class*="body-style"]'
      );

      const results = [];
      for (const m of modals) {
        const visible = m.offsetParent !== null || getComputedStyle(m).display !== 'none';
        if (visible) {
          results.push({
            tag: m.tagName,
            className: m.className,
            text: m.textContent?.substring(0, 300),
            links: Array.from(m.querySelectorAll('a, button')).map(el => ({
              tag: el.tagName,
              text: el.textContent?.trim(),
              href: el.getAttribute('href'),
              className: el.className,
            })).slice(0, 20),
          });
        }
      }
      return results;
    });

    if (modalOrSelector.length > 0) {
      console.log(`Found ${modalOrSelector.length} modal/popup element(s):`);
      for (const m of modalOrSelector) {
        console.log(`  <${m.tag} class="${m.className}">`);
        console.log(`  Text preview: ${m.text?.substring(0, 200)}`);
        if (m.links.length > 0) {
          console.log(`  Clickable elements:`);
          for (const link of m.links) {
            console.log(`    <${link.tag}> "${link.text}" → ${link.href || link.className}`);
          }
        }
      }
    } else {
      console.log('No modal detected.');
    }

    // Also try clicking the first option if a body/trim selector exists
    // Common pattern: list of links like "4 Door Sedan", "2 Door Coupe"
    const bodyLinks = await page.$$('a[href*="find-parts-that-fit"]');
    if (bodyLinks.length > 1) {
      console.log(`\nFound ${bodyLinks.length} vehicle variant links. Clicking first one...`);
      const firstLinkText = await bodyLinks[0].textContent();
      console.log(`  Clicking: "${firstLinkText?.trim()}"`);
      await bodyLinks[0].click();
      await sleep(5000);
      await page.screenshot({ path: './output/inspect-2-after-click.png', fullPage: false });
      console.log('Screenshot saved: output/inspect-2-after-click.png');
    }

    title = await page.title();
    console.log(`\nFinal title: ${title}`);

    // Dump the rendered HTML
    const html = await page.content();
    ensureOutputDir();
    fs.writeFileSync('./output/inspect.html', html);
    console.log(`\nHTML dumped to output/inspect.html (${(html.length / 1024).toFixed(1)} KB)`);

    // Try to identify product elements
    const analysis = await page.evaluate(() => {
      const results = {
        title: document.title,
        url: window.location.href,
        productSelectors: {},
        paginationInfo: null,
        totalResultsText: null,
      };

      // Try common product container selectors
      const selectors = [
        '[data-product]', '[data-product-id]', '[data-item-id]',
        '.product-card', '.product-item', '.product-list-item',
        '.product-tile', '.product-grid-item', '.product',
        '.item-card', '.item', '.listing-item',
        '[class*="product"]', '[class*="item-card"]',
        '.search-result', '.result-item',
      ];

      for (const sel of selectors) {
        const count = document.querySelectorAll(sel).length;
        if (count > 0) {
          results.productSelectors[sel] = count;

          // Sample first element's structure
          const el = document.querySelector(sel);
          if (el) {
            results.productSelectors[`${sel}_sample`] = {
              tagName: el.tagName,
              className: el.className,
              innerHTML_preview: el.innerHTML.substring(0, 500),
              children: Array.from(el.children).map(c => ({
                tag: c.tagName,
                class: c.className,
                text: c.textContent?.substring(0, 100),
              })),
            };
          }
        }
      }

      // Look for pagination
      const paginationEls = document.querySelectorAll(
        '.pagination, .pager, [class*="pagination"], nav[aria-label*="page"], .page-numbers'
      );
      if (paginationEls.length > 0) {
        results.paginationInfo = {
          selector: paginationEls[0].className,
          links: Array.from(paginationEls[0].querySelectorAll('a')).map(a => ({
            text: a.textContent?.trim(),
            href: a.href,
          })).slice(0, 10),
        };
      }

      // Look for result count text
      const countEls = document.querySelectorAll(
        '.results-count, .product-count, .total-results, [class*="result"], [class*="showing"]'
      );
      for (const el of countEls) {
        const text = el.textContent?.trim();
        if (text && /\d+/.test(text)) {
          results.totalResultsText = text;
          break;
        }
      }

      return results;
    });

    console.log('\n=== Page Analysis ===');
    console.log(`Title: ${analysis.title}`);
    console.log(`URL: ${analysis.url}`);

    console.log('\nProduct selectors found:');
    for (const [sel, count] of Object.entries(analysis.productSelectors)) {
      if (!sel.endsWith('_sample')) {
        console.log(`  ${sel}: ${count} elements`);
      }
    }

    if (analysis.paginationInfo) {
      console.log(`\nPagination: ${JSON.stringify(analysis.paginationInfo, null, 2)}`);
    }

    if (analysis.totalResultsText) {
      console.log(`\nResults count text: "${analysis.totalResultsText}"`);
    }

    // Also dump the analysis
    fs.writeFileSync('./output/inspect-analysis.json', JSON.stringify(analysis, null, 2));
    console.log('\nFull analysis saved to output/inspect-analysis.json');
    console.log('\nReview output/inspect.html in your browser to fine-tune selectors.');

  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Step 3/4: Scrape Fitments (Test or Full)
// ---------------------------------------------------------------------------

// Calibrated selectors based on Sonic Electronix HTML structure (March 2026).
//
// Page structure:
//   - Overview page has ALL products paginated (?page=2, ?page=3...)
//   - Body confirmation modal blocks the page — dismiss via JS
//   - Product cards are .productRow containers
//   - Product name + link in .productContent a[href*="/item-"]
//   - Brand is first word of product name (Metra, Kicker, etc.)
//   - Part number is in URL: /item-12345-Brand-PartNumber.html
//   - Category not on individual cards — use page-level category tabs
//   - Pagination via "Next" link → ?page=N

/**
 * Force-dismiss all Sonic Electronix modals (body selector, email popup, etc.)
 */
async function dismissModals(page) {
  await page.evaluate(() => {
    // Hide the body confirmation modal and email popup
    document.querySelectorAll(
      '.afg-modal, .afg-change-options-modal, .black-overlay, .modal-backdrop, ' +
      '.modal.show, [class*="modal"][style*="display: block"]'
    ).forEach(el => { el.style.display = 'none'; });
    // Remove overlays
    document.querySelectorAll('.modal-backdrop, .black-overlay.active').forEach(el => el.remove());
    // Restore body scrolling
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  });
}

/**
 * Extract all products from the current page's .productRow cards.
 */
async function extractProducts(page) {
  return page.evaluate(() => {
    const products = [];
    const rows = document.querySelectorAll('.productRow');

    rows.forEach(row => {
      // Find the main product link (to /item-*)
      const links = row.querySelectorAll('a[href*="/item-"]');
      // The product name link is usually the second one (first is image)
      const nameLink = Array.from(links).find(a => a.textContent?.trim().length > 2);
      if (!nameLink) return;

      const name = nameLink.textContent.trim();
      const href = nameLink.getAttribute('href') || '';

      // Extract part number using multiple strategies:
      let partNumber = '';

      // Strategy 1: Part number in parentheses — "Kicker CSC65 (46CSC654)"
      const parenMatch = name.match(/\(([A-Z0-9][-A-Z0-9./]+)\)/i);
      if (parenMatch) {
        partNumber = parenMatch[1];
      }

      // Strategy 2: Extract model number from product name
      // Patterns: "Metra 82-7805", "Alpine iLX-W650", "Belva BMV62W"
      if (!partNumber) {
        const withoutBrand = name.replace(/^\S+\s+/, '');
        // Match common part number patterns (alphanumeric with hyphens/dots)
        const modelMatch = withoutBrand.match(/\b([A-Z]*\d+[-.]?[A-Z0-9]*[-.]?[A-Z0-9]*)\b/i);
        if (modelMatch && modelMatch[1].length >= 3) {
          partNumber = modelMatch[1];
        }
      }

      // Strategy 3: Fallback to URL slug
      if (!partNumber) {
        const urlMatch = href.match(/\/item-\d+-(.+)\.html/);
        if (urlMatch) partNumber = urlMatch[1];
      }

      // Brand = first word of product name
      const brand = name.split(/\s+/)[0] || '';

      // Price — look for the sale/current price
      const priceEl = row.querySelector('.productPrice, [class*="price"]');
      let price = '';
      if (priceEl) {
        const priceMatch = priceEl.textContent.match(/\$[\d,.]+/);
        if (priceMatch) price = priceMatch[0];
      }

      // Image
      const imgEl = row.querySelector('img');
      const image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';

      // "Fits your [Vehicle]" badge as confirmation
      const fitsText = row.textContent.includes('Fits') ? 'vehicle-specific' : '';

      products.push({
        name,
        brand,
        partNumber: partNumber || name, // fallback to full name
        price,
        image,
        url: href,
        fitment: fitsText,
      });
    });

    return products;
  });
}

/**
 * Check if there's a "Next" pagination link and return its href.
 */
async function getNextPageUrl(page) {
  return page.evaluate(() => {
    const allLinks = Array.from(document.querySelectorAll('a'));
    const nextLink = allLinks.find(a => a.textContent?.trim() === 'Next');
    return nextLink?.getAttribute('href') || null;
  });
}

async function scrapeFitments(testMode = false) {
  // Load vehicle list — auto-generate if missing (e.g. first Railway deploy)
  if (!fs.existsSync(CONFIG.vehiclesFile)) {
    console.log('Vehicle list not found. Generating from NHTSA API...');
    await buildVehicleList();
  }

  let vehicles = JSON.parse(fs.readFileSync(CONFIG.vehiclesFile, 'utf-8'));
  console.log(`Loaded ${vehicles.length} vehicles`);

  if (testMode) {
    vehicles = vehicles.slice(0, 5);
    console.log('TEST MODE: Only scraping first 5 vehicles\n');
  }

  // Load existing progress
  ensureOutputDir();
  let allFitments = [];
  if (fs.existsSync(CONFIG.fitmentsFile)) {
    allFitments = JSON.parse(fs.readFileSync(CONFIG.fitmentsFile, 'utf-8'));
    console.log(`Loaded ${allFitments.length} existing fitment records`);
  }

  const completedSlugs = new Set(allFitments.map(f =>
    `${f.vehicle.year}-${slugify(f.vehicle.make)}-${slugify(f.vehicle.model)}`
  ));

  // Filter out already-completed vehicles
  const remaining = vehicles.filter(v => !completedSlugs.has(v.slug));
  console.log(`Remaining: ${remaining.length} vehicles to scrape\n`);

  if (remaining.length === 0) {
    console.log('All vehicles already scraped!');
    if (isRailway) {
      console.log('Railway: scrape complete. Exiting. Run seed manually or redeploy with "seed" command.');
    }
    return;
  }

  console.log(isRailway ? '(Running on Railway with Xvfb virtual display)' : '(Running locally)');

  // Launch browser with stealth settings
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });

  // Block unnecessary resources to speed things up (keep JS for Cloudflare)
  await context.route('**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,eot}', route => route.abort());
  await context.route('**/*.css', route => route.abort());

  const page = await context.newPage();
  let scraped = 0;
  let errors = 0;

  try {
    // First navigation — let Cloudflare challenge resolve
    console.log('Initial page load (resolving Cloudflare challenge)...');
    await page.goto(remaining[0].url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for Cloudflare to clear
    let title = await page.title();
    console.log(`Initial title: ${title}`);
    const startTime = Date.now();
    while (
      (title.toLowerCase().includes('just a moment') ||
       title.toLowerCase().includes('challenge') ||
       title.toLowerCase().includes('attention')) &&
      Date.now() - startTime < 45000
    ) {
      await sleep(2000);
      title = await page.title();
    }
    await sleep(5000);
    console.log(`Cloudflare passed! Page title: ${await page.title()}`);

    // Dismiss modals on the first page
    await dismissModals(page);
    console.log('Modals dismissed.\n');

    // Now scrape each vehicle using the same browser session
    for (let i = 0; i < remaining.length; i++) {
      const vehicle = remaining[i];
      const { year, make, model } = vehicle;

      try {
        console.log(`[${scraped + 1}/${remaining.length}] ${year} ${make} ${model}`);

        // Navigate to vehicle overview page
        await page.goto(vehicle.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(randomDelay());

        // Dismiss the body confirmation modal
        await dismissModals(page);

        // Extract products from page 1
        const products = await extractProducts(page);
        console.log(`  Page 1: ${products.length} products`);

        let allProducts = [...products];

        // Follow pagination (?page=2, ?page=3, etc.)
        let pageNum = 1;
        const maxPages = CONFIG.maxPagesPerVehicle;

        while (pageNum < maxPages) {
          const nextUrl = await getNextPageUrl(page);
          if (!nextUrl) break;

          pageNum++;
          const fullUrl = nextUrl.startsWith('http') ? nextUrl : `https://www.sonicelectronix.com${nextUrl}`;

          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await sleep(randomDelay());
          await dismissModals(page);

          const moreProducts = await extractProducts(page);
          if (moreProducts.length === 0) break;

          allProducts.push(...moreProducts);
          console.log(`  Page ${pageNum}: +${moreProducts.length} (total: ${allProducts.length})`);
        }

        if (allProducts.length > 0) {
          allFitments.push({
            vehicle: { year, make, model },
            products: allProducts,
            totalFound: allProducts.length,
            scrapedAt: new Date().toISOString(),
          });
        }

        scraped++;

        // Save progress every 10 vehicles
        if (scraped % 10 === 0) {
          fs.writeFileSync(CONFIG.fitmentsFile, JSON.stringify(allFitments, null, 2));
          console.log(`  [Progress saved: ${scraped}/${remaining.length}, ${allFitments.length} fitment records]\n`);
        }

      } catch (err) {
        errors++;
        console.error(`  ERROR: ${err.message}`);

        // If we get blocked, wait longer
        if (err.message.includes('403') || err.message.includes('challenge')) {
          console.log('  Possible Cloudflare block — waiting 30s...');
          await sleep(30000);
        }
      }
    }

  } finally {
    // Final save
    fs.writeFileSync(CONFIG.fitmentsFile, JSON.stringify(allFitments, null, 2));
    await browser.close();
  }

  console.log(`\nDone!`);
  console.log(`  Scraped: ${scraped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total fitment records: ${allFitments.length}`);
  console.log(`  Output: ${CONFIG.fitmentsFile}`);
}

// ---------------------------------------------------------------------------
// Step 5: Seed BayReady Database
// ---------------------------------------------------------------------------

async function seedDatabase() {
  if (!fs.existsSync(CONFIG.fitmentsFile)) {
    console.error('Fitments file not found. Run: npm run scrape');
    process.exit(1);
  }

  const fitments = JSON.parse(fs.readFileSync(CONFIG.fitmentsFile, 'utf-8'));
  console.log(`Loaded ${fitments.length} vehicle fitment records`);

  // Transform to FitmentEntry shape
  const entries = [];

  for (const fitment of fitments) {
    const { year, make, model } = fitment.vehicle;

    for (const product of fitment.products) {
      entries.push({
        year,
        make,
        model,
        trim: null,
        category: mapCategory(product.category),
        partNumber: product.partNumber || product.sku || product.name.substring(0, 50),
        partName: product.name,
        brand: product.brand || null,
        notes: null,
      });
    }
  }

  console.log(`Transformed into ${entries.length} fitment entries`);

  // Deduplicate by year+make+model+partNumber
  const seen = new Set();
  const unique = entries.filter(e => {
    const key = `${e.year}|${e.make}|${e.model}|${e.partNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`After dedup: ${unique.length} unique entries`);

  // Send in batches
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < unique.length; i += CONFIG.seedBatchSize) {
    const batch = unique.slice(i, i + CONFIG.seedBatchSize);

    try {
      const res = await fetch(`${CONFIG.bayreadyApi}/fitment/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: batch }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      sent += batch.length;
      console.log(`  Sent ${sent}/${unique.length}`);

    } catch (err) {
      failed += batch.length;
      console.error(`  Batch failed (${i}-${i + batch.length}): ${err.message}`);
    }

    // Small delay between batches
    await sleep(200);
  }

  console.log(`\nSeeding complete!`);
  console.log(`  Sent: ${sent}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${unique.length}`);
  console.log(`\nVerify: curl "${CONFIG.bayreadyApi}/fitment?year=2018&make=Honda&model=Civic"`);
}

// ---------------------------------------------------------------------------
// CLI Entry Point
// ---------------------------------------------------------------------------

const command = process.argv[2] || 'help';

switch (command) {
  case 'vehicles':
    await buildVehicleList();
    break;

  case 'inspect':
    await inspectPage();
    break;

  case 'test':
    await scrapeFitments(true);
    break;

  case 'scrape':
    await scrapeFitments(false);
    break;

  case 'seed':
    await seedDatabase();
    break;

  default:
    console.log(`
BayReady Fitment Scraper v2 (Playwright + Crawlee)

Usage:
  node scraper.mjs vehicles    Build vehicle list from NHTSA API
  node scraper.mjs inspect     Open one page in browser, dump HTML
  node scraper.mjs test        Scrape first 5 vehicles (test mode)
  node scraper.mjs scrape      Full scrape (resumable)
  node scraper.mjs seed        Push fitments to BayReady database

Workflow:
  1. npm install && npm run setup
  2. npm run vehicles              → output/vehicles.json
  3. npm run inspect               → output/inspect.html (review selectors)
  4. npm run test                  → output/fitments.json (5 vehicles)
  5. npm run scrape                → output/fitments.json (all vehicles)
  6. npm run seed                  → BayReady PostgreSQL
    `);
}
