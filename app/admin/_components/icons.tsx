import type { NavKey } from '../_lib/constants';

// Nav icons ported from variant-designs/admin-panel.js getIcon().
// Mapped to NLA's real nav keys (+ classes / best-sellers / coupons / price-compare).
export function NavIcon({ id, className }: { id: NavKey; className?: string }) {
  const props = {
    className: className ?? 'w-5 h-5',
    fill: 'none' as const,
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    strokeWidth: '1.5',
  };

  switch (id) {
    case 'overview':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M3 3h7v7H3V3z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M14 3h7v7h-7V3z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M14 14h7v7h-7v-7z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M3 14h7v7H3v-7z" />
        </svg>
      );
    case 'bookings':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M4 5h16v16H4V5z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M16 3v4" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M8 3v4" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M4 11h16" />
        </svg>
      );
    case 'classes':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4L3 9l9 5 9-5-9-5z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M6 10.7V16l6 3.5 6-3.5v-5.3" />
        </svg>
      );
    case 'customers':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
      );
    case 'inventory':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M12 22.08V12" />
        </svg>
      );
    case 'orders':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M4 4h16v16H4z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M8 9h8" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M8 13h8" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M8 17h5" />
        </svg>
      );
    case 'payments':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M3 6h18v12H3z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M3 10h18" />
        </svg>
      );
    case 'best-sellers':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M18 20V10" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M12 20V4" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M6 20v-6" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M2 20h20" />
        </svg>
      );
    case 'coupons':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" />
        </svg>
      );
    case 'requests':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M4 4h16v12H8l-4 4V4z" />
        </svg>
      );
    case 'applications':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M6 2h9l5 5v15H6z" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M14 2v6h6" />
          <path strokeLinecap="square" strokeLinejoin="miter" d="M9 13h6M9 17h6" />
        </svg>
      );
    case 'price-compare':
      return (
        <svg {...props}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    default:
      return null;
  }
}
