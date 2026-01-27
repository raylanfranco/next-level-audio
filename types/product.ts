// Unified product types for Next Level Audio
// Supports: Clover inventory, Affiliate products, and Shopify (legacy)

export type ProductSource = 'clover' | 'affiliate' | 'shopify';
export type ProductAvailability = 'in-stock' | 'special-order' | 'low-stock' | 'out-of-stock';

export interface ProductImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: ProductImage[];

  // Source tracking
  source: ProductSource;
  availability: ProductAvailability;

  // Clover-specific fields (when source === 'clover')
  cloverItemId?: string;
  stockQuantity?: number;

  // Affiliate-specific fields (when source === 'affiliate')
  affiliateUrl?: string;
  affiliateBrand?: string;
  affiliateCommission?: number;
  estimatedDelivery?: string; // e.g., "3-5 business days"

  // Common metadata
  category?: string;
  brand?: string;
  sku?: string;
  featured?: boolean;

  // Legacy Shopify support
  handle?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  search?: string;
  availability?: ProductAvailability[];
  source?: ProductSource[];
  brands?: string[];
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
}

export interface ProductBadgeConfig {
  label: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
  icon?: string;
}

export const PRODUCT_BADGES: Record<ProductAvailability, ProductBadgeConfig> = {
  'in-stock': {
    label: 'IN STOCK',
    color: 'green',
    icon: '🟢',
  },
  'special-order': {
    label: 'SPECIAL ORDER',
    color: 'blue',
    icon: '🔵',
  },
  'low-stock': {
    label: 'LOW STOCK',
    color: 'yellow',
    icon: '🟡',
  },
  'out-of-stock': {
    label: 'OUT OF STOCK',
    color: 'red',
    icon: '🔴',
  },
};

// Helper function to determine availability
export function getProductAvailability(product: Product): ProductAvailability {
  if (product.source === 'affiliate') {
    return 'special-order';
  }

  if (product.source === 'clover' && product.stockQuantity !== undefined) {
    if (product.stockQuantity === 0) return 'out-of-stock';
    if (product.stockQuantity < 5) return 'low-stock';
    return 'in-stock';
  }

  return product.availability || 'in-stock';
}

// Helper to get CTA text based on product type
export function getProductCTA(product: Product): string {
  if (product.source === 'affiliate') {
    return `View at ${product.affiliateBrand || 'Manufacturer'}`;
  }

  if (product.availability === 'out-of-stock') {
    return 'Out of Stock';
  }

  return 'Add to Cart';
}

// Common car audio brands
export const CAR_AUDIO_BRANDS = [
  'JL Audio',
  'Rockford Fosgate',
  'Kicker',
  'Alpine',
  'Pioneer',
  'Kenwood',
  'Sony',
  'Memphis Audio',
  'Hertz',
  'Focal',
  'Arc Audio',
  'Sundown Audio',
] as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  'Subwoofers',
  'Amplifiers',
  'Speakers',
  'Head Units',
  'Processors',
  'Enclosures',
  'Wiring & Cables',
  'Accessories',
  'Security Systems',
  'Remote Starters',
] as const;
