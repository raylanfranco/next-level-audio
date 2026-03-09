import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { searchAllDistributors } from '@/lib/price-compare';

export const maxDuration = 60; // Allow up to 60s on Vercel Pro

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Admin role check
  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Parse query
  const body = await request.json();
  const { query } = body;

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  // Run search across all distributors
  try {
    const results = await searchAllDistributors(query.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error('Price compare error:', error);
    return NextResponse.json(
      { query: query.trim(), results: [], errors: [{ distributor: 'System', error: String(error) }], searchedAt: new Date().toISOString() },
      { status: 200 } // Return 200 with empty results so UI still works
    );
  }
}
