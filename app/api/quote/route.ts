import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/client';
import { sendInquiryNotification } from '@/lib/email/resend';

const quoteSchema = z.object({
  service: z.string().min(1, 'Service is required'),
  vehicleYear: z.string().optional().default(''),
  vehicleMake: z.string().optional().default(''),
  vehicleModel: z.string().optional().default(''),
  vehicleNotes: z.string().optional().default(''),
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);

    const vehicleParts = [validated.vehicleYear, validated.vehicleMake, validated.vehicleModel]
      .filter(Boolean);
    const vehicleStr = vehicleParts.length > 0 ? vehicleParts.join(' ') : 'Not specified';

    const message = [
      `Quote request for: ${validated.service}`,
      `Vehicle: ${vehicleStr}`,
      validated.vehicleNotes ? `Notes: ${validated.vehicleNotes}` : '',
    ].filter(Boolean).join('\n');

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        product_id: 'quote-request',
        product_name: validated.service,
        product_price: 0,
        request_type: 'inquiry',
        customer_name: validated.customerName,
        customer_email: validated.customerEmail,
        customer_phone: validated.customerPhone,
        message,
        status: 'pending',
      }] as never)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit quote request' },
        { status: 500 },
      );
    }

    // Send email notification (non-blocking)
    sendInquiryNotification({
      customerName: validated.customerName,
      customerEmail: validated.customerEmail,
      customerPhone: validated.customerPhone,
      productName: `Quote: ${validated.service}`,
      productPrice: 'N/A',
      requestType: 'inquiry',
      message,
    }).catch((err) => console.error('Email send failed:', err));

    return NextResponse.json(
      { success: true, inquiry: data },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
