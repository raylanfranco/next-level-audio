import type { ReactNode } from 'react';

// Instrument panel card with optional title bar (PanelHeader).
export function InstrumentPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`instrument-panel ${className}`}>{children}</div>;
}

export function PanelHeader({
  title,
  right,
  small = false,
}: {
  title: string;
  right?: ReactNode;
  small?: boolean;
}) {
  return (
    <div
      className="px-6 py-4 border-b flex justify-between items-center"
      style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-panel-bot)' }}
    >
      <h2
        className={`font-heading text-white uppercase tracking-wider ${small ? 'text-base' : 'text-lg'}`}
        style={{ color: 'var(--adm-text)' }}
      >
        {title}
      </h2>
      {right}
    </div>
  );
}
