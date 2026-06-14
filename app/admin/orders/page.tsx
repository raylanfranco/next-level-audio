'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import type { CloverOrder } from '@/types/clover';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { formatCents, formatDate } from '../_lib/format';
import { PAGE_SIZE } from '../_lib/constants';

export default function OrdersPage() {
  const [orders, setOrders] = useState<CloverOrder[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPage = useCallback(async (off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clover/orders?limit=${PAGE_SIZE}&offset=${off}`);
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
        setOffset(off);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(0); }, [fetchPage]);

  const updateNote = async (id: string, note: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/clover/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, note } : o)));
        setEditingNote(null);
      }
    } catch (e) {
      console.error('Error updating order:', e);
    }
    setActionLoading(false);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/clover/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        setExpandedId(null);
      }
    } catch (e) {
      console.error('Error deleting order:', e);
    }
    setActionLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Recent orders from Clover POS</p>

      <InstrumentPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--adm-bg)' }}>
                {['Order', 'Line Items', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const items = order.lineItems?.elements?.length || 0;
                const paid = order.paymentState === 'PAID';
                const expanded = expandedId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="data-row cursor-pointer" onClick={() => setExpandedId(expanded ? null : order.id)}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs transition-transform ${expanded ? 'rotate-90' : ''}`} style={{ color: 'var(--adm-primary)' }}>▶</span>
                          <div>
                            <div className="font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{order.id.slice(0, 8)}…</div>
                            {order.note && <div className="font-body text-xs mt-0.5" style={{ color: 'var(--adm-text-faint)' }}>{order.note.split('\n')[0]}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text)' }}>{items} item{items !== 1 ? 's' : ''}</td>
                      <td className="px-6 py-3 font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{formatCents(order.total)}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: paid ? 'var(--adm-ok)' : 'var(--adm-warn)', borderColor: paid ? 'var(--adm-ok)' : 'var(--adm-warn)' }}>{order.paymentState || 'OPEN'}</span>
                      </td>
                      <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{order.createdTime ? formatDate(order.createdTime) : '—'}</td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 border-b" style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-border)' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-body text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--adm-text-faint)' }}>Line Items</h4>
                              {order.lineItems?.elements?.length ? (
                                <div className="space-y-1">
                                  {order.lineItems.elements.map((li, i) => (
                                    <div key={li.id || i} className="flex justify-between text-sm font-body">
                                      <span style={{ color: 'var(--adm-text)' }}>{li.name}</span>
                                      <span style={{ color: 'var(--adm-text-muted)' }}>{formatCents(li.price)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm font-body" style={{ color: 'var(--adm-text-faint)' }}>No line items</span>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <span className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Order ID</span>
                                <div className="font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{order.id}</div>
                              </div>
                              <div>
                                <span className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Notes</span>
                                {editingNote === order.id ? (
                                  <div className="flex gap-2 mt-1">
                                    <input className="adm-input flex-1 px-2 py-1 text-sm font-body" value={noteValue} onChange={(e) => setNoteValue(e.target.value)} placeholder="Order note…" onClick={(e) => e.stopPropagation()} />
                                    <button onClick={(e) => { e.stopPropagation(); updateNote(order.id, noteValue); }} disabled={actionLoading} className="adm-btn-primary font-heading text-xs px-3 py-1 uppercase cursor-pointer disabled:opacity-50">Save</button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingNote(null); }} className="adm-btn-ghost font-heading text-xs px-3 py-1 uppercase cursor-pointer">Cancel</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{order.note || '—'}</span>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingNote(order.id); setNoteValue(order.note || ''); }} className="font-heading text-xs uppercase cursor-pointer hover:opacity-70" style={{ color: 'var(--adm-text-muted)' }}>Edit</button>
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Payment</span>
                                <div className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{order.paymentState || 'OPEN'} · {order.state || '—'}</div>
                              </div>
                              {order.createdTime && (
                                <div>
                                  <span className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Created</span>
                                  <div className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{formatDate(order.createdTime)}</div>
                                </div>
                              )}
                              <div className="pt-1">
                                <button onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }} disabled={actionLoading} className="font-heading text-xs uppercase tracking-wider px-3 py-1.5 border cursor-pointer disabled:opacity-50" style={{ color: 'var(--adm-primary)', borderColor: 'var(--adm-primary)' }}>Delete Order</button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && orders.length === 0 && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>No orders found.</div>}
        {loading && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>}
      </InstrumentPanel>

      <div className="flex justify-between items-center">
        <span className="font-body text-sm" style={{ color: 'var(--adm-text-faint)' }}>Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
        <div className="flex gap-2">
          <button onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))} disabled={offset === 0} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">← Prev</button>
          <button onClick={() => fetchPage(offset + PAGE_SIZE)} disabled={orders.length < PAGE_SIZE} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next →</button>
        </div>
      </div>
    </div>
  );
}
