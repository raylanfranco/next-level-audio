'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CloverPayment } from '@/types/clover';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { formatCents, formatDate } from '../_lib/format';
import { PAGE_SIZE } from '../_lib/constants';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<CloverPayment[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clover/payments?limit=${PAGE_SIZE}&offset=${off}`);
      if (res.ok) {
        const d = await res.json();
        setPayments(d.payments || []);
        setOffset(off);
      }
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Payment history from Clover POS</p>

      <InstrumentPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--adm-bg)' }}>
                {['Amount', 'Tip', 'Tax', 'Tender', 'Result', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const success = p.result === 'SUCCESS';
                return (
                  <tr key={p.id} className="data-row">
                    <td className="px-6 py-3 font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{formatCents(p.amount)}</td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{(p.tipAmount ?? 0) > 0 ? formatCents(p.tipAmount!) : '—'}</td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{(p.taxAmount ?? 0) > 0 ? formatCents(p.taxAmount!) : '—'}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: 'var(--adm-text-muted)', borderColor: 'var(--adm-border)' }}>{p.tender?.label || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: success ? 'var(--adm-ok)' : 'var(--adm-primary)', borderColor: success ? 'var(--adm-ok)' : 'var(--adm-primary)' }}>{p.result}</span>
                    </td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{p.createdTime ? formatDate(p.createdTime) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && payments.length === 0 && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>No payments found.</div>}
        {loading && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>}
      </InstrumentPanel>

      <div className="flex justify-between items-center">
        <span className="font-body text-sm" style={{ color: 'var(--adm-text-faint)' }}>Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
        <div className="flex gap-2">
          <button onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">← Prev</button>
          <button onClick={() => fetchPage(offset + PAGE_SIZE)} disabled={payments.length < PAGE_SIZE} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
}
