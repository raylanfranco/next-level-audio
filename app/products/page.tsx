'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShopifyProduct } from '@/types/shopify';
import { mockProducts } from '@/lib/mockProducts';

const categories = [
  { id: 'all', name: 'ALL PRODUCTS' },
  { id: 'audio', name: 'CAR AUDIO' },
  { id: 'tinting', name: 'WINDOW TINTING' },
  { id: 'accessories', name: 'ACCESSORIES' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/shopify/products?first=20');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const productNodes = data?.products?.edges?.map((edge: { node: ShopifyProduct }) => edge.node) || [];
        
        if (productNodes.length > 0) {
          setProducts(productNodes);
          setUsingMockData(false);
        } else {
          setProducts(mockProducts);
          setUsingMockData(true);
        }
      } catch (err) {
        console.log('Using mock products for demo:', err);
        setProducts(mockProducts);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
              SHOP OUR COLLECTION
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              PRODUCTS
            </h1>
            <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              Premium car audio equipment, window tinting supplies, and auto accessories for your vehicle.
            </p>
            {usingMockData && (
              <p className="text-sm text-[#00A0E0]/60 mt-4 italic font-mono">
                DEMO MODE - Connect Shopify to show real inventory
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Search Section */}
      <section className="py-8 bg-black border-t-2 border-b-2 border-[#00A0E0]/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 border-2 font-semibold text-sm transition-all duration-300 cyber-button ${
                    activeCategory === category.id
                      ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0] neon-border-soft'
                      : 'bg-transparent text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60 hover:text-[#00A0E0]'
                  }`}
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 px-6 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono text-sm focus:outline-none focus:border-[#00A0E0] transition-colors"
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#00A0E0]/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#00A0E0]/30 border-t-[#00A0E0] animate-spin"></div>
              <p className="text-[#00A0E0]/60 mt-4 font-mono">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#00A0E0]/60 font-mono text-lg">No products found matching your search.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[#00A0E0] hover:text-[#00B8FF] font-mono underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => {
                const price = parseFloat(product.priceRange.minVariantPrice.amount);
                const formattedPrice = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: product.priceRange.minVariantPrice.currencyCode,
                }).format(price);

                return (
                  <div
                    key={product.id}
                    className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group neon-border-soft"
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
                      <h3 className="text-lg font-bold text-[#00A0E0] mb-2 line-clamp-2 neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                        {product.title.toUpperCase()}
                      </h3>
                      {product.description && (
                        <p className="text-[#00A0E0]/70 text-sm mb-4 line-clamp-2 font-mono">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-[#00A0E0] font-mono neon-glow-soft">
                          {formattedPrice}
                        </span>
                        <Link
                          href={`/products/${product.handle}`}
                          className="px-4 py-2 bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] font-semibold font-mono text-sm hover:bg-[#00A0E0]/30 transition-colors neon-border-soft cyber-button"
                        >
                          VIEW
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            NEED INSTALLATION?
          </h2>
          <p className="text-xl md:text-2xl text-[#00A0E0] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            Our expert technicians can install any product you purchase. Book an appointment today!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/book-appointment"
              className="inline-block bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-10 py-5 font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BOOK INSTALLATION
            </Link>
            <Link
              href="/services"
              className="inline-block border-2 border-[#00A0E0]/50 bg-black/40 backdrop-blur-sm text-[#00A0E0] px-10 py-5 font-semibold text-lg hover:border-[#00A0E0] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 neon-border-soft cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              VIEW SERVICES
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
