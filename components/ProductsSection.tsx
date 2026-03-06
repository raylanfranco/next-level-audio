'use client';

import { Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { CloverItem, CloverCategory } from '@/types/clover';
import { useCart } from '@/components/CartContext';
import AnimateOnScroll from '@/components/AnimateOnScroll';

// Tab keys mapped to Clover category match strings
const TAB_MATCHES: Record<string, string | null> = {
  all: null,
  audio: 'audio',
  subwoofers: 'sub',
  speakers: 'speaker',
  lighting: 'light',
  remote: 'remote',
  security: 'secur',
  accessories: 'accessor',
};

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductsSection() {
  const [items, setItems] = useState<CloverItem[]>([]);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [productImages, setProductImages] = useState<Record<string, string | null>>({});
  const [animKey, setAnimKey] = useState(0);
  const [bestSellerIds, setBestSellerIds] = useState<Set<string>>(new Set());
  const t = useTranslations('products');
  const tc = useTranslations('common');

  const { addItem } = useCart();
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Build curated tabs with translated labels
  const CURATED_TABS = [
    { key: 'all', label: t('all'), match: TAB_MATCHES.all },
    { key: 'audio', label: t('soundSystems'), match: TAB_MATCHES.audio },
    { key: 'subwoofers', label: t('subwoofers'), match: TAB_MATCHES.subwoofers },
    { key: 'speakers', label: t('speakers'), match: TAB_MATCHES.speakers },
    { key: 'lighting', label: t('lighting'), match: TAB_MATCHES.lighting },
    { key: 'remote', label: t('remoteStart'), match: TAB_MATCHES.remote },
    { key: 'security', label: t('security'), match: TAB_MATCHES.security },
    { key: 'accessories', label: t('accessories'), match: TAB_MATCHES.accessories },
  ];

  // Fetch best seller IDs on mount
  useEffect(() => {
    fetch('/api/best-sellers?limit=20')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.items?.length > 0) {
          setBestSellerIds(new Set(data.items.map((bs: { clover_item_id: string }) => bs.clover_item_id)));
        }
      })
      .catch(() => {});
  }, []);

  // Resolve a curated tab key to a Clover category ID
  const resolveCategoryId = useCallback((tabKey: string): string | null => {
    if (tabKey === 'all') return null;
    const matchStr = TAB_MATCHES[tabKey];
    if (!matchStr) return null;
    const cat = categories.find(c =>
      c.name.toLowerCase().includes(matchStr)
    );
    return cat?.id ?? null;
  }, [categories]);

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/clover/categories')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch items when tab changes
  const fetchItems = useCallback(async (tabKey: string) => {
    setLoading(true);
    try {
      const categoryId = resolveCategoryId(tabKey);
      const fetchLimit = categoryId ? '12' : '100';
      const params = new URLSearchParams({ limit: fetchLimit, offset: '0', expand: 'categories' });
      if (categoryId) params.set('category', categoryId);

      const res = await fetch(`/api/clover/inventory?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [resolveCategoryId]);

  // Load items on mount and when categories resolve
  useEffect(() => {
    if (categories.length > 0 || activeTab === 'all') {
      fetchItems(activeTab);
    }
  }, [activeTab, categories, fetchItems]);

  // Batch fetch images for loaded items
  useEffect(() => {
    if (items.length === 0) return;
    const newIds = items.map(i => i.id).filter(id => !(id in productImages));
    if (newIds.length === 0) return;

    fetch(`/api/product-image?ids=${newIds.join(',')}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.images) {
          setProductImages(prev => ({ ...prev, ...data.images }));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleTabClick = (tabKey: string) => {
    if (tabKey === activeTab) return;
    setActiveTab(tabKey);
    setAnimKey(prev => prev + 1);
  };

  const handleAddToCart = (item: CloverItem) => {
    addItem({
      id: item.id,
      name: item.onlineName || item.name,
      price: item.price,
      imageUrl: productImages[item.id] || undefined,
    });
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1500);
  };

  // Only show tabs that have matching Clover categories (ALL is always visible)
  const visibleTabs = CURATED_TABS.filter(tab => {
    if (tab.key === 'all') return true;
    if (categories.length === 0) return true; // show all while loading
    return categories.some(c => c.name.toLowerCase().includes(tab.match!));
  });

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">

        {/* Heading */}
        <AnimateOnScroll animation="fade-up">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow hover-glitch"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {activeTab === 'all' && bestSellerIds.size > 0 ? t('bestSellers') : t('shopByCategory')}
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-lg font-mono">
              {activeTab === 'all' && bestSellerIds.size > 0
                ? t('bestSellersDesc')
                : t('shopByCategoryDesc')}
            </p>
            <p className="text-white/50 max-w-xl mx-auto text-sm font-mono mt-2">
              {t('inStorePickup')}
            </p>
          </div>
        </AnimateOnScroll>

        {/* Tab Bar */}
        <AnimateOnScroll animation="fade-up" delay={0.1}>
          <div
            ref={tabsRef}
            className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {visibleTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex-shrink-0 px-5 py-2.5 border-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[#E01020]/20 text-[#E01020] border-[#E01020] neon-border-soft'
                    : 'bg-transparent text-white/50 border-[#E01020]/20 hover:border-[#E01020]/50 hover:text-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </AnimateOnScroll>

        {/* Product Grid */}
        <div key={animKey} className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-black border-2 border-[#E01020]/10 animate-pulse">
                  <div className="aspect-square bg-[#E01020]/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-[#E01020]/10 w-3/4" />
                    <div className="h-4 bg-[#E01020]/5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/40 font-mono text-lg">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...items].sort((a, b) => {
                const aHas = productImages[a.id] ? 0 : 1;
                const bHas = productImages[b.id] ? 0 : 1;
                return aHas - bHas;
              }).slice(0, 12).map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-up bg-black border-2 border-[#E01020]/30 overflow-hidden hover:border-[#E01020] transition-all duration-500 transform hover:-translate-y-2 group neon-border-soft"
                  style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
                >
                  <div className="relative aspect-square bg-[#0a0a0a] overflow-hidden">
                    {productImages[item.id] ? (
                      <img
                        src={(productImages[item.id] as string).replace('http://', 'https://')}
                        alt={item.onlineName || item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-[#E01020]/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                    {/* Best seller badge */}
                    {bestSellerIds.has(item.id) && (
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#FFD700]/90 text-black text-[10px] font-bold font-mono uppercase tracking-wider">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {t('bestSeller')}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3
                      className="text-lg font-bold text-[#E01020] mb-2 line-clamp-2 neon-glow-soft"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {(item.onlineName || item.name).toUpperCase()}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#E01020] font-mono neon-glow-soft">
                        {formatCents(item.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`px-4 py-2 border-2 font-semibold font-mono text-xs transition-all duration-300 cursor-pointer ${
                          addedItemId === item.id
                            ? 'bg-green-400/20 text-green-400 border-green-400'
                            : 'bg-[#E01020]/20 text-[#E01020] border-[#E01020] hover:bg-[#E01020]/30 neon-border-soft cyber-button'
                        }`}
                      >
                        {addedItemId === item.id ? t('added') : t('addToCart')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All link */}
        {!loading && items.length > 0 && (
          <AnimateOnScroll animation="fade-up" delay={0.2}>
            <div className="text-center">
              <Link
                href="/products"
                className="inline-block px-8 py-4 bg-[#E01020]/20 text-[#E01020] border-2 border-[#E01020] font-semibold text-lg font-mono hover:bg-[#E01020]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {tc('viewAll')}
              </Link>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}
