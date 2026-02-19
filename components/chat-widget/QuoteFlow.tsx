import { useState } from 'react';
import { chatbotConfig } from '@/lib/chatbot/config';
import type { QuoteStep, QuoteFormData } from './types';

interface QuoteFlowProps {
  form: QuoteFormData;
  setForm: (form: QuoteFormData) => void;
  onSubmitted: () => void;
  onBack: () => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

export default function QuoteFlow({ form, setForm, onSubmitted, onBack }: QuoteFlowProps) {
  const [step, setStep] = useState<QuoteStep>('select-service');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleBack() {
    if (step === 'select-service') onBack();
    else if (step === 'vehicle-info') setStep('select-service');
    else if (step === 'customer-info') setStep('vehicle-info');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to submit');
      onSubmitted();
    } catch {
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepTitle = {
    'select-service': 'What service are you interested in?',
    'vehicle-info': 'Tell us about your vehicle',
    'customer-info': 'How can we reach you?',
  }[step];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4">
        {(['select-service', 'vehicle-info', 'customer-info'] as QuoteStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
                step === s
                  ? 'bg-[#00A0E0] text-black'
                  : i < ['select-service', 'vehicle-info', 'customer-info'].indexOf(step)
                    ? 'bg-[#00A0E0]/30 text-[#00A0E0]'
                    : 'bg-[#00A0E0]/10 text-[#00A0E0]/40'
              }`}
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div className={`w-6 h-px ${
                i < ['select-service', 'vehicle-info', 'customer-info'].indexOf(step)
                  ? 'bg-[#00A0E0]/30'
                  : 'bg-[#00A0E0]/10'
              }`} />
            )}
          </div>
        ))}
      </div>

      <p
        className="text-[#00A0E0]/70 text-sm mb-4"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      >
        {stepTitle}
      </p>

      {/* Step 1: Select Service */}
      {step === 'select-service' && (
        <div className="flex-1 flex flex-col">
          <div className="space-y-1.5 flex-1">
            {chatbotConfig.quoteServices.map((s) => (
              <button
                key={s.id}
                onClick={() => setForm({ ...form, service: s.label })}
                className={`w-full text-left px-3 py-2.5 text-sm border transition-all cursor-pointer ${
                  form.service === s.label
                    ? 'border-[#00A0E0] bg-[#00A0E0]/15 text-[#00A0E0]'
                    : 'border-[#00A0E0]/15 bg-[#0a0a0a] text-[#00A0E0]/70 hover:border-[#00A0E0]/40'
                }`}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('vehicle-info')}
            disabled={!form.service}
            className="mt-4 w-full py-2.5 bg-[#00A0E0] text-black text-sm font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00A0E0]/90 transition-colors cursor-pointer"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            NEXT
          </button>
        </div>
      )}

      {/* Step 2: Vehicle Info */}
      {step === 'vehicle-info' && (
        <div className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Year
              </label>
              <select
                value={form.vehicleYear}
                onChange={(e) => setForm({ ...form, vehicleYear: e.target.value })}
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
                Make
              </label>
              <input
                value={form.vehicleMake}
                onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
                placeholder="e.g. Honda"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Model
              </label>
              <input
                value={form.vehicleModel}
                onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
                placeholder="e.g. Civic"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Notes (optional)
              </label>
              <textarea
                value={form.vehicleNotes}
                onChange={(e) => setForm({ ...form, vehicleNotes: e.target.value })}
                placeholder="Any details about what you're looking for..."
                rows={2}
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 border border-[#00A0E0]/30 text-[#00A0E0]/60 text-sm tracking-wider hover:border-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BACK
            </button>
            <button
              onClick={() => setStep('customer-info')}
              className="flex-1 py-2.5 bg-[#00A0E0] text-black text-sm font-bold tracking-wider hover:bg-[#00A0E0]/90 transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Info */}
      {step === 'customer-info' && (
        <div className="flex-1 flex flex-col">
          {/* Summary */}
          <div className="border border-[#00A0E0]/15 bg-[#00A0E0]/5 px-3 py-2 mb-4 text-xs font-mono text-[#00A0E0]/60">
            <span className="text-[#00A0E0]">{form.service}</span>
            {form.vehicleYear && (
              <span> &mdash; {[form.vehicleYear, form.vehicleMake, form.vehicleModel].filter(Boolean).join(' ')}</span>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Name *
              </label>
              <input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Your name"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Email *
              </label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                placeholder="your@email.com"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#00A0E0]/50 uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-oxanium)' }}>
                Phone *
              </label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="(555) 123-4567"
                className="w-full bg-black border border-[#00A0E0]/30 px-3 py-2 text-sm text-[#00A0E0] font-mono placeholder:text-[#00A0E0]/20 focus:outline-none focus:border-[#00A0E0]"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs font-mono mt-2">{error}</div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 border border-[#00A0E0]/30 text-[#00A0E0]/60 text-sm tracking-wider hover:border-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              BACK
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.customerName || !form.customerEmail || !form.customerPhone}
              className="flex-1 py-2.5 bg-[#00A0E0] text-black text-sm font-bold tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#00A0E0]/90 transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-oxanium)' }}
            >
              {submitting ? 'SENDING...' : 'SUBMIT REQUEST'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
