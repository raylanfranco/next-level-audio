export interface PriceResult {
  distributor: string;
  distributorUrl: string;
  productName: string;
  productUrl: string;
  sku: string | null;
  priceCents: number | null;
  priceDisplay: string;
  inStock: boolean | null;
  imageUrl: string | null;
  matchConfidence: 'exact' | 'high' | 'partial';
}

export interface SearchResponse {
  query: string;
  results: PriceResult[];
  errors: { distributor: string; error: string }[];
  searchedAt: string;
}

export interface DistributorScraper {
  name: string;
  baseUrl: string;
  search(query: string): Promise<PriceResult[]>;
}
