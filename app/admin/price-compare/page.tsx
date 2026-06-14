'use client';

import { useState } from 'react';
import { InstrumentPanel } from '../_components/InstrumentPanel';

interface PriceResultRow {
  distributor: string;
  distributorUrl: string;
  productName: string;
  productUrl: string;
  sku: string | null;
  priceCents: number | null;
  priceDisplay: string;
  inStock: boolean | null;
  imageUrl: string | null;
  matchConfidence: 'exact' | 'high' | 'partial';
}

export default function PriceComparePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PriceResultRow[]>([]);
  const [errors, setErrors] = useState<{ distributor: string; error: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchedAt, setSearchedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    setErrors([]);
    setSearchedAt(null);
    try {
      const res = await fetch('/api/admin/price-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const d = await res.json().catch(() => null);
      if (d && d.results) {
        setResults(d.results || []);
        setErrors(d.errors || []);
        setSearchedAt(d.searchedAt || new Date().toISOString());
        setHistory((prev) => [q, ...prev.filter((h) => h.toLowerCase() !== q.toLowerCase())].slice(0, 10));
      } else {
        setErrors([{ distributor: 'System', error: d?.error || `Server returned ${res.status}` }]);
        setSearchedAt(new Date().toISOString());
      }
    } catch (e) {
      setErrors([{ distributor: 'System', error: String(e) }]);
      setSearchedAt(new Date().toISOString());
    } finally {
      setSearching(false);
    }
  };

  const matchColor = (m: string) => (m === 'exact' ? 'var(--adm-ok)' : m === 'high' ? 'var(--adm-text-muted)' : 'var(--adm-text-faint)');

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Search 6 distributors for the best price</p>

      {/* Search bar */}
      <InstrumentPanel className="p-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter product name or SKU (e.g. CS7900-AS, dash kit, remote start)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              className="adm-input w-full px-4 py-3 text-sm font-body"
            />
            {history.length > 0 && !searching && (
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>Recent:</span>
                {history.map((h, i) => (
                  <button key={i} onClick={() => setQuery(h)} className="adm-btn-ghost text-xs px-2 py-0.5 font-body cursor-pointer">{h}</button>
                ))}
              </div>
            )}
          </div>
          <button onClick={search} disabled={searching || !query.trim()} className="adm-btn-primary font-heading text-xs font-bold px-8 py-3 uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
      </InstrumentPanel>

      {/* Loading */}
      {searching && (
        <InstrumentPanel className="p-12 text-center">
          <div className="font-heading text-lg mb-2" style={{ color: 'var(--adm-primary)' }}>Searching distributors…</div>
          <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Checking iDatalink, Meyer, Directechs, Firstech, ECUSAD, Specialty Marketing, Metra Online</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (<div key={i} className="w-2 h-2 animate-pulse" style={{ background: 'var(--adm-primary)', animationDelay: `${i * 0.15}s` }} />))}
          </div>
        </InstrumentPanel>
      )}

      {/* Results */}
      {!searching && searchedAt && (
        <>
          <div className="flex items-center justify-between">
            <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
              {errors.length > 0 && <span className="ml-2" style={{ color: 'var(--adm-warn)' }}>({errors.length} distributor{errors.length !== 1 ? 's' : ''} failed)</span>}
            </p>
            <p className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>Searched at {new Date(searchedAt).toLocaleTimeString()}</p>
          </div>

          {results.length > 0 ? (
            <InstrumentPanel className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'var(--adm-bg)' }}>
                      <th className="px-4 py-3 text-center font-body text-[10px] uppercase tracking-widest w-12" style={{ color: 'var(--adm-text-faint)' }}>#</th>
                      {['Distributor', 'Product', 'SKU'].map((h) => (<th key={h} className="px-4 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>))}
                      <th className="px-4 py-3 text-right font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Price</th>
                      {['Match', 'Action'].map((h) => (<th key={h} className="px-4 py-3 text-center font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const isBest = i === 0 && r.priceCents !== null;
                      return (
                        <tr key={i} className="data-row" style={isBest ? { borderLeft: '2px solid var(--adm-ok)' } : undefined}>
                          <td className="px-4 py-3 text-center font-heading text-sm" style={{ color: 'var(--adm-text-faint)' }}>
                            {isBest ? <span className="px-2 py-0.5 text-xs font-bold" style={{ color: 'var(--adm-ok)', border: '1px solid var(--adm-ok)' }}>BEST</span> : i + 1}
                          </td>
                          <td className="px-4 py-3 font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{r.distributor}</td>
                          <td className="px-4 py-3 font-body text-sm" style={{ color: 'var(--adm-text)' }}>{r.productName}</td>
                          <td className="px-4 py-3 font-heading text-sm" style={{ color: 'var(--adm-text-muted)' }}>{r.sku || '—'}</td>
                          <td className="px-4 py-3 text-right font-heading text-sm font-bold" style={{ color: r.priceCents !== null ? (isBest ? 'var(--adm-ok)' : 'var(--adm-text)') : 'var(--adm-text-faint)' }}>{r.priceDisplay}</td>
                          <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 border text-xs font-heading uppercase" style={{ color: matchColor(r.matchConfidence), borderColor: matchColor(r.matchConfidence) }}>{r.matchConfidence}</span></td>
                          <td className="px-4 py-3 text-center"><a href={r.productUrl} target="_blank" rel="noopener noreferrer" className="adm-btn-ghost text-xs font-heading uppercase tracking-wider px-3 py-1 inline-block">View / Order</a></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </InstrumentPanel>
          ) : (
            <InstrumentPanel className="p-12 text-center"><span className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>No results found. Try a different product name or SKU.</span></InstrumentPanel>
          )}

          {errors.length > 0 && (
            <InstrumentPanel className="p-4">
              <p className="font-heading text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--adm-warn)' }}>Failed Distributors</p>
              <div className="space-y-1">
                {errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>
                    <span className="w-1.5 h-1.5" style={{ background: 'var(--adm-warn)' }} />
                    <span className="font-medium" style={{ color: 'var(--adm-text-muted)' }}>{err.distributor}:</span>
                    <span style={{ color: 'var(--adm-text-faint)' }}>{err.error}</span>
                  </div>
                ))}
              </div>
            </InstrumentPanel>
          )}
        </>
      )}

      {/* Empty state */}
      {!searching && !searchedAt && (
        <InstrumentPanel className="p-12 text-center">
          <div className="text-4xl mb-4" style={{ color: 'var(--adm-text-faint)' }}>⌕</div>
          <p className="font-body text-sm mb-2" style={{ color: 'var(--adm-text-muted)' }}>Enter a product name or SKU to compare prices across all distributors.</p>
          <div className="font-body text-xs space-y-1" style={{ color: 'var(--adm-text-faint)' }}>
            <p>Searches: iDatalink, Meyer Distributing, Directechs, Firstech, ECUSAD, Specialty Marketing, Metra Online</p>
            <p>Results include dealer pricing where available, with links to place orders directly.</p>
          </div>
        </InstrumentPanel>
      )}
    </div>
  );
}
