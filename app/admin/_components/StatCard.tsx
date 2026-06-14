import type { ReactNode } from 'react';
import { InstrumentPanel } from './InstrumentPanel';

// Overview KPI card: small label + optional delta indicator + big value.
export function StatCard({
  label,
  value,
  delta,
  deltaDir,
  accent = false,
  onClick,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaDir?: 'up' | 'down';
  accent?: boolean;
  onClick?: () => void;
}) {
  const isUp = deltaDir === 'up';
  return (
    <InstrumentPanel
      className={`p-5 flex flex-col justify-between h-[140px] ${onClick ? 'cursor-pointer' : ''}`}
      // accent border for the highlighted card (e.g. pending quotes)
    >
      <div
        className="contents"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      >
        <div className="flex justify-between items-start">
          <h3
            className="font-body text-[10px] tracking-[0.15em] uppercase font-semibold"
            style={{ color: accent ? 'var(--adm-primary)' : 'var(--adm-text-muted)' }}
          >
            {label}
          </h3>
          {delta ? (
            <div
              className="flex items-center gap-1 font-heading text-xs"
              style={{ color: isUp ? 'var(--adm-ok)' : 'var(--adm-primary)' }}
            >
              <svg className={`w-3 h-3 ${isUp ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l8 16H4z" />
              </svg>
              <span>{delta}</span>
            </div>
          ) : accent ? (
            <div className="w-2 h-2 animate-pulse" style={{ background: 'var(--adm-primary)' }} />
          ) : null}
        </div>
        <div
          className="font-heading text-6xl font-bold leading-none tracking-tighter"
          style={{ color: 'var(--adm-text)' }}
        >
          {value}
        </div>
      </div>
    </InstrumentPanel>
  );
}
