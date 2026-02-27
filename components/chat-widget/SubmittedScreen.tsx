import type { QuoteFormData } from './types';

interface SubmittedScreenProps {
  quoteData: QuoteFormData;
  onStartOver: () => void;
  onClose: () => void;
}

export default function SubmittedScreen({ quoteData, onStartOver, onClose }: SubmittedScreenProps) {
  const vehicleParts = [quoteData.vehicleYear, quoteData.vehicleMake, quoteData.vehicleModel]
    .filter(Boolean);
  const vehicleStr = vehicleParts.length > 0 ? vehicleParts.join(' ') : null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      {/* Checkmark */}
      <div className="w-14 h-14 border-2 border-[#E01020] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#E01020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3
        className="text-[#E01020] text-lg font-bold tracking-wider mb-3 neon-glow-soft"
        style={{ fontFamily: 'var(--font-oxanium)' }}
      >
        REQUEST RECEIVED
      </h3>

      <p className="text-white/60 text-sm font-mono leading-relaxed mb-6">
        Thanks! We&apos;ll get back to you ASAP about your{' '}
        <span className="text-[#E01020]">{quoteData.service}</span>
        {vehicleStr && (
          <> quote for your <span className="text-[#E01020]">{vehicleStr}</span></>
        )}
        .
      </p>

      <div className="flex gap-3 w-full">
        <button
          onClick={onStartOver}
          className="flex-1 py-2.5 border border-[#E01020]/30 text-white/60 text-sm tracking-wider hover:border-[#E01020]/60 hover:text-[#E01020] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          START OVER
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-[#E01020] text-black text-sm font-bold tracking-wider hover:bg-[#E01020]/90 transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
