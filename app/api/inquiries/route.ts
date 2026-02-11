import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/client';
import { sendInquiryNotification } from '@/lib/email/resend';

const inquirySchema = z.object({
  product_id: z.string().min(1),
  product_name: z.string().min(1),
  product_price: z.number().int().min(0),
  request_type: z.enum(['inquiry', 'backorder']),
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().min(10, 'Phone number is required'),
  message: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = inquirySchema.parse(body);

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        product_id: validated.product_id,
        product_name: validated.product_name,
        product_price: validated.product_price,
        request_type: validated.request_type,
        customer_name: validated.customer_name,
        customer_email: validated.customer_email,
        customer_phone: validated.customer_phone,
        message: validated.message,
        status: 'pending',
      }] as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit request', details: error.message },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking)
    sendInquiryNotification({
      customerName: validated.customer_name,
      customerEmail: validated.customer_email,
      customerPhone: validated.customer_phone,
      productName: validated.product_name,
      productPrice: `$${(validated.product_price / 100).toFixed(2)}`,
      requestType: validated.request_type,
      message: validated.message || '',
    }).catch((err) => console.error('Email send failed:', err));

    return NextResponse.json(
      {
        success: true,
        inquiry: data,
        message: validated.request_type === 'inquiry'
          ? 'Your inquiry has been submitted. We will contact you soon!'
          : 'Your backorder request has been submitted. We will check availability and contact you.',
      },
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

    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('inquiries')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inquiries', inquiries: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      inquiries: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', inquiries: [] },
      { status: 500 }
    );
  }
}
