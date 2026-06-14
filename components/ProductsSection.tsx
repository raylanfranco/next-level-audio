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

  // Fetch best sellers + categories in parallel on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/best-sellers?limit=20').then(res => res.ok ? res.json() : null).catch(() => null),
      fetch('/api/clover/categories').then(res => res.ok ? res.json() : null).catch(() => null),
    ]).then(([bestData, catData]) => {
      if (bestData?.items?.length > 0) {
        setBestSellerIds(new Set(bestData.items.map((bs: { clover_item_id: string }) => bs.clover_item_id)));
      }
      if (catData?.categories) setCategories(catData.categories);
    });
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
      <div className="absolute inset-0 bg-noise z-0"></div>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">

        {/* Heading — Variant eyebrow + chrome headline */}
        <AnimateOnScroll animation="fade-up">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-[2px] bg-electric-red shadow-[0_0_10px_#e60012]"></div>
              <span className="font-ui text-chrome-300 font-bold tracking-[0.4em] uppercase text-xs">
                {t('premiumInventory')}
              </span>
            </div>
            <h2
              className="font-display text-chrome uppercase leading-none text-[clamp(2.5rem,6vw,5rem)]"
              data-text={activeTab === 'all' && bestSellerIds.size > 0 ? t('bestSellers') : t('shopByCategory')}
            >
              {activeTab === 'all' && bestSellerIds.size > 0 ? t('bestSellers') : t('shopByCategory')}
            </h2>
            <p className="text-chrome-500 font-ui max-w-2xl text-lg mt-4">
              {activeTab === 'all' && bestSellerIds.size > 0
                ? t('bestSellersDesc')
                : t('shopByCategoryDesc')}
            </p>
            <p className="text-chrome-700 font-ui max-w-xl text-sm mt-2">
              {t('inStorePickup')}
            </p>
          </div>
        </AnimateOnScroll>

        {/* Tab Bar — Variant underline style */}
        <AnimateOnScroll animation="fade-up" delay={0.1}>
          <div
            ref={tabsRef}
            className="flex gap-8 mb-10 overflow-x-auto pb-2 scrollbar-hide flex-nowrap items-center border-y border-white/5 py-5"
            style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {visibleTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex-shrink-0 font-ui text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-red focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                  activeTab === tab.key
                    ? 'text-white border-b border-electric-red pb-1'
                    : 'text-chrome-500 hover:text-white'
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
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="break-inside-avoid bg-graphite border border-white/10 animate-pulse">
                  <div className="aspect-square bg-white/5" />
                  <div className="p-8 space-y-3">
                    <div className="h-6 bg-white/10 w-3/4" />
                    <div className="h-5 bg-white/5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-chrome-500 font-ui text-lg">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 mb-12">
              {[...items].sort((a, b) => {
                const aHas = productImages[a.id] ? 0 : 1;
                const bHas = productImages[b.id] ? 0 : 1;
                return aHas - bHas;
              }).slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  className="prod-card break-inside-avoid relative group overflow-hidden border border-white/10 bg-graphite"
                >
                  <div className="relative overflow-hidden">
                    {productImages[item.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(productImages[item.id] as string).replace('http://', 'https://')}
                        alt={item.onlineName || item.name}
                        className="w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-[#0a0a0a]">
                        <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                    {/* Variant chrome overlay + shine sweep */}
                    <div className="absolute inset-0 prod-overlay mix-blend-multiply pointer-events-none"></div>
                    <div className="prod-shine"></div>

                    {/* Best seller badge */}
                    {bestSellerIds.has(item.id) && (
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-[#FFD700]/90 text-black text-[10px] font-bold font-ui uppercase tracking-wider">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {t('bestSeller')}
                      </div>
                    )}

                    {/* Bottom-anchored content (Variant style) */}
                    <div className="absolute bottom-0 left-0 p-6 lg:p-8 w-full z-[4] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-display text-2xl lg:text-3xl uppercase text-white leading-none mb-3 line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                        {(item.onlineName || item.name).toUpperCase()}
                      </h3>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-white font-display text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                          {formatCents(item.price)}
                        </span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          aria-label={`${t('addToCart')} — ${item.onlineName || item.name}`}
                          className={`font-ui px-4 py-2 border text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                            addedItemId === item.id
                              ? 'bg-green-400/20 text-green-400 border-green-400'
                              : 'bg-electric-red text-white border-electric-red hover:bg-hot-red'
                          }`}
                        >
                          {addedItemId === item.id ? t('added') : t('addToCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All link — Variant CTA */}
        {!loading && items.length > 0 && (
          <AnimateOnScroll animation="fade-up" delay={0.2}>
            <div className="text-center">
              <Link
                href="/products"
                className="inline-block bg-electric-red hover:bg-hot-red text-white px-10 py-4 font-ui font-bold tracking-[0.2em] uppercase text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
