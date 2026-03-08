'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { CloverItem, CloverCategory } from '@/types/clover';
import { useCart } from '@/components/CartContext';
import InquiryModal from '@/components/InquiryModal';

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
type SortOption = 'default' | 'best-sellers' | 'price-low' | 'price-high';

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
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [bestSellerIds, setBestSellerIds] = useState<Set<string>>(new Set());
  const [bestSellerRank, setBestSellerRank] = useState<Map<string, number>>(new Map());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const t = useTranslations('productsPage');
  const tc = useTranslations('common');

  const stockLabelMap: Record<string, string> = {
    'in-stock': t('inStock'),
    'low-stock': t('lowStock'),
    'out-of-stock': t('outOfStock'),
  };

  // Fetch best seller data on mount
  useEffect(() => {
    fetch('/api/best-sellers?limit=50')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.items?.length > 0) {
          const ids = new Set<string>(data.items.map((bs: { clover_item_id: string }) => bs.clover_item_id));
          const ranks = new Map<string, number>();
          data.items.forEach((bs: { clover_item_id: string }, idx: number) => ranks.set(bs.clover_item_id, idx));
          setBestSellerIds(ids);
          setBestSellerRank(ranks);
        }
      })
      .catch(() => {});
  }, []);

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
        expand: 'categories,itemStock',
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

  // Sort helper based on selected sort option
  const sortItems = (a: CloverItem, b: CloverItem) => {
    if (sortOption === 'best-sellers') {
      const aRank = bestSellerRank.get(a.id) ?? 9999;
      const bRank = bestSellerRank.get(b.id) ?? 9999;
      if (aRank !== bRank) return aRank - bRank;
    } else if (sortOption === 'price-low') {
      return a.price - b.price;
    } else if (sortOption === 'price-high') {
      return b.price - a.price;
    }
    // Default: items with images first
    const aHas = productImages[a.id] ? 0 : 1;
    const bHas = productImages[b.id] ? 0 : 1;
    return aHas - bHas;
  };

  const inStockItems = (showSplit
    ? filteredItems.filter(item => getStockStatus(item) !== 'out-of-stock')
    : filteredItems
  ).sort(sortItems);
  const outOfStockItems = showSplit
    ? filteredItems.filter(item => getStockStatus(item) === 'out-of-stock').sort(sortItems)
    : [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#E01020] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft font-oxanium">
              {t('shopOurCollection')}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow font-oxanium">
              {t('title')}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Pickup Notice */}
      <section className="bg-black relative">
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-[#E01020]/5 border-2 border-[#E01020]/30 p-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#E01020] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-white/80 font-mono text-sm">
                <span className="font-bold text-[#E01020]">{t('inStorePickup')}</span> — {t('pickupNotice')}
              </p>
            </div>
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
              className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#E01020] text-black px-4 py-3 font-mono font-semibold text-sm shadow-lg shadow-[#E01020]/30"
            >
              {mobileSidebarOpen ? t('closeFilters') : t('filters')}
            </button>

            {/* Sidebar */}
            <aside className={`
              ${mobileSidebarOpen ? 'fixed inset-0 z-40 bg-black/95 overflow-y-auto p-6 pt-20' : 'hidden'}
              lg:block lg:static lg:bg-transparent lg:p-0
              w-full lg:w-72 lg:min-w-[18rem] flex-shrink-0
            `}>
              {/* Search */}
              <div className="mb-6">
                <h3 className="text-[#E01020] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">{t('search')}</h3>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-[#E01020]/30 text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:border-[#E01020] transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-[#E01020] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">{t('categories')}</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                        selectedCategory === null
                          ? 'bg-[#E01020]/10 text-[#E01020] border-l-2 border-[#E01020]'
                          : 'text-white/60 hover:text-[#E01020] hover:bg-[#E01020]/5'
                      }`}
                    >
                      {t('allProducts')}
                    </button>
                  </li>
                  {categories.filter((cat) => !cat.name.toLowerCase().includes('tint')).map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-[#E01020]/10 text-[#E01020] border-l-2 border-[#E01020]'
                            : 'text-white/60 hover:text-[#E01020] hover:bg-[#E01020]/5'
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
                <h3 className="text-[#E01020] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">{t('availability')}</h3>
                <div className="space-y-1">
                  {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as StockFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStockFilter(filter)}
                      className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                        stockFilter === filter
                          ? filter === 'all'
                            ? 'bg-[#E01020]/10 text-[#E01020] border-l-2 border-[#E01020]'
                            : filter === 'in-stock'
                            ? 'bg-green-400/10 text-green-400 border-l-2 border-green-400'
                            : filter === 'low-stock'
                            ? 'bg-yellow-400/10 text-yellow-400 border-l-2 border-yellow-400'
                            : 'bg-red-400/10 text-red-400 border-l-2 border-red-400'
                          : 'text-white/60 hover:text-[#E01020] hover:bg-[#E01020]/5'
                      }`}
                    >
                      {filter === 'all' ? t('all') : filter === 'in-stock' ? t('inStock') : filter === 'low-stock' ? t('lowStock') : t('outOfStock')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h3 className="text-[#E01020] text-xs uppercase font-semibold mb-3 font-mono tracking-wider">{t('sortBy')}</h3>
                <div className="space-y-1">
                  {([
                    { key: 'default' as SortOption, label: t('default') },
                    { key: 'best-sellers' as SortOption, label: t('bestSellers') },
                    { key: 'price-low' as SortOption, label: t('priceLowHigh') },
                    { key: 'price-high' as SortOption, label: t('priceHighLow') },
                  ]).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setSortOption(key)}
                      className={`w-full text-left px-3 py-2 font-mono text-sm transition-colors ${
                        sortOption === key
                          ? key === 'best-sellers'
                            ? 'bg-[#FFD700]/10 text-[#FFD700] border-l-2 border-[#FFD700]'
                            : 'bg-[#E01020]/10 text-[#E01020] border-l-2 border-[#E01020]'
                          : 'text-white/60 hover:text-[#E01020] hover:bg-[#E01020]/5'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || stockFilter !== 'all' || searchQuery || sortOption !== 'default') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('all');
                    setSortOption('default');
                    handleCategorySelect(null);
                  }}
                  className="w-full px-3 py-2 text-[#E01020] border border-[#E01020]/30 hover:border-[#E01020] font-mono text-sm transition-colors"
                >
                  {t('clearAllFilters')}
                </button>
              )}
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-white/60 font-mono text-sm">
                  {loading ? tc('loading') : `${inStockItems.length} ${t('products')}${outOfStockItems.length > 0 ? ` (${outOfStockItems.length} ${t('outOfStockCount')})` : ''}`}
                  {selectedCategory && categories.length > 0 && (
                    <span className="text-[#E01020]">
                      {' '}{t('in')} {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-12 h-12 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin"></div>
                  <p className="text-white/60 mt-4 font-mono">{t('loadingInventory')}</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-white/60 font-mono text-lg mb-4">{t('noProducts')}</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStockFilter('all');
                      handleCategorySelect(null);
                    }}
                    className="text-[#E01020] hover:text-[#FF2A3A] font-mono underline"
                  >
                    {t('clearFilters')}
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
                          className="bg-black border border-[#E01020]/30 overflow-hidden hover:border-[#E01020] transition-all duration-300 group"
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
                                <div className="text-gray-200 text-4xl font-bold font-oxanium">
                                  {formatCents(item.price)}
                                </div>
                              </div>
                            )}

                            <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-semibold border ${badge.classes}`}>
                              {stockLabelMap[status]}
                            </div>

                            {categoryName && (
                              <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-mono border bg-purple-400/10 text-purple-400 border-purple-400/30">
                                {categoryName}
                              </div>
                            )}

                            {bestSellerIds.has(item.id) && (
                              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#FFD700]/90 text-black text-[10px] font-bold font-mono uppercase tracking-wider">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                {t('bestSeller')}
                              </div>
                            )}
                          </div>

                          <div className="p-5">
                            <h3 className="text-base font-bold text-white mb-1 line-clamp-2 font-oxanium">
                              {item.onlineName || item.name}
                            </h3>
                            {item.description && (
                              <p className="text-white/60 text-xs font-mono mb-4 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-[#E01020] font-mono">
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
                                  {t('requestItem')}
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
                                      : 'bg-[#E01020]/20 text-[#E01020] border-[#E01020] hover:bg-[#E01020]/30'
                                  }`}
                                >
                                  {addedItemId === item.id ? t('added') : t('addToCart')}
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
                        className="px-8 py-3 border border-[#E01020]/30 text-[#E01020] font-mono hover:border-[#E01020] transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? tc('loading') : t('loadMore')}
                      </button>
                    </div>
                  )}

                  {/* Out of Stock section */}
                  {outOfStockItems.length > 0 && (
                    <div className="mt-16">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-px flex-1 bg-red-400/20"></div>
                        <h2 className="text-lg font-bold text-red-400/80 uppercase tracking-wider font-mono">
                          {t('outOfStockSection')} ({outOfStockItems.length})
                        </h2>
                        <div className="h-px flex-1 bg-red-400/20"></div>
                      </div>
                      <p className="text-center text-red-400/50 text-xs font-mono mb-6">
                        {t('outOfStockNotice')}
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
                                    <div className="text-gray-200 text-4xl font-bold font-oxanium">
                                      {formatCents(item.price)}
                                    </div>
                                  </div>
                                )}

                                <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-mono font-semibold border ${badge.classes}`}>
                                  {stockLabelMap['out-of-stock']}
                                </div>

                                {categoryName && (
                                  <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-mono border bg-purple-400/10 text-purple-400 border-purple-400/30">
                                    {categoryName}
                                  </div>
                                )}
                              </div>

                              <div className="p-5">
                                <h3 className="text-base font-bold text-white/70 mb-1 line-clamp-2 font-oxanium">
                                  {item.onlineName || item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-white/40 text-xs font-mono mb-4 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-white/50 font-mono">
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
                                    {t('requestItem')}
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
      <section className="py-20 md:py-32 bg-black text-white relative overflow-hidden border-t-2 border-[#E01020]/30">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 neon-glow font-oxanium">
            {t('needInstallation')}
          </h2>
          <p className="text-xl md:text-2xl text-[#E01020] mb-12 max-w-3xl mx-auto leading-relaxed font-mono">
            {t('needInstallationDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/services"
              className="inline-block bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] px-10 py-5 font-semibold text-lg hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 cyber-button font-oxanium"
            >
              {t('bookInstallation')}
            </Link>
            <Link
              href="/contact"
              className="inline-block border-2 border-[#E01020]/50 bg-black/40 backdrop-blur-sm text-[#E01020] px-10 py-5 font-semibold text-lg hover:border-[#E01020] hover:bg-black/60 transition-all duration-300 transform hover:scale-105 cyber-button font-oxanium"
            >
              {tc('contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
