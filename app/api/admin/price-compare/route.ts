import { NextRequest, NextResponse } from 'next/server';
import { searchAllDistributors } from '@/lib/price-compare';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(request: NextRequest) {
  // Defense-in-depth: verify admin role at the route (not just the gate).
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
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
