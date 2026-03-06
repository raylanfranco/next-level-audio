import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getPointsBalance, getPointsHistory } from '@/lib/rewards';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [balance, history] = await Promise.all([
    getPointsBalance(user.id),
    getPointsHistory(user.id),
  ]);

  return NextResponse.json({ balance, history });
}
