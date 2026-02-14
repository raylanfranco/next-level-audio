'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { CloverItem, CloverCategory } from '@/types/clover';
import { useCart } from '@/components/CartContext';
import AnimateOnScroll from '@/components/AnimateOnScroll';

// Curated categories with friendly names.
// The `match` field is a case-insensitive substring matched against Clover category names.
// This lets us decouple the display from whatever the merchant named them in Clover.
const CURATED_TABS = [
  { key: 'all', label: 'ALL', match: null },
  { key: 'audio', label: 'SOUND SYSTEMS', match: 'audio' },
  { key: 'subwoofers', label: 'SUBWOOFERS', match: 'sub' },
  { key: 'speakers', label: 'SPEAKERS', match: 'speaker' },
  { key: 'lighting', label: 'LIGHTING', match: 'light' },
  { key: 'tinting', label: 'WINDOW TINTING', match: 'tint' },
  { key: 'remote', label: 'REMOTE START', match: 'remote' },
  { key: 'security', label: 'SECURITY', match: 'secur' },
  { key: 'accessories', label: 'ACCESSORIES', match: 'accessor' },
];

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

  const { addItem } = useCart();
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Resolve a curated tab key to a Clover category ID
  const resolveCategoryId = useCallback((tabKey: string): string | null => {
    if (tabKey === 'all') return null;
    const tab = CURATED_TABS.find(t => t.key === tabKey);
    if (!tab?.match) return null;
    const cat = categories.find(c =>
      c.name.toLowerCase().includes(tab.match!)
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
      const params = new URLSearchParams({ limit: '12', offset: '0', expand: 'categories' });
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
              SHOP BY CATEGORY
            </h2>
            <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
              Browse our inventory by category — find exactly what your ride needs
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
                    ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0] neon-border-soft'
                    : 'bg-transparent text-[#00A0E0]/50 border-[#00A0E0]/20 hover:border-[#00A0E0]/50 hover:text-[#00A0E0]/80'
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
                <div key={i} className="bg-black border-2 border-[#00A0E0]/10 animate-pulse">
                  <div className="aspect-square bg-[#00A0E0]/5" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-[#00A0E0]/10 w-3/4" />
                    <div className="h-4 bg-[#00A0E0]/5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#00A0E0]/40 font-mono text-lg">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...items].sort((a, b) => (productImages[a.id] ? 0 : 1) - (productImages[b.id] ? 0 : 1)).slice(0, 12).map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-up bg-black border-2 border-[#00A0E0]/30 overflow-hidden hover:border-[#00A0E0] transition-all duration-500 transform hover:-translate-y-2 group neon-border-soft"
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
                        <svg className="w-16 h-16 text-[#00A0E0]/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#00A0E0]/10 group-hover:bg-[#00A0E0]/20 transition-colors duration-500"></div>
                  </div>

                  <div className="p-6">
                    <h3
                      className="text-lg font-bold text-[#00A0E0] mb-2 line-clamp-2 neon-glow-soft"
                      style={{ fontFamily: 'var(--font-oxanium)' }}
                    >
                      {(item.onlineName || item.name).toUpperCase()}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#00A0E0] font-mono neon-glow-soft">
                        {formatCents(item.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`px-4 py-2 border-2 font-semibold font-mono text-xs transition-all duration-300 cursor-pointer ${
                          addedItemId === item.id
                            ? 'bg-green-400/20 text-green-400 border-green-400'
                            : 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0] hover:bg-[#00A0E0]/30 neon-border-soft cyber-button'
                        }`}
                      >
                        {addedItemId === item.id ? 'ADDED!' : 'ADD TO CART'}
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
                className="inline-block px-8 py-4 bg-[#00A0E0]/20 text-[#00A0E0] border-2 border-[#00A0E0] font-semibold text-lg font-mono hover:bg-[#00A0E0]/30 transition-all duration-300 transform hover:scale-105 neon-border-soft pulse-glow cyber-button"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                VIEW ALL PRODUCTS
              </Link>
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}
