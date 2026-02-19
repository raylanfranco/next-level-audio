import { useState } from 'react';
import type { FitmentStep, FitmentFormData, FitmentResult } from './types';

interface FitmentFlowProps {
  form: FitmentFormData;
  setForm: (form: FitmentFormData) => void;
  onBack: () => void;
  onNavigateQuote: () => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

const BAYREADY_API = process.env.NEXT_PUBLIC_BAYREADY_API_URL || 'https://bayready-production.up.railway.app';

export default function FitmentFlow({ form, setForm, onBack, onNavigateQuote }: FitmentFlowProps) {
  const [step, setStep] = useState<FitmentStep>('vehicle-select');
  const [results, setResults] = useState<FitmentResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  async function handleSearch() {
    setSearching(true);
    setNoResults(false);
    try {
      const params = new URLSearchParams({
        year: form.year,
        make: form.make,
        model: form.model,
      });
      const res = await fetch(`${BAYREADY_API}/fitment?${params}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setResults(data);
      setNoResults(data.length === 0);
      setStep('results');
    } catch {
      // API unavailable or error — show fallback
      setResults([]);
      setNoResults(true);
      setStep('results');
    } finally {
      setSearching(false);
    }
  }

  const vehicleStr = [form.year, form.make, form.model].filter(Boolean).join(' ');

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col">
      {step === 'vehicle-select' && (
        <>
          <p
            className="text-[#00A0E0]/70 text-sm mb-4"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            Find parts compatible with your vehicle
          </p>

          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Year *
              </label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono focus:outline-none focus:border-[#00A0E0]"
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Make *
              </label>
              <input
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                placeholder="e.g. Honda"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Model *
              </label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. Civic"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onBack}
              className="flex-1 py-2.5 border border-[#00A0E0]/30 text-[#00A0E0]/60 text-sm tracking-wider hover:border-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BACK
            </button>
            <button
              onClick={handleSearch}
              disabled={searching || !form.year || !form.make || !form.model}
              className="flex-1 py-2.5 bg-[#00A0E0] text-black text-sm font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00A0E0]/90 transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {searching ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>
        </>
      )}

      {step === 'results' && (
        <>
          <div className="border-b border-[#00A0E0]/15 pb-3 mb-3">
            <p
              className="text-[#00A0E0] text-sm font-bold"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {vehicleStr}
            </p>
            <p className="text-[#00A0E0]/50 text-xs font-mono">
              {results.length > 0
                ? `${results.length} compatible part${results.length !== 1 ? 's' : ''} found`
                : 'No fitment data available'}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="space-y-2 flex-1">
              {results.map((r) => (
                <div key={r.id} className="border border-[#00A0E0]/15 bg-[#0a0a0a] p-3">
                  <div className="text-sm text-[#00A0E0] font-mono">{r.partName}</div>
                  <div className="flex gap-3 mt-1 text-[10px] text-[#00A0E0]/40 font-mono">
                    {r.partNumber && <span>#{r.partNumber}</span>}
                    <span>{r.category}</span>
                    {r.brand && <span>{r.brand}</span>}
                  </div>
                  {r.notes && (
                    <div className="text-[10px] text-[#00A0E0]/30 font-mono mt-1">{r.notes}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <p className="text-[#00A0E0]/60 text-sm font-mono mb-4">
                We don&apos;t have fitment data for this vehicle yet. Call us for personalized recommendations.
              </p>
              <a
                href="tel:+15707304433"
                className="text-[#00A0E0] text-sm font-bold hover:underline"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                (570) 730-4433
              </a>
            </div>
          )}

          <div className="border-t border-[#00A0E0]/15 pt-3 mt-3 space-y-2">
            <p className="text-[10px] text-[#00A0E0]/40 font-mono text-center">
              Don&apos;t see what you need?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setStep('vehicle-select'); setResults([]); setNoResults(false); }}
                className="flex-1 py-2 border border-[#00A0E0]/30 text-[#00A0E0]/60 text-xs tracking-wider hover:border-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                SEARCH AGAIN
              </button>
              <button
                onClick={onNavigateQuote}
                className="flex-1 py-2 bg-[#00A0E0] text-black text-xs font-bold tracking-wider hover:bg-[#00A0E0]/90 transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                GET A QUOTE
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
