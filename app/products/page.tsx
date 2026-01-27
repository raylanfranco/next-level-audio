'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Product, ProductAvailability, PRODUCT_BADGES, CAR_AUDIO_BRANDS, PRODUCT_CATEGORIES, getProductCTA } from '@/types/product';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [selectedAvailability, setSelectedAvailability] = useState<ProductAvailability[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Availability filter
    if (selectedAvailability.length > 0) {
      if (!selectedAvailability.includes(product.availability)) return false;
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      if (!product.brand || !selectedBrands.includes(product.brand)) return false;
    }

    // Category filter
    if (selectedCategories.length > 0) {
      if (!product.category || !selectedCategories.includes(product.category)) return false;
    }

    return true;
  });

  // Get unique brands and categories from products
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();
  const availableCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  const toggleFilter = (value: string, selected: string[], setter: (val: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(v => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const handleProductClick = (product: Product) => {
    if (product.source === 'affiliate' && product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

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
              Premium car audio equipment and auto accessories. In-stock items available for local pickup.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search Section */}
      <section className="py-8 bg-black border-t-2 border-b-2 border-[#00A0E0]/30">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search products by name, brand, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] placeholder-[#00A0E0]/40 font-mono text-sm focus:outline-none focus:border-[#00A0E0] transition-colors"
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

          {/* Filter Chips */}
          <div className="flex flex-col gap-4">
            {/* Availability Filter */}
            <div>
              <h3 className="text-[#00A0E0] text-xs uppercase font-semibold mb-2 font-mono">Availability:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleFilter('in-stock', selectedAvailability, setSelectedAvailability)}
                  className={`px-4 py-2 text-xs font-mono border transition-colors ${
                    selectedAvailability.includes('in-stock')
                      ? 'bg-green-400/20 text-green-400 border-green-400/50'
                      : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                  }`}
                >
                  🟢 In Stock
                </button>
                <button
                  onClick={() => toggleFilter('special-order', selectedAvailability, setSelectedAvailability)}
                  className={`px-4 py-2 text-xs font-mono border transition-colors ${
                    selectedAvailability.includes('special-order')
                      ? 'bg-blue-400/20 text-blue-400 border-blue-400/50'
                      : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                  }`}
                >
                  🔵 Special Order
                </button>
                <button
                  onClick={() => toggleFilter('low-stock', selectedAvailability, setSelectedAvailability)}
                  className={`px-4 py-2 text-xs font-mono border transition-colors ${
                    selectedAvailability.includes('low-stock')
                      ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50'
                      : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                  }`}
                >
                  🟡 Low Stock
                </button>
              </div>
            </div>

            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div>
                <h3 className="text-[#00A0E0] text-xs uppercase font-semibold mb-2 font-mono">Brands:</h3>
                <div className="flex flex-wrap gap-2">
                  {availableBrands.slice(0, 8).map((brand) => (
                    <button
                      key={brand}
                      onClick={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
                      className={`px-4 py-2 text-xs font-mono border transition-colors ${
                        selectedBrands.includes(brand)
                          ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0]'
                          : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div>
                <h3 className="text-[#00A0E0] text-xs uppercase font-semibold mb-2 font-mono">Categories:</h3>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
                      className={`px-4 py-2 text-xs font-mono border transition-colors ${
                        selectedCategories.includes(category)
                          ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0]'
                          : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(selectedAvailability.length > 0 || selectedBrands.length > 0 || selectedCategories.length > 0) && (
              <button
                onClick={() => {
                  setSelectedAvailability([]);
                  setSelectedBrands([]);
                  setSelectedCategories([]);
                }}
                className="text-[#00A0E0] hover:text-[#00B8FF] font-mono text-sm underline self-start"
              >
                Clear all filters
              </button>
            )}
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
              <p className="text-[#00A0E0]/60 font-mono text-lg mb-4">No products found matching your criteria.</p>
              {products.length === 0 ? (
                <p className="text-[#00A0E0]/40 font-mono text-sm">
                  Connect your database to see products. Run the schema.sql to populate sample data.
                </p>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAvailability([]);
                    setSelectedBrands([]);
                    setSelectedCategories([]);
                  }}
                  className="text-[#00A0E0] hover:text-[#00B8FF] font-mono underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-[#00A0E0]/60 font-mono text-sm">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => {
                  const badge = PRODUCT_BADGES[product.availability];
                  const ctaText = getProductCTA(product);
                  const isAffiliate = product.source === 'affiliate';
                  const isOutOfStock = product.availability === 'out-of-stock';

                  return (
                    <div
                      key={product.id}
                      className="bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 transform hover:-translate-y-2 group"
                    >
                      {/* Product Image */}
                      <div className="relative h-64 bg-gradient-to-br from-[#00A0E0]/20 to-black overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].altText || product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-[#00A0E0]/20 text-2xl font-mono">NO IMAGE</div>
                          </div>
                        )}

                        {/* Availability Badge */}
                        <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-mono font-semibold border backdrop-blur-sm ${
                          badge.color === 'green' ? 'bg-green-400/20 text-green-400 border-green-400/50' :
                          badge.color === 'blue' ? 'bg-blue-400/20 text-blue-400 border-blue-400/50' :
                          badge.color === 'yellow' ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50' :
                          'bg-red-400/20 text-red-400 border-red-400/50'
                        }`}>
                          {badge.icon} {badge.label}
                        </div>

                        {/* Affiliate Brand Badge */}
                        {isAffiliate && product.affiliateBrand && (
                          <div className="absolute top-4 right-4 px-3 py-1 text-xs font-mono font-semibold bg-[#00A0E0]/20 text-[#00A0E0] border border-[#00A0E0]/50 backdrop-blur-sm">
                            {product.affiliateBrand}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors"></div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        {product.brand && (
                          <p className="text-[#00A0E0]/60 text-xs font-mono mb-1">{product.brand}</p>
                        )}
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-[#00A0E0]/70 text-sm mb-4 line-clamp-2 font-mono">
                            {product.description}
                          </p>
                        )}

                        {/* Estimated Delivery for Affiliate */}
                        {isAffiliate && product.estimatedDelivery && (
                          <p className="text-[#00A0E0]/50 text-xs font-mono mb-3">
                            Est. delivery: {product.estimatedDelivery}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#00A0E0] font-mono">
                            ${product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleProductClick(product)}
                            disabled={isOutOfStock}
                            className={`px-4 py-2 border-2 font-semibold font-mono text-sm transition-colors ${
                              isOutOfStock
                                ? 'bg-red-400/10 text-red-400/50 border-red-400/30 cursor-not-allowed'
                                : isAffiliate
                                ? 'bg-blue-400/10 text-blue-400 border-blue-400/50 hover:bg-blue-400/20'
                                : 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0] hover:bg-[#00A0E0]/30'
                            }`}
                          >
                            {ctaText}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
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
              href="/services"
              className="inline-block bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] px-10 py-5 font-semibold text-lg hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BOOK INSTALLATION
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-[#00A0E0]/50 bg-black/40 backdrop-blur-sm text-[#00A0E0] px-10 py-5 font-semibold text-lg hover:border-[#00A0E0] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 cyber-button"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              CONTACT US
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
