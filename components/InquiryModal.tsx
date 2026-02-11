'use client';

import { useState } from 'react';

interface InquiryProduct {
  id: string;
  name: string;
  price: number; // in cents
  imageUrl?: string;
}

interface InquiryModalProps {
  product: InquiryProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function InquiryModal({ product, isOpen, onClose }: InquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setStep('form');
      setIsSubmitting(false);
      setErrorMessage('');
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          request_type: 'backorder',
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit request');
      }

      setStep('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border-2 border-[#F59E0B]/50 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)' }}>
        {/* Header */}
        <div className="p-4 border-b-2 border-[#F59E0B]/30 flex justify-between items-center">
          <h2
            className="text-xl font-bold text-[#F59E0B]"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {step === 'form' ? 'REQUEST ITEM' : step === 'success' ? 'REQUEST SUBMITTED' : 'REQUEST FAILED'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#F59E0B] hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* FORM STEP */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center gap-4 border-b border-[#F59E0B]/20 pb-4 mb-2">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover border border-[#F59E0B]/30" />
                ) : (
                  <div className="w-16 h-16 bg-white/5 border border-[#F59E0B]/30 flex items-center justify-center">
                    <span className="text-[#F59E0B]/30 text-[10px] font-mono">NO IMG</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {product.name}
                  </p>
                  <p className="text-[#F59E0B] font-mono text-sm">{formatCents(product.price)}</p>
                  <p className="text-red-400/80 font-mono text-xs mt-0.5">OUT OF STOCK</p>
                </div>
              </div>

              <p className="text-[#F59E0B]/60 font-mono text-xs">
                Fill out the form below and we&apos;ll notify you when this item becomes available.
              </p>

              {/* Customer Info */}
              <div>
                <label className="block text-[#F59E0B] font-mono text-xs mb-1.5 uppercase">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 bg-black border-2 border-[#F59E0B]/30 text-[#F59E0B] placeholder-[#F59E0B]/40 font-mono text-sm focus:outline-none focus:border-[#F59E0B] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F59E0B] font-mono text-xs mb-1.5 uppercase">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-black border-2 border-[#F59E0B]/30 text-[#F59E0B] placeholder-[#F59E0B]/40 font-mono text-sm focus:outline-none focus:border-[#F59E0B] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[#F59E0B] font-mono text-xs mb-1.5 uppercase">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-black border-2 border-[#F59E0B]/30 text-[#F59E0B] placeholder-[#F59E0B]/40 font-mono text-sm focus:outline-none focus:border-[#F59E0B] transition-colors"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#F59E0B] font-mono text-xs mb-1.5 uppercase">Message (optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-black border-2 border-[#F59E0B]/30 text-[#F59E0B] placeholder-[#F59E0B]/40 font-mono text-sm focus:outline-none focus:border-[#F59E0B] transition-colors resize-none"
                  placeholder="Any additional notes..."
                />
              </div>

              {errorMessage && (
                <p className="text-red-400 font-mono text-xs text-center">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F59E0B]/20 border-2 border-[#F59E0B] text-[#F59E0B] px-6 py-3 font-semibold text-sm hover:bg-[#F59E0B]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
              </button>
            </form>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-green-400 mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                REQUEST RECEIVED
              </h3>
              <p className="text-[#F59E0B]/70 font-mono text-sm mb-2">
                We&apos;ve received your request for:
              </p>
              <p className="text-white font-semibold mb-4" style={{ fontFamily: 'var(--font-oxanium)' }}>
                {product.name}
              </p>
              <p className="text-[#F59E0B]/60 font-mono text-xs mb-6">
                We&apos;ll reach out to you once this item is back in stock.
              </p>
              <button
                onClick={handleClose}
                className="text-[#F59E0B] hover:text-[#FBBF24] font-mono underline text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {/* ERROR STEP */}
          {step === 'error' && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-red-400 mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                SUBMISSION FAILED
              </h3>
              <p className="text-[#F59E0B]/70 font-mono text-sm mb-4">
                {errorMessage || 'Something went wrong. Please try again or call (570) 730-4433.'}
              </p>
              <button
                onClick={() => { setStep('form'); setErrorMessage(''); }}
                className="bg-[#F59E0B]/20 border-2 border-[#F59E0B] text-[#F59E0B] px-6 py-3 font-semibold text-sm hover:bg-[#F59E0B]/30 transition-all cursor-pointer"
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
