'use client';

import { useAdminData } from '../_context/AdminDataProvider';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { StatusBadge } from '../_components/StatusBadge';
import { formatCents } from '../_lib/format';
import type { BookingStatus } from '@/types/booking';

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

export default function BookingsPage() {
  const { bookings, loading, refresh } = useAdminData();

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) refresh(); // resync data + sidebar badge
    } catch (e) {
      console.error('Error updating booking status:', e);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
    } catch (e) {
      console.error('Error deleting booking:', e);
    }
  };

  const selectCls = 'adm-input px-3 py-1.5 text-sm font-body cursor-pointer';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Live appointments from Who&apos;s Next?</p>
        <a href="https://whos-next-frontend.vercel.app/dashboard" target="_blank" rel="noopener noreferrer" className="adm-btn-ghost font-heading text-xs px-5 py-2.5 uppercase tracking-wider">
          Open Who&apos;s Next? →
        </a>
      </div>

      <InstrumentPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--adm-bg)' }}>
                {['Customer', 'Service', 'Vehicle', 'Date & Time', 'Deposit', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const vehicle = [b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ');
                return (
                  <tr key={b.id} className="data-row">
                    <td className="px-6 py-3">
                      <div className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{b.customer_name}</div>
                      {b.customer_email && <div className="font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>{b.customer_email}</div>}
                      {b.customer_phone && <div className="font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>{b.customer_phone}</div>}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{b.service_type}</div>
                      {b.service_price_cents != null && <div className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>{formatCents(b.service_price_cents)}</div>}
                    </td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
                      {vehicle || '—'}{b.vehicle_trim ? <span style={{ color: 'var(--adm-text-faint)' }}> {b.vehicle_trim}</span> : null}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{new Date(b.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>{b.appointment_time}</div>
                    </td>
                    <td className="px-6 py-3">
                      {b.deposit_paid_at ? (
                        <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: 'var(--adm-ok)', borderColor: 'var(--adm-ok)' }}>{b.deposit_amount_cents != null ? formatCents(b.deposit_amount_cents) : 'Paid'}</span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--adm-text-faint)' }}>—</span>
                      )}
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value as BookingStatus)} className={selectCls}>
                          {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
                        </select>
                        <button onClick={() => deleteBooking(b.id)} className="font-heading text-xs uppercase tracking-wider cursor-pointer hover:opacity-70" style={{ color: 'var(--adm-primary)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && bookings.length === 0 && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>No bookings found. Appointments from Who&apos;s Next? will appear here.</div>}
        {loading && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>}
      </InstrumentPanel>
    </div>
  );
}
