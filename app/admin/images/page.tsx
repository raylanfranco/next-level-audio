'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminData } from '../_context/AdminDataProvider';
import { InstrumentPanel } from '../_components/InstrumentPanel';

interface QueueItem {
  cloverItemId: string;
  name: string;
  upc: string | null;
  imageUrl: string | null;
  source: string;
  fetchedAt: string;
}

export default function ImageQueuePage() {
  const { refresh } = useAdminData();
  const [pending, setPending] = useState<QueueItem[]>([]);
  const [missing, setMissing] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/image-queue');
      if (!res.ok) throw new Error(`Failed to load queue (${res.status})`);
      const d = await res.json();
      setPending(d.pending || []);
      setMissing(d.missing || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (item: QueueItem, action: 'approve' | 'reject') => {
    setBusy(item.cloverItemId);
    setError(null);
    try {
      const res = await fetch('/api/admin/image-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloverItemId: item.cloverItemId, action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Failed to ${action} (${res.status})`);
      }
      setPending((prev) => prev.filter((p) => p.cloverItemId !== item.cloverItemId));
      refresh(); // keep the sidebar badge in sync
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to ${action}`);
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
        Auto-fetched product images are held here and never shown on the site until approved.
        Approving pins the image; rejecting hides it permanently. Rejected or missing images can
        be set manually from Inventory.
      </p>

      {error && (
        <div className="px-4 py-3 border font-body text-sm" style={{ color: 'var(--adm-primary)', borderColor: 'var(--adm-primary)' }}>
          {error}
        </div>
      )}

      <InstrumentPanel className="overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--adm-border)' }}>
          <span className="font-heading text-xs uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>
            Awaiting Approval
          </span>
          <span className="font-heading text-xs" style={{ color: 'var(--adm-primary)' }}>{pending.length}</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>
            Queue clear — no scraped images awaiting review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
            {pending.map((item) => (
              <div key={item.cloverItemId} className="border flex flex-col" style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-bg)' }}>
                <div className="h-48 flex items-center justify-center overflow-hidden" style={{ background: '#000' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl!} alt={item.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
                <div className="p-4 flex flex-col gap-1 flex-1">
                  <div className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{item.name}</div>
                  <div className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>
                    UPC: {item.upc || 'n/a'} · {item.source} · {fmtDate(item.fetchedAt)}
                  </div>
                  <a
                    href={item.imageUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-xs underline truncate"
                    style={{ color: 'var(--adm-text-muted)' }}
                  >
                    {item.imageUrl}
                  </a>
                </div>
                <div className="grid grid-cols-2 border-t" style={{ borderColor: 'var(--adm-border)' }}>
                  <button
                    onClick={() => decide(item, 'approve')}
                    disabled={busy === item.cloverItemId}
                    className="py-2.5 font-heading text-[10px] uppercase tracking-widest cursor-pointer disabled:opacity-50"
                    style={{ color: 'var(--adm-ok)' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => decide(item, 'reject')}
                    disabled={busy === item.cloverItemId}
                    className="py-2.5 font-heading text-[10px] uppercase tracking-widest cursor-pointer border-l disabled:opacity-50"
                    style={{ color: 'var(--adm-primary)', borderColor: 'var(--adm-border)' }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </InstrumentPanel>

      {missing.length > 0 && (
        <InstrumentPanel className="overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--adm-border)' }}>
            <span className="font-heading text-xs uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>
              No Image Found — Upload Manually
            </span>
            <span className="font-heading text-xs" style={{ color: 'var(--adm-text-muted)' }}>{missing.length}</span>
          </div>
          <div className="p-6 flex flex-col gap-2">
            {missing.map((item) => (
              <div key={item.cloverItemId} className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>{item.name}</span>
                  <span className="font-body text-xs ml-3" style={{ color: 'var(--adm-text-faint)' }}>UPC: {item.upc || 'n/a'}</span>
                </div>
                <Link href="/admin/inventory" className="adm-btn-ghost font-heading text-[10px] px-4 py-2 uppercase tracking-widest shrink-0">
                  Set in Inventory
                </Link>
              </div>
            ))}
          </div>
        </InstrumentPanel>
      )}
    </div>
  );
}
