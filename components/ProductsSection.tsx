'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShopifyProduct } from '@/types/shopify';
import { mockProducts } from '@/lib/mockProducts';

export default function ProductsSection() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/shopify/products?first=6');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const productNodes = data?.products?.edges?.map((edge: any) => edge.node) || [];
        
        // If we got products from Shopify, use them
        if (productNodes.length > 0) {
          setProducts(productNodes);
          setUsingMockData(false);
        } else {
          // Otherwise use mock data
          setProducts(mockProducts);
          setUsingMockData(true);
        }
      } catch (err) {
        // On error, use mock data for demo purposes
        console.log('Using mock products for demo:', err);
        setProducts(mockProducts);
        setUsingMockData(true);
        setError(null); // Don't show error, just use mock data
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Featured Products
            </h2>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Featured Products
            </h2>
            <p className="text-gray-600">
              No products available at the moment. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          {usingMockData && (
            <p className="text-sm text-[#00A0E0]/60 mt-2 italic font-mono">
              DEMO MODE - Connect Shopify to show real inventory
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => {
            const price = parseFloat(product.priceRange.minVariantPrice.amount);
            const formattedPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.priceRange.minVariantPrice.currencyCode,
            }).format(price);

            return (
              <div
                key={product.id}
                className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft"
                style={{ borderRadius: 0 }}
              >
                {/* Product Image */}
                <div className="relative h-64 bg-gradient-to-br from-[#00A0E0]/20 to-black overflow-hidden">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-[#00A0E0]/20 text-2xl font-mono">NO IMAGE</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                  <div className="absolute inset-0 border-b-2 border-[#00A0E0]/50"></div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#00A0E0] mb-2 line-clamp-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {product.title.toUpperCase()}
                  </h3>
                  {product.description && (
                    <p className="text-[#00A0E0]/70 text-sm mb-4 line-clamp-2 font-mono">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#00A0E0] font-mono neon-glow-soft">
                      {formattedPrice}
                    </span>
                    <Link
                      href={`/products/${product.handle}`}
                      className="px-6 py-2 bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] font-semibold font-mono text-sm hover:bg-[#00A0E0]/30 transition-colors neon-border-soft cyber-button"
                      style={{ borderRadius: 0 }}
                    >
                      VIEW
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] font-semibold text-lg font-mono hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
            style={{ borderRadius: 0, fontFamily: 'var(--font-oxanium)' }}
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>
    </section>
  );
}

