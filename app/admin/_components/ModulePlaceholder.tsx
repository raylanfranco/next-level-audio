import { InstrumentPanel } from './InstrumentPanel';

// Temporary placeholder for admin modules not yet ported in the phased build.
export function ModulePlaceholder({ name }: { name: string }) {
  return (
    <InstrumentPanel className="p-12 flex flex-col items-center justify-center text-center">
      <div className="font-heading text-2xl uppercase tracking-wider mb-2" style={{ color: 'var(--adm-text)' }}>
        {name}
      </div>
      <div className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
        Module being ported to the new design.
      </div>
    </InstrumentPanel>
  );
}
