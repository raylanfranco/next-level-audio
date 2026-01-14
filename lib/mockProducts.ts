import { ShopifyProduct } from '@/types/shopify';

// Mock products for testing/development
export const mockProducts: ShopifyProduct[] = [
  {
    id: 'gid://shopify/Product/1',
    title: 'Premium Car Audio System - 6.5" Component Speakers',
    handle: 'premium-car-audio-system-65-component-speakers',
    description: 'High-performance 6.5" component speaker system with silk dome tweeters and polypropylene woofers. Perfect for crystal-clear sound quality.',
    priceRange: {
      minVariantPrice: {
        amount: '249.99',
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      altText: 'Car audio speakers',
      width: 800,
      height: 600,
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
            altText: 'Car audio speakers',
            width: 800,
            height: 600,
          },
        },
      ],
    },
  },
  {
    id: 'gid://shopify/Product/2',
    title: 'Professional Window Tinting Film - 35% VLT',
    handle: 'professional-window-tinting-film-35-vlt',
    description: 'Premium ceramic window tinting film with 35% visible light transmission. Blocks 99% of UV rays and reduces heat by up to 60%.',
    priceRange: {
      minVariantPrice: {
        amount: '89.99',
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
      altText: 'Window tinting film',
      width: 800,
      height: 600,
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
            altText: 'Window tinting film',
            width: 800,
            height: 600,
          },
        },
      ],
    },
  },
  {
    id: 'gid://shopify/Product/3',
    title: '12" Subwoofer with Enclosure - 1200W Peak',
    handle: '12-subwoofer-with-enclosure-1200w-peak',
    description: 'Powerful 12-inch subwoofer with custom ported enclosure. Delivers deep, rich bass for an immersive audio experience.',
    priceRange: {
      minVariantPrice: {
        amount: '329.99',
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1606778303969-4a0c0c0c5c5c?w=800&h=600&fit=crop',
      altText: 'Car subwoofer',
      width: 800,
      height: 600,
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://images.unsplash.com/photo-1606778303969-4a0c0c0c5c5c?w=800&h=600&fit=crop',
            altText: 'Car subwoofer',
            width: 800,
            height: 600,
          },
        },
      ],
    },
  },
  {
    id: 'gid://shopify/Product/4',
    title: 'Car Amplifier - 4 Channel 2000W',
    handle: 'car-amplifier-4-channel-2000w',
    description: 'High-power 4-channel amplifier with MOSFET power supply. Features low-level inputs, variable crossovers, and bass boost control.',
    priceRange: {
      minVariantPrice: {
        amount: '199.99',
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      altText: 'Car amplifier',
      width: 800,
      height: 600,
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
            altText: 'Car amplifier',
            width: 800,
            height: 600,
          },
        },
      ],
    },
  },
  {
    id: 'gid://shopify/Product/5',
    title: 'Double Din Car Stereo with Apple CarPlay',
    handle: 'double-din-car-stereo-apple-carplay',
    description: '7" touchscreen double DIN car stereo with Apple CarPlay and Android Auto. Features Bluetooth, USB, and HD Radio.',
    priceRange: {
      minVariantPrice: {
        amount: '449.99',
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
      altText: 'Car stereo head unit',
      width: 800,
      height: 600,
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop',
            altText: 'Car stereo head unit',
            width: 800,
            height: 600,
          },
        },
      ],
    },
  },
  {
    id: 'gid://shopify/Product/6',
    title: 'Custom Vinyl Wrap Installation Kit',
    handle: 'custom-vinyl-wrap-installation-kit',
    description: 'Complete vinyl wrap kit including premium vinyl, application tools, squeegee, and heat gun. Perfect for DIY enthusiasts or professional installers.',
    priceRange: {
      minVariantPrice: {
        amount: '179.99',
        currencyCode: 'USD',
      },
    },
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
      altText: 'Vinyl wrap kit',
      width: 800,
      height: 600,
    },
    images: {
      edges: [
        {
          node: {
            url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop',
            altText: 'Vinyl wrap kit',
            width: 800,
            height: 600,
          },
        },
      ],
    },
  },
];

