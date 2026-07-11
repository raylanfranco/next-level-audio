'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CloverItem, CloverCategory } from '@/types/clover';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { ModalShell } from '../_components/modals/ModalShell';
import { formatCents } from '../_lib/format';
import { PAGE_SIZE } from '../_lib/constants';

const emptyForm = { name: '', price: '', cost: '', code: '', description: '', categoryId: '', stockCount: '' };

export default function InventoryPage() {
  const [inventory, setInventory] = useState<CloverItem[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CloverItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Product image editing (Edit modal only)
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgIsOverride, setImgIsOverride] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgMode, setImgMode] = useState<'url' | 'upload'>('url');
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const fetchPage = useCallback(async (off: number, q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(off) });
      if (q) params.set('search', q);
      const res = await fetch(`/api/clover/inventory?${params}`);
      if (res.ok) {
        const d = await res.json();
        setInventory(d.items || []);
        setInventoryCount(d.count || 0);
        setOffset(off);
      }
    } catch (e) {
      console.error('Error fetching inventory:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Categories once
  useEffect(() => {
    fetch('/api/clover/categories')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.categories && setCategories(d.categories))
      .catch(() => {});
  }, []);

  // Debounced search (resets to page 0)
  useEffect(() => {
    if (!search) {
      fetchPage(0);
      return;
    }
    const t = setTimeout(() => fetchPage(0, search), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Load the current image whenever the Edit modal opens for an existing item.
  useEffect(() => {
    if (!showForm || !editing) {
      setImgUrl(null);
      setImgIsOverride(false);
      setImgUrlInput('');
      setImgError(null);
      setImgMode('url');
      return;
    }
    setImgLoading(true);
    fetch(`/api/admin/product-image?id=${encodeURIComponent(editing.id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setImgUrl(d.imageUrl ?? null);
          setImgIsOverride(!!d.isOverride);
        }
      })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, [showForm, editing]);

  const setImageByUrl = async () => {
    if (!editing || !imgUrlInput.trim()) return;
    setImgBusy(true);
    setImgError(null);
    try {
      const res = await fetch('/api/admin/product-image', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloverItemId: editing.id, imageUrl: imgUrlInput.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Failed to set image');
      setImgUrl(d.imageUrl);
      setImgIsOverride(true);
      setImgUrlInput('');
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Failed to set image');
    } finally {
      setImgBusy(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setImgBusy(true);
    setImgError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('cloverItemId', editing.id);
      const res = await fetch('/api/admin/product-image', { method: 'POST', body: fd });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Upload failed');
      setImgUrl(d.imageUrl);
      setImgIsOverride(true);
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setImgBusy(false);
    }
  };

  const revertImage = async () => {
    if (!editing) return;
    setImgBusy(true);
    setImgError(null);
    try {
      const res = await fetch(`/api/admin/product-image?id=${encodeURIComponent(editing.id)}`, {
        method: 'DELETE',
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Failed to revert');
      setImgUrl(d.imageUrl ?? null);
      setImgIsOverride(false);
    } catch (e) {
      setImgError(e instanceof Error ? e.message : 'Failed to revert');
    } finally {
      setImgBusy(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
  };

  const saveProduct = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const priceCents = Math.round(parseFloat(form.price) * 100);
      const costCents = form.cost ? Math.round(parseFloat(form.cost) * 100) : undefined;
      const stock = form.stockCount ? parseInt(form.stockCount, 10) : undefined;
      const body = {
        name: form.name,
        price: priceCents,
        cost: costCents,
        code: form.code || undefined,
        description: form.description || undefined,
        categoryId: form.categoryId || undefined,
        stockCount: stock,
      };
      await fetch(editing ? `/api/clover/inventory/${editing.id}` : '/api/clover/inventory', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      resetForm();
      fetchPage(offset, search || undefined);
    } catch (e) {
      console.error('Error saving product:', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product from Clover? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/clover/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) setInventory((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const startEdit = (item: CloverItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      price: (item.price / 100).toFixed(2),
      cost: item.cost ? (item.cost / 100).toFixed(2) : '',
      code: item.code || '',
      description: item.description || '',
      categoryId: item.categories?.elements?.[0]?.id || '',
      stockCount: String(item.stockCount ?? 0),
    });
    setShowForm(true);
  };

  const stockColor = (n: number) =>
    n > 5 ? 'var(--adm-ok)' : n > 0 ? 'var(--adm-warn)' : 'var(--adm-primary)';

  const inputCls = 'adm-input w-full px-3 py-2 text-sm font-body';
  const labelCls = 'block font-body text-[10px] tracking-widest uppercase mb-1';

  return (
    <div className="flex flex-col gap-6">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
          Live inventory from Clover POS
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="adm-btn-primary font-heading text-xs font-bold px-5 py-2.5 uppercase tracking-wider cursor-pointer"
          >
            + Add Product
          </button>
          <a href="/products" target="_blank" rel="noreferrer" className="adm-btn-ghost font-heading text-xs px-5 py-2.5 uppercase tracking-wider">
            View Store →
          </a>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH BY NAME, DESCRIPTION, OR BARCODE…"
        className="adm-input w-full md:w-[28rem] px-4 py-2.5 text-sm font-heading"
      />

      {/* Table */}
      <InstrumentPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--adm-bg)' }}>
                {['Item', 'Barcode', 'Price', 'Cost', 'Stock', 'Category', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const stock = item.stockCount ?? 0;
                const cat = item.categories?.elements?.[0]?.name;
                return (
                  <tr key={item.id} className="data-row">
                    <td className="px-6 py-3">
                      <div className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{item.name}</div>
                      {item.description && <div className="font-body text-xs mt-0.5 max-w-xs truncate" style={{ color: 'var(--adm-text-faint)' }}>{item.description}</div>}
                    </td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{item.code || '—'}</td>
                    <td className="px-6 py-3 font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{formatCents(item.price)}</td>
                    <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>{item.cost ? formatCents(item.cost) : '—'}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 text-xs font-heading border" style={{ color: stockColor(stock), borderColor: stockColor(stock) }}>{stock}</span>
                    </td>
                    <td className="px-6 py-3 font-body text-xs" style={{ color: cat ? 'var(--adm-text-muted)' : 'var(--adm-text-faint)' }}>{cat || '—'}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(item)} className="font-heading text-xs uppercase tracking-wider cursor-pointer hover:opacity-70" style={{ color: 'var(--adm-text-muted)' }}>Edit</button>
                        <button onClick={() => deleteProduct(item.id)} className="font-heading text-xs uppercase tracking-wider cursor-pointer hover:opacity-70" style={{ color: 'var(--adm-primary)' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && inventory.length === 0 && (
          <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>
            {search ? 'No items match your search.' : 'No inventory items found.'}
          </div>
        )}
        {loading && (
          <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>
        )}
      </InstrumentPanel>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="font-body text-sm" style={{ color: 'var(--adm-text-faint)' }}>
          Showing {inventoryCount === 0 ? 0 : offset + 1}–{offset + inventoryCount}{search ? ` matching "${search}"` : ''}
        </span>
        <div className="flex gap-2">
          <button onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE), search || undefined)} disabled={offset === 0} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">← Prev</button>
          <button onClick={() => fetchPage(offset + PAGE_SIZE, search || undefined)} disabled={inventoryCount < PAGE_SIZE} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next →</button>
        </div>
      </div>

      {/* Product form modal */}
      {showForm && (
        <ModalShell
          title={editing ? 'Edit Product' : 'Add Product'}
          onClose={resetForm}
          width="640px"
          footer={
            <>
              <button onClick={resetForm} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider cursor-pointer">Cancel</button>
              <button onClick={saveProduct} disabled={!form.name || !form.price || saving} className="adm-btn-primary font-heading text-xs font-bold px-5 py-2 uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Pioneer DMH-1500NEX" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Price ($) *</label>
              <input className={inputCls} type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Cost ($)</label>
              <input className={inputCls} type="number" step="0.01" min="0" value={form.cost} onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Barcode / SKU</label>
              <input className={inputCls} value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="e.g. 884938377621" />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Category</label>
              <select className={`${inputCls} cursor-pointer`} value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
                <option value="">No Category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Stock Count</label>
              <input className={inputCls} type="number" min="0" value={form.stockCount} onChange={(e) => setForm((p) => ({ ...p, stockCount: e.target.value }))} placeholder="0" />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--adm-text-muted)' }}>Description</label>
            <textarea className={`${inputCls} resize-y`} rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Product description…" />
          </div>

          {/* Product image — Edit only (needs an existing Clover item id) */}
          {editing && (
            <div className="mt-2 pt-4 border-t" style={{ borderColor: 'var(--adm-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <label className={labelCls} style={{ color: 'var(--adm-text-muted)', marginBottom: 0 }}>Product Image</label>
                {imgIsOverride && (
                  <span className="px-2 py-0.5 text-[10px] font-heading uppercase tracking-wider border" style={{ color: 'var(--adm-ok)', borderColor: 'var(--adm-ok)' }}>Custom</span>
                )}
              </div>
              <div className="flex gap-4">
                {/* Preview */}
                <div className="shrink-0 w-24 h-24 border flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-bg)' }}>
                  {imgLoading ? (
                    <span className="text-[10px] font-body" style={{ color: 'var(--adm-text-faint)' }}>Loading…</span>
                  ) : imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-body text-center px-1" style={{ color: 'var(--adm-text-faint)' }}>No image</span>
                  )}
                </div>
                {/* Controls */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex gap-1">
                    {(['url', 'upload'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => { setImgMode(m); setImgError(null); }}
                        className="font-heading text-[10px] uppercase tracking-wider px-3 py-1 border cursor-pointer"
                        style={imgMode === m
                          ? { color: 'var(--adm-on-primary)', background: 'var(--adm-text)', borderColor: 'var(--adm-text)' }
                          : { color: 'var(--adm-text-muted)', borderColor: 'var(--adm-border)' }}
                      >
                        {m === 'url' ? 'Paste URL' : 'Upload'}
                      </button>
                    ))}
                  </div>
                  {imgMode === 'url' ? (
                    <div className="flex gap-2">
                      <input className={inputCls} value={imgUrlInput} onChange={(e) => setImgUrlInput(e.target.value)} placeholder="https://…/image.jpg" disabled={imgBusy} />
                      <button type="button" onClick={setImageByUrl} disabled={imgBusy || !imgUrlInput.trim()} className="adm-btn-primary font-heading text-xs font-bold px-4 py-2 uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        {imgBusy ? '…' : 'Set'}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      disabled={imgBusy}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }}
                      className="text-xs font-body"
                      style={{ color: 'var(--adm-text-muted)' }}
                    />
                  )}
                  <div className="flex items-center gap-3 min-h-[16px]">
                    {imgIsOverride && (
                      <button type="button" onClick={revertImage} disabled={imgBusy} className="font-heading text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-70 disabled:opacity-30" style={{ color: 'var(--adm-text-muted)' }}>
                        Revert to auto
                      </button>
                    )}
                    {imgError ? (
                      <span className="text-[10px] font-body" style={{ color: 'var(--adm-primary)' }}>{imgError}</span>
                    ) : imgMode === 'upload' ? (
                      <span className="text-[10px] font-body" style={{ color: 'var(--adm-text-faint)' }}>JPG/PNG/WebP · max 5 MB</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}
