import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/client';

const jobListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1).default('Stroudsburg, PA'),
  type: z.enum(['full-time', 'part-time', 'contract']),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().optional().default(''),
  salary_range: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = jobListingSchema.parse(body);

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('job_listings')
      .insert([{ ...validated, is_active: true }] as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create job listing', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, job: data },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('job_listings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job listings', jobs: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', jobs: [] },
      { status: 500 }
    );
  }
}
