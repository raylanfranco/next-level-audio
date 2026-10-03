'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { InstrumentPanel } from '../_components/InstrumentPanel';
import { StatCard } from '../_components/StatCard';
import { StatusBadge } from '../_components/StatusBadge';
import type {
  AdminVipMember,
  AdminVipResponse,
  VipBenefitType,
  VipMembershipStatus,
} from '@/types/vip';

type StatusFilter = 'all' | VipMembershipStatus | 'ending';

const BENEFIT_LABELS: Record<VipBenefitType, string> = {
  diagnostic: 'Diagnostic visit',
  checkup: 'System checkup',
};

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function membershipTiming(member: AdminVipMember) {
  if (member.status === 'past_due') return 'Payment requires attention';
  if (member.status === 'canceled') {
    return member.canceledAt ? `Canceled ${formatDate(member.canceledAt)}` : 'Canceled';
  }
  if (member.cancelAtPeriodEnd) return `Ends ${formatDate(member.currentPeriodEnd)}`;
  if (member.status === 'active') return `Renews ${formatDate(member.currentPeriodEnd)}`;
  return 'No active billing period';
}

export default function VipMembersPage() {
  const [data, setData] = useState<AdminVipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/vip', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to load VIP memberships');
      setData(payload as AdminVipResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to load VIP memberships');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredMembers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return (data?.members || []).filter((member) => {
      const matchesSearch =
        !query ||
        [member.fullName, member.email, member.phone, member.memberNumber]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ending'
          ? member.status === 'active' && member.cancelAtPeriodEnd
          : member.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [data, deferredSearch, statusFilter]);

  const recordBenefit = async (member: AdminVipMember, benefitType: VipBenefitType) => {
    const label = BENEFIT_LABELS[benefitType];
    if (!window.confirm(`Record one ${label.toLowerCase()} for ${member.fullName}?`)) return;

    const actionKey = `${member.profileId}:${benefitType}`;
    setPendingAction(actionKey);
    setError('');
    try {
      const response = await fetch('/api/admin/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: member.profileId,
          benefitType,
          note: notes[member.profileId] || '',
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to record benefit');
      setNotes((current) => ({ ...current, [member.profileId]: '' }));
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to record benefit');
    } finally {
      setPendingAction(null);
    }
  };

  const correctUsage = async (member: AdminVipMember, usageId: string) => {
    if (!window.confirm(`Undo this VIP benefit entry for ${member.fullName}?`)) return;

    setPendingAction(usageId);
    setError('');
    try {
      const response = await fetch(`/api/admin/vip?usageId=${encodeURIComponent(usageId)}`, {
        method: 'DELETE',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to correct benefit usage');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to correct benefit usage');
    } finally {
      setPendingAction(null);
    }
  };

  const summary = data?.summary ?? { total: 0, active: 0, pastDue: 0, canceled: 0, ending: 0 };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
          Stripe subscription status and included service usage in one operational view.
        </p>
        <p className="font-body text-xs" style={{ color: 'var(--adm-text-faint)' }}>
          Billing changes stay in Stripe. Record in-store diagnostics and checkups here.
        </p>
      </div>

      {error && (
        <div
          className="border px-4 py-3 font-body text-sm flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--adm-primary)', color: 'var(--adm-primary)' }}
        >
          <span>{error}</span>
          <button className="adm-btn-ghost px-3 py-1 text-xs cursor-pointer" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard label="All Members" value={summary.total} />
        <StatCard label="Active" value={summary.active} />
        <StatCard label="Past Due" value={summary.pastDue} accent={summary.pastDue > 0} />
        <StatCard label="Ending" value={summary.ending} accent={summary.ending > 0} />
        <StatCard label="Canceled" value={summary.canceled} />
      </div>

      <InstrumentPanel className="p-4 flex flex-col md:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">Search VIP members</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone, or member number"
            className="adm-input w-full px-4 py-3 font-body text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Filter by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="adm-input min-w-48 px-4 py-3 font-body text-sm"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="past_due">Past due</option>
            <option value="ending">Ending this period</option>
            <option value="canceled">Canceled</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </InstrumentPanel>

      {loading ? (
        <div className="text-center py-16 font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
          Loading VIP memberships…
        </div>
      ) : filteredMembers.length === 0 ? (
        <InstrumentPanel className="p-10 text-center">
          <div className="font-heading text-lg mb-2" style={{ color: 'var(--adm-text)' }}>
            {data?.members.length ? 'No members match this filter' : 'No VIP memberships yet'}
          </div>
          <p className="font-body text-sm" style={{ color: 'var(--adm-text-muted)' }}>
            New Stripe checkouts will appear here automatically after the signed webhook completes.
          </p>
        </InstrumentPanel>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredMembers.map((member) => {
            const isExpanded = expanded === member.profileId;
            const canRedeem = member.status === 'active' && !loading;
            return (
              <InstrumentPanel key={member.profileId}>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : member.profileId)}
                  className="w-full text-left p-5 grid grid-cols-12 gap-4 items-center cursor-pointer"
                >
                  <div className="col-span-12 md:col-span-4 flex items-center gap-4 min-w-0">
                    <div
                      className="w-11 h-11 shrink-0 flex items-center justify-center font-heading font-bold"
                      style={{ background: 'var(--adm-bg-elevated)', color: 'var(--adm-primary)' }}
                    >
                      {member.fullName.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-heading text-base truncate" style={{ color: 'var(--adm-text)' }}>
                        {member.fullName}
                      </div>
                      <div className="font-body text-xs truncate" style={{ color: 'var(--adm-text-muted)' }}>
                        {member.email || member.phone || 'No contact information'}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <div className="font-body text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--adm-text-faint)' }}>
                      Member
                    </div>
                    <div className="font-heading text-sm" style={{ color: 'var(--adm-text)' }}>
                      {member.memberNumber}
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <div className="font-body text-xs" style={{ color: member.cancelAtPeriodEnd ? 'var(--adm-warn)' : 'var(--adm-text-muted)' }}>
                      {membershipTiming(member)}
                    </div>
                  </div>
                  <div className="hidden md:flex md:col-span-1 justify-end">
                    <span className="font-heading" style={{ color: 'var(--adm-text-faint)' }}>
                      {isExpanded ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t p-5" style={{ borderColor: 'var(--adm-border-soft)' }}>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          {(Object.keys(BENEFIT_LABELS) as VipBenefitType[]).map((benefitType) => {
                            const balance = member.benefits[benefitType];
                            const actionKey = `${member.profileId}:${benefitType}`;
                            return (
                              <div key={benefitType} className="border p-4" style={{ borderColor: 'var(--adm-border)' }}>
                                <div className="font-body text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--adm-text-muted)' }}>
                                  {BENEFIT_LABELS[benefitType]}
                                </div>
                                <div className="font-heading text-3xl mb-3" style={{ color: 'var(--adm-text)' }}>
                                  {balance.remaining}
                                  <span className="text-sm ml-1" style={{ color: 'var(--adm-text-faint)' }}>
                                    / {balance.total} left
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => recordBenefit(member, benefitType)}
                                  disabled={!canRedeem || balance.remaining === 0 || pendingAction !== null}
                                  className="adm-btn-primary w-full px-3 py-2 font-heading text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  {pendingAction === actionKey ? 'Recording…' : 'Record Use'}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <label className="block">
                          <span className="font-body text-[10px] uppercase tracking-widest block mb-2" style={{ color: 'var(--adm-text-muted)' }}>
                            Optional service note
                          </span>
                          <input
                            value={notes[member.profileId] || ''}
                            onChange={(event) =>
                              setNotes((current) => ({ ...current, [member.profileId]: event.target.value }))
                            }
                            maxLength={500}
                            placeholder="Work order, vehicle, or service detail"
                            className="adm-input w-full px-3 py-2 font-body text-sm"
                          />
                        </label>

                        {!canRedeem && (
                          <p className="font-body text-xs mt-3" style={{ color: 'var(--adm-warn)' }}>
                            Benefits cannot be redeemed unless the Stripe subscription is active.
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="font-heading text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--adm-text-muted)' }}>
                          Current membership-year usage
                        </div>
                        {member.recentUsage.length === 0 ? (
                          <div className="border border-dashed p-6 font-body text-sm" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-text-faint)' }}>
                            No included services recorded this membership year.
                          </div>
                        ) : (
                          <div className="border" style={{ borderColor: 'var(--adm-border)' }}>
                            {member.recentUsage.map((usage, index) => (
                              <div
                                key={usage.id}
                                className={`p-3 flex items-start justify-between gap-3 ${index === member.recentUsage.length - 1 ? '' : 'border-b'}`}
                                style={{ borderColor: 'var(--adm-border-soft)' }}
                              >
                                <div>
                                  <div className="font-body text-sm" style={{ color: 'var(--adm-text)' }}>
                                    {BENEFIT_LABELS[usage.benefitType]}
                                  </div>
                                  <div className="font-body text-xs mt-1" style={{ color: 'var(--adm-text-faint)' }}>
                                    {formatDate(usage.usedAt)}{usage.note ? ` · ${usage.note}` : ''}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => correctUsage(member, usage.id)}
                                  disabled={pendingAction !== null}
                                  className="adm-btn-ghost px-2 py-1 font-heading text-[9px] uppercase tracking-wider cursor-pointer disabled:opacity-30"
                                >
                                  {pendingAction === usage.id ? 'Undoing…' : 'Undo'}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t" style={{ borderColor: 'var(--adm-border-soft)' }}>
                      <div>
                        <div className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Phone</div>
                        <div className="font-body text-sm mt-1" style={{ color: 'var(--adm-text)' }}>{member.phone || '—'}</div>
                      </div>
                      <div>
                        <div className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Period start</div>
                        <div className="font-body text-sm mt-1" style={{ color: 'var(--adm-text)' }}>{formatDate(member.currentPeriodStart)}</div>
                      </div>
                      <div>
                        <div className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Period end</div>
                        <div className="font-body text-sm mt-1" style={{ color: 'var(--adm-text)' }}>{formatDate(member.currentPeriodEnd)}</div>
                      </div>
                      <div>
                        <div className="font-body text-[10px] uppercase tracking-widest" style={{ color: 'var(--adm-text-faint)' }}>Billing</div>
                        <div className="font-body text-sm mt-1" style={{ color: 'var(--adm-text)' }}>
                          {member.cancelAtPeriodEnd ? 'Cancellation scheduled' : member.status === 'active' ? 'Auto-renewing' : 'Not renewing'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </InstrumentPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
