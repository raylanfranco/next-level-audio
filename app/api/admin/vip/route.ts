import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { createServerClient } from '@/lib/supabase/client';
import { formatMemberNumber, VIP_BENEFITS } from '@/lib/vip';
import type {
  AdminVipMember,
  AdminVipResponse,
  VipBenefitType,
  VipMembershipStatus,
} from '@/types/vip';

interface MembershipRow {
  profile_id: string;
  member_number: number;
  status: VipMembershipStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

interface UsageRow {
  id: string;
  profile_id: string;
  benefit_type: VipBenefitType;
  used_at: string;
  note: string | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const supabase = createServerClient();
  const { data: membershipData, error: membershipError } = await supabase
    .from('vip_memberships')
    .select(
      'profile_id, member_number, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at'
    )
    .order('member_number', { ascending: true });

  if (membershipError) {
    console.error('VIP admin membership query failed:', membershipError);
    return NextResponse.json({ error: 'Failed to load VIP memberships' }, { status: 500 });
  }

  const memberships = (membershipData || []) as MembershipRow[];
  const profileIds = memberships.map((membership) => membership.profile_id);

  let profiles: ProfileRow[] = [];
  let usage: UsageRow[] = [];

  if (profileIds.length > 0) {
    const [profileResult, usageResult] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, phone').in('id', profileIds),
      supabase
        .from('vip_benefit_usage')
        .select('id, profile_id, benefit_type, used_at, note')
        .in('profile_id', profileIds)
        .is('voided_at', null)
        .order('used_at', { ascending: false }),
    ]);

    if (profileResult.error || usageResult.error) {
      console.error('VIP admin detail query failed:', profileResult.error || usageResult.error);
      return NextResponse.json({ error: 'Failed to load VIP member details' }, { status: 500 });
    }

    profiles = (profileResult.data || []) as ProfileRow[];
    usage = (usageResult.data || []) as UsageRow[];
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const usageByProfile = new Map<string, UsageRow[]>();
  for (const entry of usage) {
    const entries = usageByProfile.get(entry.profile_id);
    if (entries) entries.push(entry);
    else usageByProfile.set(entry.profile_id, [entry]);
  }
  const now = Date.now();

  const members: AdminVipMember[] = memberships.map((membership) => {
    const profile = profilesById.get(membership.profile_id);
    const periodStart = membership.current_period_start
      ? new Date(membership.current_period_start).getTime()
      : now - 365 * 24 * 60 * 60 * 1000;
    const periodUsage = (usageByProfile.get(membership.profile_id) || []).filter(
      (entry) =>
        entry.profile_id === membership.profile_id &&
        new Date(entry.used_at).getTime() >= periodStart
    );

    const benefitBalance = (benefitType: VipBenefitType) => {
      const total = VIP_BENEFITS[benefitType];
      const used = periodUsage.filter((entry) => entry.benefit_type === benefitType).length;
      return { used, total, remaining: Math.max(total - used, 0) };
    };

    return {
      profileId: membership.profile_id,
      memberNumber: formatMemberNumber(membership.member_number),
      status: membership.status,
      fullName: profile?.full_name || 'Unknown member',
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      currentPeriodStart: membership.current_period_start,
      currentPeriodEnd: membership.current_period_end,
      cancelAtPeriodEnd: membership.cancel_at_period_end ?? false,
      canceledAt: membership.canceled_at,
      benefits: {
        diagnostic: benefitBalance('diagnostic'),
        checkup: benefitBalance('checkup'),
      },
      recentUsage: periodUsage.slice(0, 10).map((entry) => ({
        id: entry.id,
        benefitType: entry.benefit_type,
        usedAt: entry.used_at,
        note: entry.note,
      })),
    };
  });

  const response: AdminVipResponse = {
    members,
    summary: {
      total: members.length,
      active: members.filter((member) => member.status === 'active').length,
      pastDue: members.filter((member) => member.status === 'past_due').length,
      canceled: members.filter((member) => member.status === 'canceled').length,
      ending: members.filter(
        (member) => member.status === 'active' && member.cancelAtPeriodEnd
      ).length,
    },
  };

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const profileId = typeof payload.profileId === 'string' ? payload.profileId.trim() : '';
  const benefitType =
    typeof payload.benefitType === 'string'
      ? (payload.benefitType as VipBenefitType)
      : undefined;
  const note = typeof payload.note === 'string' ? payload.note.trim() || null : null;

  if (!profileId || !UUID_PATTERN.test(profileId)) {
    return NextResponse.json({ error: 'A valid member profile is required' }, { status: 400 });
  }
  if (benefitType !== 'diagnostic' && benefitType !== 'checkup') {
    return NextResponse.json({ error: 'Unknown VIP benefit' }, { status: 400 });
  }
  if (note && note.length > 500) {
    return NextResponse.json({ error: 'Notes must be 500 characters or fewer' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('record_vip_benefit_usage', {
    p_profile_id: profileId,
    p_benefit_type: benefitType,
    p_note: note,
    p_recorded_by: auth.userId,
  });

  if (error) {
    const conflict = /not active|limit reached/i.test(error.message);
    console.error('VIP benefit redemption failed:', error);
    return NextResponse.json(
      { error: conflict ? error.message : 'Failed to record VIP benefit' },
      { status: conflict ? 409 : 500 }
    );
  }

  return NextResponse.json({ usageId: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const usageId = request.nextUrl.searchParams.get('usageId');
  if (!usageId || !UUID_PATTERN.test(usageId)) {
    return NextResponse.json({ error: 'A valid usage record is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('vip_benefit_usage')
    .update({
      voided_at: new Date().toISOString(),
      voided_by: auth.userId,
      void_reason: 'Corrected by admin',
    } as never)
    .eq('id', usageId)
    .is('voided_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('VIP benefit correction failed:', error);
    return NextResponse.json({ error: 'Failed to correct VIP benefit usage' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Usage record not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
