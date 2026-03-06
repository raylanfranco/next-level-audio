import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { awardPoints, calculatePurchasePoints, processReferralBonus } from '@/lib/rewards';

const chargeSchema = z.object({
  token: z.string().min(1, 'Payment token is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1 cent'),
  currency: z.string().default('usd'),
  description: z.string().optional().default(''),
  receipt_email: z.string().email().optional(),
  orderData: z.object({
    items: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })),
    subtotal_cents: z.number(),
    discount_cents: z.number(),
    total_cents: z.number(),
    coupon_id: z.string().nullable(),
    customer_name: z.string(),
    customer_email: z.string(),
  }).optional(),
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

    // After successful charge: save order, award points, handle coupon usage
    let pointsEarned = 0;

    if (validated.orderData) {
      const od = validated.orderData;

      try {
        // Check if user is authenticated
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        const adminClient = createServerClient();

        // Save order to Supabase
        const { data: order } = await adminClient.from('orders').insert({
          profile_id: user?.id || null,
          clover_charge_id: chargeData.id,
          items: od.items,
          subtotal_cents: od.subtotal_cents,
          discount_cents: od.discount_cents,
          total_cents: od.total_cents,
          coupon_id: od.coupon_id || null,
          customer_name: od.customer_name,
          customer_email: od.customer_email,
        }).select('id').single();

        // Increment coupon used_count if a coupon was applied
        if (od.coupon_id) {
          const { data: coupon } = await adminClient
            .from('coupons')
            .select('used_count')
            .eq('id', od.coupon_id)
            .single();

          if (coupon) {
            await adminClient
              .from('coupons')
              .update({ used_count: (coupon.used_count || 0) + 1 })
              .eq('id', od.coupon_id);
          }
        }

        // Award points to authenticated users
        if (user) {
          pointsEarned = calculatePurchasePoints(od.total_cents);
          if (pointsEarned > 0) {
            await awardPoints(user.id, pointsEarned, 'purchase', order?.id);
          }

          // Process referral bonus if applicable
          if (order?.id) {
            await processReferralBonus(user.id, order.id, od.total_cents).catch(() => {});
          }
        }
      } catch (err) {
        // Non-critical: charge already succeeded, log the error
        console.error('Post-charge processing error:', err);
      }
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
      pointsEarned,
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
