'use client';

import { useState, useEffect, useCallback } from 'react';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { formatCents } from '../_lib/format';

interface CouponRow {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  used_count: number;
  points_cost: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = { code: '', type: 'percent' as 'percent' | 'fixed', value: '', min_order_cents: '', max_uses: '', points_cost: '', expires_at: '' };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const d = await res.json();
        setCoupons(d.coupons || []);
      }
    } catch (e) {
      console.error('Error fetching coupons:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const createCoupon = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: form.type === 'fixed' ? Number(form.value) * 100 : Number(form.value),
          min_order_cents: form.min_order_cents ? Number(form.min_order_cents) * 100 : null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          points_cost: form.points_cost ? Number(form.points_cost) : 0,
          expires_at: form.expires_at || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to create coupon');
        return;
      }
      setShowForm(false);
      setForm(emptyForm);
      await fetchCoupons();
    } catch {
      setError('Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !isActive }),
      });
      await fetchCoupons();
    } catch (e) {
      console.error('Error toggling coupon:', e);
    }
  };

  const inputCls = 'adm-input w-full px-3 py-2 text-sm font-body';
  const labelCls = 'block font-body text-[10px] tracking-widest uppercase mb-1';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Create and manage discount coupons</p>
        <button onClick={() => setShowForm((s) => !s)} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider cursor-pointer">
          {showForm ? 'Cancel' : '+ New Coupon'}
        </button>
      </div>

      {showForm && (
        <InstrumentPanel className="p-6">
          <h3 className="font-heading text-lg uppercase tracking-wider mb-4" style={{ color: 'var(--adm-text)' }}>Create Coupon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Code *</label>
              <input className={`${inputCls} uppercase`} value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Type *</label>
              <select className={`${inputCls} cursor-pointer`} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}>
                <option value="percent">Percent Off (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Value * {form.type === 'percent' ? '(%)' : '($)'}</label>
              <input className={inputCls} type="number" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} placeholder={form.type === 'percent' ? '20' : '10.00'} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Min Order ($)</label>
              <input className={inputCls} type="number" value={form.min_order_cents} onChange={(e) => setForm((p) => ({ ...p, min_order_cents: e.target.value }))} placeholder="Optional" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Max Uses</label>
              <input className={inputCls} type="number" value={form.max_uses} onChange={(e) => setForm((p) => ({ ...p, max_uses: e.target.value }))} placeholder="Unlimited" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Expires At</label>
              <input className={inputCls} type="date" value={form.expires_at} onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))} />
            </div>
          </div>
          {error && <p className="text-sm mb-3" style={{ color: 'var(--adm-primary)' }}>{error}</p>}
          <button onClick={createCoupon} disabled={saving || !form.code || !form.value} className="adm-btn-primary font-heading text-xs font-bold px-6 py-2 uppercase tracking-wider cursor-pointer disabled:opacity-30">
            {saving ? 'Creating…' : 'Create Coupon'}
          </button>
        </InstrumentPanel>
      )}

      {loading ? (
        <InstrumentPanel className="p-12 text-center"><span className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Loading coupons…</span></InstrumentPanel>
      ) : coupons.length === 0 ? (
        <InstrumentPanel className="p-12 text-center"><span className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>No coupons yet. Create one to get started.</span></InstrumentPanel>
      ) : (
        <InstrumentPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--adm-bg)' }}>
                  {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="data-row">
                    <td className="px-6 py-3 font-heading font-bold text-sm" style={{ color: 'var(--adm-text)' }}>{c.code}</td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text)' }}>{c.type === 'percent' ? `${c.value}%` : formatCents(c.value)}</td>
                    <td className="px-6 py-3 font-heading text-sm" style={{ color: 'var(--adm-text-muted)' }}>{c.min_order_cents ? formatCents(c.min_order_cents) : '—'}</td>
                    <td className="px-6 py-3 font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 border text-xs font-heading uppercase" style={{ color: c.is_active ? 'var(--adm-ok)' : 'var(--adm-primary)', borderColor: c.is_active ? 'var(--adm-ok)' : 'var(--adm-primary)' }}>{c.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={() => toggle(c.id, c.is_active)} className="adm-btn-ghost text-xs font-heading uppercase tracking-wider px-3 py-1 cursor-pointer">{c.is_active ? 'Disable' : 'Enable'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InstrumentPanel>
      )}
    </div>
  );
}
