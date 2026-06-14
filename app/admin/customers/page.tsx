'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CloverCustomer } from '@/types/clover';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { formatDate } from '../_lib/format';
import { PAGE_SIZE } from '../_lib/constants';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CloverCustomer[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPage = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clover/customers?limit=${PAGE_SIZE}&offset=${off}`);
      if (res.ok) {
        const d = await res.json();
        setCustomers(d.customers || []);
        setOffset(off);
      }
    } catch (e) {
      console.error('Error fetching customers:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  const named = customers.filter((c) => c.firstName || c.lastName);

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Customer records from Clover POS</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {named.map((customer) => {
          const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
          const email = customer.emailAddresses?.elements?.[0]?.emailAddress;
          const phone = customer.phoneNumbers?.elements?.[0]?.phoneNumber;
          const marketing = customer.marketingAllowed;
          return (
            <InstrumentPanel key={customer.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 flex items-center justify-center text-lg font-bold font-heading" style={{ background: 'var(--adm-bg-elevated)', color: 'var(--adm-text)' }}>
                  {(customer.firstName?.[0] || customer.lastName?.[0] || '?').toUpperCase()}
                </div>
                <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: marketing ? 'var(--adm-ok)' : 'var(--adm-text-faint)', borderColor: marketing ? 'var(--adm-ok)' : 'var(--adm-border)' }}>
                  {marketing ? 'Marketing: Yes' : 'Marketing: No'}
                </span>
              </div>
              <h3 className="font-heading text-lg mb-2" style={{ color: 'var(--adm-text)' }}>{name}</h3>
              <div className="space-y-1 font-body">
                {email && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--adm-text-faint)' }}>Email:</span>
                    <a href={`mailto:${email}`} className="text-sm hover:underline truncate" style={{ color: 'var(--adm-primary)' }}>{email}</a>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--adm-text-faint)' }}>Phone:</span>
                    <a href={`tel:${phone}`} className="text-sm hover:underline" style={{ color: 'var(--adm-primary)' }}>{phone}</a>
                  </div>
                )}
                {!email && !phone && <div className="text-sm" style={{ color: 'var(--adm-text-faint)' }}>No contact info</div>}
              </div>
              <div className="mt-3 pt-3 border-t font-body text-xs" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-text-faint)' }}>
                Customer since {customer.customerSince ? formatDate(customer.customerSince) : 'Unknown'}
              </div>
            </InstrumentPanel>
          );
        })}
      </div>
      {!loading && named.length === 0 && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>No customers found.</div>}
      {loading && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>}

      <div className="flex justify-between items-center">
        <span className="font-body text-sm" style={{ color: 'var(--adm-text-faint)' }}>Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
        <div className="flex gap-2">
          <button onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">← Prev</button>
          <button onClick={() => fetchPage(offset + PAGE_SIZE)} disabled={customers.length < PAGE_SIZE} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
}
