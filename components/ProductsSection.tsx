'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FeaturedProduct {
  id: string;
  name: string;
  onlineName?: string;
  price: number;
  imageUrl: string;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductsSection() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/featured-products?count=6')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.items?.length) {
          setProducts(data.items);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              FEATURED PRODUCTS
            </h2>
            <p className="text-[#00A0E0]/60 font-mono">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            FEATURED PRODUCTS
          </h2>
          <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
            Discover our premium selection of car audio equipment and auto accessories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft"
            >
              <div className="relative aspect-square bg-white overflow-hidden">
                <img
                  src={product.imageUrl.replace('http://', 'https://')}
                  alt={product.onlineName || product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-[#00A0E0] mb-2 line-clamp-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  {(product.onlineName || product.name).toUpperCase()}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#00A0E0] font-mono neon-glow-soft">
                    {formatCents(product.price)}
                  </span>
                  <Link
                    href="/products"
                    className="px-6 py-2 bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] font-semibold font-mono text-sm hover:bg-[#00A0E0]/30 transition-colors neon-border-soft cyber-button"
                  >
                    VIEW
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] font-semibold text-lg font-mono hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>
    </section>
  );
}
