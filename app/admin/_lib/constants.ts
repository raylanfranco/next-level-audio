// Shared constants for the admin panel.
// statusColors + serviceNames extracted verbatim from the original page.tsx.

export const PAGE_SIZE = 25;

// Semantic status badge colors (dark/light variants). Consumed by StatusBadge.
export const statusColors: Record<string, { dark: string; light: string }> = {
  pending: {
    dark: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    light: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  confirmed: {
    dark: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  in_progress: {
    dark: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    light: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
  completed: {
    dark: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    light: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  cancelled: {
    dark: 'text-red-400 bg-red-400/10 border-red-400/30',
    light: 'text-red-600 bg-red-50 border-red-200',
  },
  no_show: {
    dark: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
    light: 'text-slate-600 bg-slate-50 border-slate-200',
  },
  reviewed: {
    dark: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    light: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  interviewed: {
    dark: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    light: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  hired: {
    dark: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  rejected: {
    dark: 'text-red-400 bg-red-400/10 border-red-400/30',
    light: 'text-red-600 bg-red-50 border-red-200',
  },
};

export const serviceNames: Record<string, string> = {
  'window-tinting': 'Window Tinting',
  'car-audio': 'Car Audio',
  'remote-start': 'Remote Start',
  'security-systems': 'Security Systems',
  lighting: 'Custom Lighting',
  accessories: 'Auto Accessories',
};

// Nav module identifiers — now map to file-based routes.
export type NavKey =
  | 'overview'
  | 'inventory'
  | 'orders'
  | 'payments'
  | 'customers'
  | 'bookings'
  | 'requests'
  | 'applications'
  | 'best-sellers'
  | 'coupons'
  | 'price-compare'
  | 'classes';

// Which AdminDataProvider badge count feeds each nav item (if any).
export type BadgeSource = 'bookings' | 'inquiries' | 'applications';

export interface NavItemConfig {
  key: NavKey;
  label: string;
  href: string;
  badgeSource?: BadgeSource;
}

// Sidebar nav config — order matters. `href` drives routing + active state.
export const navItems: NavItemConfig[] = [
  { key: 'overview', label: 'Dashboard', href: '/admin' },
  { key: 'bookings', label: 'Bookings', href: '/admin/bookings', badgeSource: 'bookings' },
  { key: 'classes', label: 'Classes', href: '/admin/classes' },
  { key: 'customers', label: 'Customers', href: '/admin/customers' },
  { key: 'inventory', label: 'Inventory', href: '/admin/inventory' },
  { key: 'orders', label: 'Orders', href: '/admin/orders' },
  { key: 'payments', label: 'Payments', href: '/admin/payments' },
  { key: 'best-sellers', label: 'Best Sellers', href: '/admin/best-sellers' },
  { key: 'coupons', label: 'Coupons', href: '/admin/coupons' },
  { key: 'requests', label: 'Requests', href: '/admin/requests', badgeSource: 'inquiries' },
  { key: 'applications', label: 'Applications', href: '/admin/applications', badgeSource: 'applications' },
  { key: 'price-compare', label: 'Price Compare', href: '/admin/price-compare' },
];
