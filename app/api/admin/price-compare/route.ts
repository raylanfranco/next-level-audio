import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { searchAllDistributors } from '@/lib/price-compare';

export async function POST(request: NextRequest) {
  try {
    // Auth check — admin panel is already behind middleware auth,
    // so just verify the user is logged in
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query
    const body = await request.json();
    const { query } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Run search across all distributors
    const results = await searchAllDistributors(query.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error('Price compare error:', error);
    return NextResponse.json(
      {
        query: '',
        results: [],
        errors: [{ distributor: 'System', error: error instanceof Error ? error.message : String(error) }],
        searchedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
