'use client';

import { useState, useEffect, useCallback } from 'react';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { formatCents } from '../_lib/format';

interface BestSellerRow {
  id: string;
  clover_item_id: string;
  item_name: string;
  total_quantity_sold: number;
  total_revenue_cents: number;
  order_count: number;
  last_sold_at: string | null;
  updated_at: string;
}

export default function BestSellersPage() {
  const [rows, setRows] = useState<BestSellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/best-sellers?limit=50&sort=quantity');
      if (res.ok) {
        const d = await res.json();
        setRows(d.items || []);
        if (d.items?.length > 0 && d.items[0].updated_at) setLastRefreshed(d.items[0].updated_at);
      }
    } catch (e) {
      console.error('Error fetching best sellers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/best-sellers/refresh', { method: 'POST' });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error('Error refreshing best sellers:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const totalQty = rows.reduce((s, r) => s + r.total_quantity_sold, 0);
  const totalRev = rows.reduce((s, r) => s + r.total_revenue_cents, 0);
  const rankLabel = (i: number) => (i === 0 ? '1ST' : i === 1 ? '2ND' : '3RD');
  const rankColor = (i: number) => (i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : '#d97706');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
          Products ranked by sales volume from Clover order history
          {lastRefreshed && <span style={{ color: 'var(--adm-text-faint)' }}> — Last refreshed {new Date(lastRefreshed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>}
        </p>
        <button onClick={refresh} disabled={refreshing} className="adm-btn-ghost font-heading text-xs px-5 py-2.5 uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-2">
          {refreshing ? (<><span className="inline-block w-3 h-3 border-2 border-current border-t-transparent animate-spin" />Refreshing…</>) : 'Refresh Data'}
        </button>
      </div>

      {loading ? (
        <InstrumentPanel className="p-12 text-center"><span className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Loading best sellers…</span></InstrumentPanel>
      ) : rows.length === 0 ? (
        <InstrumentPanel className="p-12 text-center flex flex-col items-center gap-4">
          <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>No best sellers data yet. Refresh to aggregate sales from Clover orders.</p>
          <button onClick={refresh} disabled={refreshing} className="adm-btn-primary font-heading text-xs px-5 py-2.5 uppercase tracking-wider cursor-pointer disabled:opacity-50">{refreshing ? 'Refreshing…' : 'Refresh Now'}</button>
        </InstrumentPanel>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Products Sold', value: totalQty.toLocaleString() },
              { label: 'Total Revenue', value: formatCents(totalRev) },
              { label: 'Unique Products', value: rows.length.toLocaleString() },
            ].map((s) => (
              <InstrumentPanel key={s.label} className="p-5">
                <p className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--adm-text-faint)' }}>{s.label}</p>
                <p className="font-heading text-2xl font-bold" style={{ color: 'var(--adm-text)' }}>{s.value}</p>
              </InstrumentPanel>
            ))}
          </div>

          <InstrumentPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--adm-bg)' }}>
                    <th className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>#</th>
                    <th className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Product</th>
                    {['Qty Sold', 'Revenue', 'Orders', 'Last Sold'].map((h) => (
                      <th key={h} className="px-6 py-3 text-right font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className="data-row">
                      <td className="px-6 py-3 font-heading text-sm" style={{ color: 'var(--adm-text-faint)' }}>{i + 1}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {i < 3 && <span className="px-1.5 py-0.5 text-[10px] font-bold font-heading" style={{ color: rankColor(i), border: `1px solid ${rankColor(i)}` }}>{rankLabel(i)}</span>}
                          <span className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{r.item_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right font-heading text-sm font-bold" style={{ color: 'var(--adm-text)' }}>{r.total_quantity_sold.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-heading text-sm" style={{ color: 'var(--adm-ok)' }}>{formatCents(r.total_revenue_cents)}</td>
                      <td className="px-6 py-3 text-right font-heading text-sm" style={{ color: 'var(--adm-text-muted)' }}>{r.order_count.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-body text-sm" style={{ color: 'var(--adm-text-faint)' }}>{r.last_sold_at ? new Date(r.last_sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InstrumentPanel>
        </>
      )}
    </div>
  );
}
