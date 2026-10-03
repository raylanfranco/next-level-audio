export type VipMembershipStatus = 'inactive' | 'active' | 'past_due' | 'canceled';

export type VipBenefitType = 'diagnostic' | 'checkup';

export interface VipBenefitUsageEntry {
  id: string;
  benefitType: VipBenefitType;
  usedAt: string;
  note: string | null;
}

export interface VipBenefitBalance {
  used: number;
  total: number;
  remaining: number;
}

export interface AdminVipMember {
  profileId: string;
  memberNumber: string;
  status: VipMembershipStatus;
  fullName: string;
  email: string | null;
  phone: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  benefits: Record<VipBenefitType, VipBenefitBalance>;
  recentUsage: VipBenefitUsageEntry[];
}

export interface AdminVipSummary {
  total: number;
  active: number;
  pastDue: number;
  canceled: number;
  ending: number;
}

export interface AdminVipResponse {
  members: AdminVipMember[];
  summary: AdminVipSummary;
}
