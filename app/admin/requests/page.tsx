'use client';

import { useAdminData } from '../_context/AdminDataProvider';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { StatusBadge } from '../_components/StatusBadge';
import { formatCents } from '../_lib/format';
import type { InquiryStatus } from '@/types/inquiry';

const STATUS_OPTIONS: InquiryStatus[] = ['pending', 'contacted', 'fulfilled', 'closed'];

export default function RequestsPage() {
  const { inquiries, loading, refresh } = useAdminData();

  const updateStatus = async (id: string, status: InquiryStatus) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) refresh();
    } catch (e) {
      console.error('Error updating inquiry status:', e);
    }
  };

  const selectCls = 'adm-input px-3 py-1.5 text-sm font-body cursor-pointer';

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Backorder and inquiry requests from customers</p>

      <InstrumentPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--adm-bg)' }}>
                {['Date', 'Customer', 'Product', 'Type', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => {
                const isBackorder = inq.request_type === 'backorder';
                return (
                  <tr key={inq.id} className="data-row">
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
                      {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{inq.customer_name}</div>
                      <div className="font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>{inq.customer_email}</div>
                      {inq.customer_phone && <div className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>{inq.customer_phone}</div>}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{inq.product_name}</div>
                      <div className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>{formatCents(inq.product_price)}</div>
                      {inq.message && <div className="font-body text-xs mt-1 max-w-xs truncate italic" style={{ color: 'var(--adm-text-faint)' }}>&ldquo;{inq.message}&rdquo;</div>}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: isBackorder ? 'var(--adm-warn)' : 'var(--adm-text-muted)', borderColor: isBackorder ? 'var(--adm-warn)' : 'var(--adm-border)' }}>
                        {isBackorder ? 'Backorder' : 'Inquiry'}
                      </span>
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={inq.status} /></td>
                    <td className="px-6 py-3">
                      <select value={inq.status} onChange={(e) => updateStatus(inq.id, e.target.value as InquiryStatus)} className={selectCls}>
                        {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && inquiries.length === 0 && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>No requests yet. Backorder requests from customers will appear here.</div>}
        {loading && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>}
      </InstrumentPanel>
    </div>
  );
}
