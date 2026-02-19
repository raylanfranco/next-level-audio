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
      <div className="w-14 h-14 border-2 border-[#00A0E0] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#00A0E0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3
        className="text-[#00A0E0] text-lg font-bold tracking-wider mb-3 neon-glow-soft"
        style={{ fontFamily: 'var(--font-oxanium)' }}
      >
        REQUEST RECEIVED
      </h3>

      <p className="text-[#00A0E0]/60 text-sm font-mono leading-relaxed mb-6">
        Thanks! We&apos;ll get back to you ASAP about your{' '}
        <span className="text-[#00A0E0]">{quoteData.service}</span>
        {vehicleStr && (
          <> quote for your <span className="text-[#00A0E0]">{vehicleStr}</span></>
        )}
        .
      </p>

      <div className="flex gap-3 w-full">
        <button
          onClick={onStartOver}
          className="flex-1 py-2.5 border border-[#00A0E0]/30 text-[#00A0E0]/60 text-sm tracking-wider hover:border-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          START OVER
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-[#00A0E0] text-black text-sm font-bold tracking-wider hover:bg-[#00A0E0]/90 transition-colors cursor-pointer"
          style={{ fontFamily: 'var(--font-oxanium)' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
