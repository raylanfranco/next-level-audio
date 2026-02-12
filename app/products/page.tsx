'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import type { CloverItem, CloverCategory } from '@/types/clover';
import { useCart } from '@/components/CartContext';
import InquiryModal from '@/components/InquiryModal';

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getStockStatus(item: CloverItem): Exclude<StockFilter, 'all'> {
  const count = item.stockCount ?? 0;
  if (count === 0) return 'out-of-stock';
  if (count < 5) return 'low-stock';
  return 'in-stock';
}

const stockBadges: Record<Exclude<StockFilter, 'all'>, { label: string; classes: string }> = {
  'in-stock': { label: 'In Stock', classes: 'bg-green-400/20 text-green-400 border-green-400/50' },
  'low-stock': { label: 'Low Stock', classes: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50' },
  'out-of-stock': { label: 'Out of Stock', classes: 'bg-red-400/20 text-red-400 border-red-400/50' },
};

const PAGE_SIZE = 24;

export default function ProductsPage() {
  const [items, setItems] = useState<CloverItem[]>([]);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Product images
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});

  // Cart
  const { addItem } = useCart();
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // Inquiry modal
  const [inquiryProduct, setInquiryProduct] = useState<{ id: string; name: string; price: number; imageUrl?: string } | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const fetchItems = useCallback(async (categoryId: string | null, newOffset: number, append: boolean) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(newOffset),
        expand: 'categories',
      });
      if (categoryId) {
        params.set('category', categoryId);
      }

      const res = await fetch(`/api/clover/inventory?${params}`);
      if (res.ok) {
        const data = await res.json();
        const newItems: CloverItem[] = data.items || [];

        if (append) {
          setItems(prev => [...prev, ...newItems]);
        } else {
          setItems(newItems);
        }

        setOffset(newOffset);
        setHasMore(newItems.length >= PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/clover/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems(null, 0, false);
  }, [fetchCategories, fetchItems]);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id);
    setProductImages((prev) => {
      const newIds = ids.filter((id) => !(id in prev));
      if (newIds.length === 0) return prev;
      fetch(`/api/product-image?ids=${newIds.join(',')}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.images) {
            setProductImages((p) => ({ ...p, ...data.images }));
          }
        })
        .catch(() => {});
      return prev;
    });
  }, [items]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    setStockFilter('all');
    fetchItems(categoryId, 0, false);
    setMobileSidebarOpen(false);
  };

  const handleLoadMore = () => {
    fetchItems(selectedCategory, offset + PAGE_SIZE, true);
  };

  // Client-side filtering for search and stock
  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !(item.description || '').toLowerCase().includes(q) &&
        !(item.code || '').includes(q)
      ) {
        return false;
      }
    }
    if (stockFilter !== 'all') {
      if (getStockStatus(item) !== stockFilter) return false;
    }
    return true;
  });

  // When showing "All", separate in-stock from out-of-stock
  const showSplit = stockFilter === 'all' && !searchQuery;
  const inStockItems = showSplit
    ? filteredItems.filter(item => getStockStatus(item) !== 'out-of-stock')
    : filteredItems;
  const outOfStockItems = showSplit
    ? filteredItems.filter(item => getStockStatus(item) === 'out-of-stock')
    : [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-black overflow-hidden">
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
              1,300+ items from our Clover POS inventory. Premium car audio equipment and auto accessories.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Grid */}
      <section className="bg-black relative min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">

            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#00A0E0] text-black px-4 py-3 font-mono font-semibold text-sm shadow-lg shadow-[#00A0E0]/30"
            >
              {mobileSidebarOpen ? 'Close Filters' : 'Filters'}
            </button>

            {/* Sidebar */}
            <aside className={`
              ${mobileSidebarOpen ? 'fixed inset-0 z-40 bg-black/95 overflow-y-auto p-6 pt-20' : 'hidden'}
              lg:block lg:static lg:bg-transparent lg:p-0
              w-full lg:w-72 lg:min-w-[18rem] flex-shrink-0
            `}>
              {/* Search */}
              <div className="mb-6">
                <h3 className="text-[#00A0E0] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">Search</h3>
                <input
                  type="text"
                  placeholder="Search by name or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-[#00A0E0]/30 text-white placeholder-[#00A0E0]/30 font-mono text-sm focus:outline-none focus:border-[#00A0E0] transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-[#00A0E0] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                        selectedCategory === null
                          ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                          : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                      }`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                            : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h3 className="text-[#00A0E0] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">Availability</h3>
                <div className="space-y-1">
                  {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as StockFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStockFilter(filter)}
                      className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                        stockFilter === filter
                          ? filter === 'all'
                            ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                            : filter === 'in-stock'
                            ? 'bg-green-400/10 text-green-400 border-l-2 border-green-400'
                            : filter === 'low-stock'
                            ? 'bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400'
                            : 'bg-red-400/10 text-red-400 border-l-2 border-red-400'
                          : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                      }`}
                    >
                      {filter === 'all' ? 'All' : filter === 'in-stock' ? 'In Stock' : filter === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || stockFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('all');
                    handleCategorySelect(null);
                  }}
                  className="w-full px-3 py-2 text-[#00A0E0] border border-[#00A0E0]/30 hover:border-[#00A0E0] font-mono text-sm transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[#00A0E0]/60 font-mono text-sm">
                  {loading ? 'Loading...' : `${inStockItems.length} products${outOfStockItems.length > 0 ? ` (${outOfStockItems.length} out of stock)` : ''}`}
                  {selectedCategory && categories.length > 0 && (
                    <span className="text-[#00A0E0]">
                      {' '}in {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-12 h-12 border-4 border-[#00A0E0]/30 border-t-[#00A0E0] animate-spin"></div>
                  <p className="text-[#00A0E0]/60 mt-4 font-mono">Loading inventory from Clover...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#00A0E0]/60 font-mono text-lg mb-4">No products found.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStockFilter('all');
                      handleCategorySelect(null);
                    }}
                    className="text-[#00A0E0] hover:text-[#00B8FF] font-mono underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  {/* In-stock products grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {inStockItems.map((item) => {
                      const status = getStockStatus(item);
                      const badge = stockBadges[status];
                      const categoryName = item.categories?.elements?.[0]?.name;

                      return (
                        <div
                          key={item.id}
                          className="bg-black border border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-300 group"
                        >
                          <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                            {productImages[item.id] ? (
                              <img
                                src={productImages[item.id]!}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="text-center px-4 bg-white w-full h-full flex flex-col items-center justify-center">
                                <div className="text-gray-400 text-xs font-mono mb-1">{item.code || 'NO SKU'}</div>
                                <div className="text-gray-200 text-4xl font-bold" style={{ fontFamily: 'var(--font-oxanium)' }}>
                                  {formatCents(item.price)}
                                </div>
                              </div>
                            )}

                            <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-semibold border ${badge.classes}`}>
                              {badge.label}
                            </div>

                            {categoryName && (
                              <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-mono border bg-purple-400/10 text-purple-400 border-purple-400/30">
                                {categoryName}
                              </div>
                            )}
                          </div>

                          <div className="p-5">
                            <h3 className="text-base font-bold text-white mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                              {item.onlineName || item.name}
                            </h3>
                            {item.description && (
                              <p className="text-[#00A0E0]/60 text-xs font-mono mb-4 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-[#00A0E0] font-mono">
                                {formatCents(item.price)}
                              </span>
                              {status === 'out-of-stock' ? (
                                <button
                                  onClick={() => {
                                    setInquiryProduct({
                                      id: item.id,
                                      name: item.onlineName || item.name,
                                      price: item.price,
                                      imageUrl: productImages[item.id] || undefined,
                                    });
                                    setInquiryOpen(true);
                                  }}
                                  className="px-4 py-2 border font-semibold font-mono text-xs transition-colors bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B] hover:bg-[#F59E0B]/30 cursor-pointer"
                                >
                                  REQUEST ITEM
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    addItem({
                                      id: item.id,
                                      name: item.onlineName || item.name,
                                      price: item.price,
                                      imageUrl: productImages[item.id] || undefined,
                                    });
                                    setAddedItemId(item.id);
                                    setTimeout(() => setAddedItemId(null), 1500);
                                  }}
                                  className={`px-4 py-2 border font-semibold font-mono text-xs transition-colors cursor-pointer ${
                                    addedItemId === item.id
                                      ? 'bg-green-400/20 text-green-400 border-green-400'
                                      : 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0] hover:bg-[#00A0E0]/30'
                                  }`}
                                >
                                  {addedItemId === item.id ? 'ADDED!' : 'ADD TO CART'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  {hasMore && !searchQuery && stockFilter === 'all' && (
                    <div className="text-center mt-10">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-8 py-3 border border-[#00A0E0]/30 text-[#00A0E0] font-mono hover:border-[#00A0E0] transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? 'Loading...' : 'Load More Products'}
                      </button>
                    </div>
                  )}

                  {/* Out of Stock section */}
                  {outOfStockItems.length > 0 && (
                    <div className="mt-16">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-red-400/20"></div>
                        <h2 className="text-lg font-bold text-red-400/80 uppercase tracking-wider font-mono">
                          Out of Stock ({outOfStockItems.length})
                        </h2>
                        <div className="h-px flex-1 bg-red-400/20"></div>
                      </div>
                      <p className="text-center text-red-400/50 text-xs font-mono mb-6">
                        These items are currently unavailable. Request an item and we&apos;ll notify you when it&apos;s back.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 opacity-70">
                        {outOfStockItems.map((item) => {
                          const badge = stockBadges['out-of-stock'];
                          const categoryName = item.categories?.elements?.[0]?.name;

                          return (
                            <div
                              key={item.id}
                              className="bg-black border border-red-400/20 overflow-hidden hover:border-red-400/40 transition-all duration-300 group"
                            >
                              <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                                {productImages[item.id] ? (
                                  <img
                                    src={productImages[item.id]!}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 grayscale"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="text-center px-4 bg-white w-full h-full flex flex-col items-center justify-center">
                                    <div className="text-gray-400 text-xs font-mono mb-1">{item.code || 'NO SKU'}</div>
                                    <div className="text-gray-200 text-4xl font-bold" style={{ fontFamily: 'var(--font-oxanium)' }}>
                                      {formatCents(item.price)}
                                    </div>
                                  </div>
                                )}

                                <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-semibold border ${badge.classes}`}>
                                  {badge.label}
                                </div>

                                {categoryName && (
                                  <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-mono border bg-purple-400/10 text-purple-400 border-purple-400/30">
                                    {categoryName}
                                  </div>
                                )}
                              </div>

                              <div className="p-5">
                                <h3 className="text-base font-bold text-white/70 mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                                  {item.onlineName || item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-[#00A0E0]/40 text-xs font-mono mb-4 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-[#00A0E0]/50 font-mono">
                                    {formatCents(item.price)}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setInquiryProduct({
                                        id: item.id,
                                        name: item.onlineName || item.name,
                                        price: item.price,
                                        imageUrl: productImages[item.id] || undefined,
                                      });
                                      setInquiryOpen(true);
                                    }}
                                    className="px-4 py-2 border font-semibold font-mono text-xs transition-colors bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B] hover:bg-[#F59E0B]/30 cursor-pointer"
                                  >
                                    REQUEST ITEM
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal
        product={inquiryProduct}
        isOpen={inquiryOpen}
        onClose={() => { setInquiryOpen(false); setInquiryProduct(null); }}
      />

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
