'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  clover_charge_id: string | null;
  items: OrderItem[];
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AccountOrdersPage() {
  const t = useTranslations('account');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account/orders')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white mb-6 neon-glow font-oxanium"
      >
        {t('orderHistoryTitle')}
      </h1>

      {orders.length === 0 ? (
        <div className="border-2 border-[#E01020]/20 p-12 text-center">
          <p className="text-white/40 font-mono text-sm mb-2">{t('noOrders')}</p>
          <p className="text-white/30 font-mono text-xs">
            {t('purchaseHistoryDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border-2 border-[#E01020]/20 hover:border-[#E01020]/40 transition-colors">
              {/* Order header */}
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full p-4 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4 text-left">
                  <div>
                    <p className="text-white font-semibold text-sm font-oxanium">
                      {formatDate(order.created_at)}
                    </p>
                    <p className="text-white/40 font-mono text-xs">
                      {order.items.length} {order.items.length !== 1 ? t('items') : t('item')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#E01020] font-mono font-bold neon-glow-soft">
                    {formatCents(order.total_cents)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white/40 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded details */}
              {expandedId === order.id && (
                <div className="border-t border-[#E01020]/20 p-4 bg-[#E01020]/5">
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-white/70 font-mono">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-white/50 font-mono">
                          {formatCents(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.discount_cents > 0 && (
                    <div className="flex justify-between text-sm border-t border-[#E01020]/10 pt-2">
                      <span className="text-green-400 font-mono">{t('discount')}</span>
                      <span className="text-green-400 font-mono">-{formatCents(order.discount_cents)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-[#E01020]/10 pt-2 mt-2">
                    <span className="text-white font-bold font-mono">{t('total')}</span>
                    <span className="text-[#E01020] font-bold font-mono">{formatCents(order.total_cents)}</span>
                  </div>
                  {order.clover_charge_id && (
                    <p className="text-white/30 font-mono text-[10px] mt-3">
                      {t('ref')}: {order.clover_charge_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
