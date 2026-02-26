'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from './CartContext';

declare global {
  interface Window {
    Clover?: new (apiKey: string, opts: { merchantId: string }) => CloverInstance;
  }
}

interface CloverInstance {
  elements: () => CloverElements;
  createToken: () => Promise<{ token?: string; errors?: Record<string, string> }>;
}

interface CloverElements {
  create: (type: string, styles?: Record<string, unknown>) => CloverElement;
}

interface CloverElement {
  mount: (selector: string) => void;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutModal() {
  const { items, removeItem, updateQuantity, clearCart, total, isCheckoutOpen, closeCheckout } = useCart();
  const [step, setStep] = useState<'cart' | 'payment' | 'success' | 'error'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [chargeId, setChargeId] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const cloverRef = useRef<CloverInstance | null>(null);
  const elementsRef = useRef<{ mounted: boolean }>({ mounted: false });

  const merchantId = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID || '';

  // Load Clover SDK script
  useEffect(() => {
    if (!isCheckoutOpen || step !== 'payment') return;
    if (document.querySelector('script[src*="checkout"][src*="clover.com"]')) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.clover.com/sdk.js';
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setSdkError(true);
    document.head.appendChild(script);
  }, [isCheckoutOpen, step]);

  // Initialize Clover elements when SDK is loaded
  const initClover = useCallback(async () => {
    if (!sdkLoaded || !window.Clover || elementsRef.current.mounted) return;

    try {
      const pakmsRes = await fetch('/api/clover/pakms');
      if (!pakmsRes.ok) throw new Error('Failed to fetch API key');
      const { apiAccessKey } = await pakmsRes.json();

      const clover = new window.Clover(apiAccessKey, { merchantId });
      cloverRef.current = clover;

      const elements = clover.elements();
      const styles = {
        input: {
          fontSize: '16px',
          color: '#E01020',
          fontFamily: 'monospace',
          backgroundColor: 'transparent',
          '::placeholder': { color: 'rgba(224, 16, 32, 0.4)' },
        },
      };

      const cardNumber = elements.create('CARD_NUMBER', styles);
      const cardDate = elements.create('CARD_DATE', styles);
      const cardCvv = elements.create('CARD_CVV', styles);
      const cardPostalCode = elements.create('CARD_POSTAL_CODE', styles);

      // Small delay to ensure DOM elements exist
      setTimeout(() => {
        cardNumber.mount('#card-number');
        cardDate.mount('#card-date');
        cardCvv.mount('#card-cvv');
        cardPostalCode.mount('#card-postal-code');
        elementsRef.current.mounted = true;
      }, 100);
    } catch (err) {
      console.error('Clover init error:', err);
      setSdkError(true);
    }
  }, [sdkLoaded, merchantId]);

  useEffect(() => {
    if (step === 'payment' && sdkLoaded) {
      initClover();
    }
  }, [step, sdkLoaded, initClover]);

  // Reset state on close
  const handleClose = () => {
    closeCheckout();
    setTimeout(() => {
      setStep('cart');
      setCustomerInfo({ name: '', email: '', phone: '' });
      setIsProcessing(false);
      setErrorMessage('');
      setChargeId('');
      elementsRef.current.mounted = false;
      cloverRef.current = null;
    }, 200);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloverRef.current) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const result = await cloverRef.current.createToken();

      if (result.errors) {
        setErrorMessage(Object.values(result.errors)[0]);
        setIsProcessing(false);
        return;
      }

      if (!result.token) {
        setErrorMessage('Failed to tokenize card. Please try again.');
        setIsProcessing(false);
        return;
      }

      const description = items.map((i) => `${i.name} x${i.quantity}`).join(', ');

      const chargeRes = await fetch('/api/clover/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: result.token,
          amount: total,
          currency: 'usd',
          description,
          receipt_email: customerInfo.email,
        }),
      });

      const chargeData = await chargeRes.json();

      if (!chargeRes.ok) {
        setErrorMessage(chargeData.details || chargeData.error || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      setChargeId(chargeData.charge?.id || '');
      clearCart();
      setStep('success');
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isCheckoutOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border-2 border-[#E01020]/50 w-full max-w-lg max-h-[90vh] overflow-y-auto neon-border-soft">
        {/* Header */}
        <div className="p-4 border-b-2 border-[#E01020]/30 flex justify-between items-center">
          <h2
            className="text-xl font-bold text-[#E01020] neon-glow"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {step === 'cart' ? 'YOUR CART' : step === 'payment' ? 'CHECKOUT' : step === 'success' ? 'ORDER CONFIRMED' : 'PAYMENT ERROR'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#E01020] hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* CART STEP */}
          {step === 'cart' && (
            <div>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#E01020]/60 font-mono text-sm">Your cart is empty.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 border-b border-[#E01020]/20 pb-4">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover border border-[#E01020]/30" />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 border border-[#E01020]/30 flex items-center justify-center">
                            <span className="text-[#E01020]/30 text-[10px] font-mono">NO IMG</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-oxanium)' }}>
                            {item.name}
                          </p>
                          <p className="text-[#E01020] font-mono text-sm">{formatCents(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 border border-[#E01020]/30 text-[#E01020] text-sm flex items-center justify-center hover:border-[#E01020] transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-[#E01020] font-mono text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 border border-[#E01020]/30 text-[#E01020] text-sm flex items-center justify-center hover:border-[#E01020] transition-colors cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-[#E01020]/30 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>TOTAL</span>
                      <span className="text-[#E01020] font-mono text-xl font-bold neon-glow">{formatCents(total)}</span>
                    </div>
                  </div>

                  <div className="bg-[#E01020]/5 border border-[#E01020]/20 p-3 mb-4">
                    <p className="text-[#E01020]/70 font-mono text-xs">
                      <span className="font-bold text-[#E01020]">PICKUP ONLY:</span> Orders are available for in-store pickup at 944 N 9th St, Stroudsburg, PA.
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    className="w-full bg-[#E01020]/20 border-2 border-[#E01020] text-[#E01020] px-6 py-3 font-semibold text-sm hover:bg-[#E01020]/30 transition-all duration-300 cursor-pointer"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </>
              )}
            </div>
          )}

          {/* PAYMENT STEP */}
          {step === 'payment' && (
            <form onSubmit={handlePayment} className="space-y-4">
              {/* Order Summary */}
              <div className="border-b border-[#E01020]/20 pb-4 mb-4">
                <p className="text-[#E01020]/60 font-mono text-xs uppercase mb-2">Order Summary</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span className="text-white/80 font-mono truncate mr-2">{item.name} x{item.quantity}</span>
                    <span className="text-[#E01020] font-mono">{formatCents(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-[#E01020]/10">
                  <span className="text-white font-bold" style={{ fontFamily: 'var(--font-oxanium)' }}>TOTAL</span>
                  <span className="text-[#E01020] font-bold font-mono">{formatCents(total)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <label className="block text-[#E01020] font-mono text-xs mb-1.5 uppercase">Name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 bg-black border-2 border-[#E01020]/30 text-[#E01020] placeholder-[#E01020]/40 font-mono text-sm focus:outline-none focus:border-[#E01020] transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#E01020] font-mono text-xs mb-1.5 uppercase">Email *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-black border-2 border-[#E01020]/30 text-[#E01020] placeholder-[#E01020]/40 font-mono text-sm focus:outline-none focus:border-[#E01020] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[#E01020] font-mono text-xs mb-1.5 uppercase">Phone *</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo((p) => ({ ...p, phone: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-black border-2 border-[#E01020]/30 text-[#E01020] placeholder-[#E01020]/40 font-mono text-sm focus:outline-none focus:border-[#E01020] transition-colors"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              {/* Clover Card Elements */}
              <div className="border-t border-[#E01020]/20 pt-4">
                <p className="text-[#E01020] font-mono text-xs uppercase mb-3">Payment Details</p>

                {sdkError ? (
                  <p className="text-red-400 font-mono text-sm text-center py-4">
                    Payment system unavailable. Please call (570) 730-4433.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[#E01020]/60 font-mono text-xs mb-1">Card Number</label>
                      <div
                        id="card-number"
                        className="w-full h-11 px-4 bg-black border-2 border-[#E01020]/30 flex items-center focus-within:border-[#E01020] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[#E01020]/60 font-mono text-xs mb-1">Exp Date</label>
                        <div
                          id="card-date"
                          className="w-full h-11 px-4 bg-black border-2 border-[#E01020]/30 flex items-center focus-within:border-[#E01020] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[#E01020]/60 font-mono text-xs mb-1">CVV</label>
                        <div
                          id="card-cvv"
                          className="w-full h-11 px-4 bg-black border-2 border-[#E01020]/30 flex items-center focus-within:border-[#E01020] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[#E01020]/60 font-mono text-xs mb-1">ZIP</label>
                        <div
                          id="card-postal-code"
                          className="w-full h-11 px-4 bg-black border-2 border-[#E01020]/30 flex items-center focus-within:border-[#E01020] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {errorMessage && (
                <p className="text-red-400 font-mono text-xs text-center">{errorMessage}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    elementsRef.current.mounted = false;
                    cloverRef.current = null;
                  }}
                  className="px-6 py-3 border-2 border-[#E01020]/50 text-[#E01020] hover:border-[#E01020] transition-colors font-semibold text-sm cursor-pointer"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || sdkError}
                  className="flex-1 bg-[#E01020]/20 border-2 border-[#E01020] text-[#E01020] px-6 py-3 font-semibold text-sm hover:bg-[#E01020]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  {isProcessing ? 'PROCESSING...' : `PAY ${formatCents(total)}`}
                </button>
              </div>
            </form>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-green-400 mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                PAYMENT SUCCESSFUL
              </h3>
              <p className="text-[#E01020]/70 font-mono text-sm mb-2">
                Your order has been placed!
              </p>
              {chargeId && (
                <p className="text-[#E01020]/50 font-mono text-xs mb-4">
                  Reference: {chargeId}
                </p>
              )}
              <p className="text-[#E01020]/60 font-mono text-xs mb-2">
                A receipt has been sent to your email.
              </p>
              <div className="bg-[#E01020]/5 border border-[#E01020]/20 p-3 mb-6">
                <p className="text-[#E01020]/70 font-mono text-xs">
                  <span className="font-bold text-[#E01020]">PICKUP LOCATION:</span> 944 N 9th St, Stroudsburg, PA 18360
                </p>
                <p className="text-[#E01020]/50 font-mono text-xs mt-1">
                  We&apos;ll notify you when your order is ready.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-[#E01020] hover:text-[#FF2A3A] font-mono underline text-sm cursor-pointer"
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
                PAYMENT FAILED
              </h3>
              <p className="text-[#E01020]/70 font-mono text-sm mb-4">
                {errorMessage || 'Something went wrong. Please try again or call (570) 730-4433.'}
              </p>
              <button
                onClick={() => setStep('payment')}
                className="bg-[#E01020]/20 border-2 border-[#E01020] text-[#E01020] px-6 py-3 font-semibold text-sm hover:bg-[#E01020]/30 transition-all cursor-pointer"
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
