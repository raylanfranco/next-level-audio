import { createServerClient } from '@/lib/supabase/client';

function getSupabase() {
  return createServerClient();
}

/**
 * Award points to a user.
 * @param profileId - The user's profile ID
 * @param points - Number of points (positive = earn, negative = spend)
 * @param reason - Reason for the transaction (purchase, referral, redemption, signup)
 * @param referenceId - Optional reference (order ID, referral ID, etc.)
 */
export async function awardPoints(
  profileId: string,
  points: number,
  reason: string,
  referenceId?: string
) {
  const supabase = getSupabase();
  const { error } = await supabase.from('reward_points').insert({
    profile_id: profileId,
    points,
    reason,
    reference_id: referenceId || null,
  });

  if (error) {
    console.error('Failed to award points:', error);
    throw error;
  }
}

/**
 * Get the total points balance for a user.
 */
export async function getPointsBalance(profileId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reward_points')
    .select('points')
    .eq('profile_id', profileId);

  if (error) {
    console.error('Failed to get points balance:', error);
    return 0;
  }

  return (data || []).reduce((sum, row) => sum + row.points, 0);
}

/**
 * Get points history for a user.
 */
export async function getPointsHistory(profileId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('reward_points')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get points history:', error);
    return [];
  }

  return data || [];
}

/**
 * Process a referral bonus.
 * Awards 100 points to the referrer when the referred user makes their first $25+ order.
 */
export async function processReferralBonus(
  referredUserId: string,
  orderId: string,
  orderTotalCents: number
) {
  // Minimum order to qualify for referral bonus
  if (orderTotalCents < 2500) return;

  const supabase = getSupabase();

  // Check if this user was referred by someone
  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', referredUserId)
    .single();

  if (!profile?.referred_by) return;

  // Check if bonus was already awarded for this referral
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id, bonus_awarded')
    .eq('referred_id', referredUserId)
    .single();

  if (!existingReferral || existingReferral.bonus_awarded) return;

  // Award bonus points to the referrer
  await awardPoints(profile.referred_by, 100, 'referral', existingReferral.id);

  // Mark the referral as bonus awarded
  await supabase
    .from('referrals')
    .update({ bonus_awarded: true, order_id: orderId })
    .eq('id', existingReferral.id);
}

/**
 * Calculate points to award for a purchase (1 point per $1).
 */
export function calculatePurchasePoints(totalCents: number): number {
  return Math.floor(totalCents / 100);
}
