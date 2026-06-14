'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Shared modal chrome: scrim, instrument-panel container, Escape close,
// focus management, scroll lock. Header/body/footer via props.
export function ModalShell({
  title,
  onClose,
  children,
  footer,
  width = '500px',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="instrument-panel w-full max-h-[90vh] overflow-auto flex flex-col"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 border-b flex justify-between items-center"
          style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-panel-bot)' }}
        >
          <h2 className="font-heading text-lg uppercase tracking-wider" style={{ color: 'var(--adm-text)' }}>
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="font-heading text-xl leading-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--adm-primary)]"
            style={{ color: 'var(--adm-text-muted)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4">{children}</div>
        {footer && (
          <div
            className="px-6 py-4 border-t flex justify-end gap-3"
            style={{ borderColor: 'var(--adm-border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
