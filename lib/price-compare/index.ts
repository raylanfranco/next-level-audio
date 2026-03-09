import type { PriceResult, SearchResponse, DistributorScraper } from './types';
import { metraScraper } from './scrapers/metra';
import { firstechScraper } from './scrapers/firstech';
import { ecusadScraper } from './scrapers/ecusad';
import { idatalinkScraper } from './scrapers/idatalink';
import { directechsScraper } from './scrapers/directechs';
import { meyerScraper } from './scrapers/meyer';
import { specialtyScraper } from './scrapers/specialty';

const ALL_SCRAPERS: DistributorScraper[] = [
  metraScraper,
  firstechScraper,
  ecusadScraper,
  idatalinkScraper,
  directechsScraper,
  meyerScraper,
  specialtyScraper,
];

const SCRAPER_TIMEOUT_MS = 15_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

export async function searchAllDistributors(query: string): Promise<SearchResponse> {
  const results: PriceResult[] = [];
  const errors: { distributor: string; error: string }[] = [];

  const settled = await Promise.allSettled(
    ALL_SCRAPERS.map(async (scraper) => {
      try {
        const scraperResults = await withTimeout(
          scraper.search(query),
          SCRAPER_TIMEOUT_MS
        );
        return { name: scraper.name, results: scraperResults };
      } catch (err) {
        throw { name: scraper.name, error: err };
      }
    })
  );

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(...result.value.results);
    } else {
      const reason = result.reason as { name: string; error: Error };
      errors.push({
        distributor: reason.name || 'Unknown',
        error: reason.error?.message || 'Search failed',
      });
    }
  }

  // Sort: exact matches first, then by price (nulls last)
  results.sort((a, b) => {
    const confidenceOrder = { exact: 0, high: 1, partial: 2 };
    const confDiff = confidenceOrder[a.matchConfidence] - confidenceOrder[b.matchConfidence];
    if (confDiff !== 0) return confDiff;

    // Both have prices — sort ascending
    if (a.priceCents !== null && b.priceCents !== null) return a.priceCents - b.priceCents;
    // Null prices go last
    if (a.priceCents === null && b.priceCents !== null) return 1;
    if (a.priceCents !== null && b.priceCents === null) return -1;
    return 0;
  });

  return {
    query,
    results,
    errors,
    searchedAt: new Date().toISOString(),
  };
}
