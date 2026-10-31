export interface Deal {
  slug: string;
  name: string;
  model: string;
  copyKey: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  priceCents: number;
  originalPriceCents?: number;
  discountPercent?: number;
  installationIncluded: boolean;
  active: boolean;
}

// Turn off the campaign here when the shop ends the promotion.
// These are installed offers arranged with the shop, not Clover checkout items.
export const EARLY_BLACK_FRIDAY_ENABLED = true;

const deals: Deal[] = [
  {
    slug: 'compustar-pro-940s',
    name: 'Compustar PRO 940S',
    model: 'CSP940-S',
    copyKey: 'pro940s',
    image: '/images/deals/compustar-pro-940s.jpg',
    imageWidth: 800,
    imageHeight: 800,
    priceCents: Math.round(48000 * (1 - 15 / 100)),
    originalPriceCents: 48000,
    discountPercent: 15,
    installationIncluded: true,
    active: true,
  },
  {
    slug: 'compustar-csx-5300s',
    name: 'Compustar CSX 5300S',
    model: 'CSX5300-S',
    copyKey: 'csx5300s',
    image: '/images/deals/compustar-csx-5300s.jpg',
    imageWidth: 800,
    imageHeight: 640,
    priceCents: 58999,
    installationIncluded: true,
    active: true,
  },
];

export function getActiveDeals() {
  return EARLY_BLACK_FRIDAY_ENABLED ? deals.filter((deal) => deal.active) : [];
}

export function getDeal(slug: string) {
  return getActiveDeals().find((deal) => deal.slug === slug);
}

export function formatDealPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
