'use client';

import { useState } from 'react';
import { useAdminData } from '../_context/AdminDataProvider';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { StatusBadge } from '../_components/StatusBadge';
import { ModalShell } from '../_components/modals/ModalShell';
import type { CareerApplication, ApplicationStatus } from '@/types/career';

const STATUS_OPTIONS: ApplicationStatus[] = ['pending', 'reviewed', 'interviewed', 'hired', 'rejected'];

export default function ApplicationsPage() {
  const { applications, loading, refresh } = useAdminData();
  const [selected, setSelected] = useState<CareerApplication | null>(null);

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/careers/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) refresh();
    } catch (e) {
      console.error('Error updating application status:', e);
    }
  };

  const selectCls = 'adm-input px-3 py-1.5 text-sm font-body cursor-pointer';

  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>Review and manage job applications</p>

      <InstrumentPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--adm-bg)' }}>
                {['Date', 'Applicant', 'Position', 'Resume', 'Cover Letter', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="data-row">
                  <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
                    {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{app.applicant_name}</div>
                    <div className="font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>{app.applicant_email}</div>
                    {app.applicant_phone && <div className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>{app.applicant_phone}</div>}
                  </td>
                  <td className="px-6 py-3 font-body text-sm" style={{ color: 'var(--adm-text)' }}>{app.position || 'General Application'}</td>
                  <td className="px-6 py-3">
                    {app.resume_url ? (
                      <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="font-heading text-xs uppercase tracking-wider underline" style={{ color: 'var(--adm-text-muted)' }}>Download</a>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--adm-text-faint)' }}>None</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    {app.cover_letter ? (
                      <button onClick={() => setSelected(app)} className="font-body text-xs italic text-left max-w-xs truncate cursor-pointer hover:opacity-70 underline" style={{ color: 'var(--adm-text-muted)' }} title="View full cover letter">
                        &ldquo;{app.cover_letter}&rdquo;
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--adm-text-faint)' }}>None</span>
                    )}
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-6 py-3">
                    <select value={app.status} onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)} className={selectCls}>
                      {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && applications.length === 0 && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>No applications yet. Applications will appear here when candidates apply.</div>}
        {loading && <div className="text-center py-12 text-sm font-body" style={{ color: 'var(--adm-text-muted)' }}>Loading…</div>}
      </InstrumentPanel>

      {selected && (
        <ModalShell
          title={selected.applicant_name}
          onClose={() => setSelected(null)}
          width="680px"
          footer={
            <>
              {selected.resume_url ? (
                <a href={selected.resume_url} target="_blank" rel="noopener noreferrer" className="font-heading text-xs uppercase tracking-wider underline mr-auto" style={{ color: 'var(--adm-text-muted)' }}>Download Resume</a>
              ) : (
                <span className="font-body text-xs mr-auto" style={{ color: 'var(--adm-text-faint)' }}>No resume attached</span>
              )}
              <button onClick={() => setSelected(null)} className="adm-btn-ghost font-heading text-xs px-4 py-2 uppercase tracking-wider cursor-pointer">Close</button>
            </>
          }
        >
          <div className="font-body text-sm space-y-1">
            <div style={{ color: 'var(--adm-text-muted)' }}>{selected.applicant_email}</div>
            {selected.applicant_phone && <div style={{ color: 'var(--adm-text-faint)' }}>{selected.applicant_phone}</div>}
            <div style={{ color: 'var(--adm-text-muted)' }}>
              <span style={{ color: 'var(--adm-text-faint)' }}>Position: </span>{selected.position || 'General Application'}
            </div>
          </div>
          <div className="mt-2">
            <div className="font-body text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--adm-text-faint)' }}>Cover Letter</div>
            {selected.cover_letter ? (
              <div className="font-body text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto" style={{ color: 'var(--adm-text)' }}>{selected.cover_letter}</div>
            ) : (
              <div className="font-body text-sm italic" style={{ color: 'var(--adm-text-faint)' }}>No cover letter provided.</div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
