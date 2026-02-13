import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const chargeSchema = z.object({
  token: z.string().min(1, 'Payment token is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1 cent'),
  currency: z.string().default('usd'),
  description: z.string().optional().default(''),
  receipt_email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  // Prefer ecomm private key; fall back to merchant API token
  const token = process.env.CLOVER_ECOMM_PRIVATE_KEY || process.env.CLOVER_API_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'Clover API not configured' },
      { status: 503 }
    );
  }

  // Determine charge environment: CLOVER_CHARGE_ENV overrides, otherwise derive from CLOVER_API_BASE_URL
  const chargeEnv = process.env.CLOVER_CHARGE_ENV || (process.env.CLOVER_API_BASE_URL?.includes('sandbox') ? 'sandbox' : 'production');
  const chargeUrl = chargeEnv === 'sandbox'
    ? 'https://scl-sandbox.dev.clover.com/v1/charges'
    : 'https://scl.clover.com/v1/charges';

  try {
    const body = await request.json();
    const validated = chargeSchema.parse(body);

    // Get client IP for fraud prevention
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const chargeRes = await fetch(chargeUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-forwarded-for': clientIp,
      },
      body: JSON.stringify({
        amount: validated.amount,
        currency: validated.currency,
        source: validated.token,
        description: validated.description,
        receipt_email: validated.receipt_email,
        ecomind: 'ecom',
      }),
    });

    const chargeData = await chargeRes.json();

    if (!chargeRes.ok) {
      console.error('Clover charge error:', chargeData);
      return NextResponse.json(
        {
          error: 'Payment failed',
          details: chargeData.error?.message || chargeData.message || 'Unknown error',
          decline_code: chargeData.error?.decline_code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      charge: {
        id: chargeData.id,
        amount: chargeData.amount,
        currency: chargeData.currency,
        status: chargeData.status,
        paid: chargeData.paid,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Charge error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
