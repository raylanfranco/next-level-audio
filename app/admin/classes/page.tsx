'use client';

import { InstrumentPanel, PanelHeader } from '../_components/InstrumentPanel';
import { classCohorts } from '../_lib/classes-data';
import { formatCents } from '../_lib/format';

export default function ClassesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div
        className="px-4 py-3 border text-xs font-body"
        style={{ borderColor: 'var(--adm-border)', background: 'var(--adm-bg-elevated)', color: 'var(--adm-text-muted)' }}
      >
        Window-tinting school — preview data. Enrollment backend coming soon.
      </div>

      {classCohorts.map((cohort) => {
        const filled = cohort.students.length;
        return (
          <InstrumentPanel key={cohort.id} className="flex flex-col">
            <PanelHeader
              title={cohort.title}
              right={
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xs px-2 py-1 border" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-text-muted)' }}>
                    {cohort.startDate} → {cohort.endDate}
                  </span>
                  <span className="font-heading text-sm" style={{ color: 'var(--adm-text)' }}>{formatCents(cohort.priceCents)}</span>
                </div>
              }
            />
            <div className="p-5">
              <div className="flex justify-between items-end mb-4">
                <span className="font-body text-xs uppercase tracking-widest" style={{ color: 'var(--adm-text-muted)' }}>Enrollment</span>
                <span className="font-heading text-lg" style={{ color: 'var(--adm-text)' }}>
                  {filled}<span style={{ color: 'var(--adm-text-faint)' }}>/{cohort.totalSeats} seats</span>
                </span>
              </div>

              {/* seat grid */}
              <div className="grid grid-cols-8 gap-2 mb-6">
                {Array.from({ length: cohort.totalSeats }).map((_, i) => {
                  const taken = i < filled;
                  return (
                    <div
                      key={i}
                      className="aspect-square flex items-center justify-center border"
                      style={taken
                        ? { borderColor: 'var(--adm-primary)', background: 'rgba(224,16,32,0.1)' }
                        : { borderColor: 'var(--adm-border)', borderStyle: 'dashed' }}
                    >
                      {taken ? (
                        <svg className="w-4 h-4" fill="none" stroke="var(--adm-primary)" viewBox="0 0 24 24"><path strokeLinecap="square" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      ) : (
                        <span className="font-heading text-xs" style={{ color: 'var(--adm-text-faint)' }}>+</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* roster */}
              <div className="font-body text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--adm-text-faint)' }}>Roster</div>
              <div className="flex flex-col">
                {cohort.students.map((s) => (
                  <div key={s.id} className="flex justify-between items-center px-3 py-3 data-row">
                    <div className="flex flex-col">
                      <span className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{s.name}</span>
                      <span className="font-body text-[11px]" style={{ color: 'var(--adm-text-muted)' }}>{s.email}</span>
                    </div>
                    <span className="font-heading text-[11px]" style={{ color: 'var(--adm-text-muted)' }}>{s.enrolledAt}</span>
                  </div>
                ))}
                {cohort.students.length === 0 && (
                  <div className="px-3 py-4 text-sm" style={{ color: 'var(--adm-text-muted)' }}>No students enrolled yet.</div>
                )}
              </div>
            </div>
          </InstrumentPanel>
        );
      })}
    </div>
  );
}
