import { NextRequest, NextResponse } from 'next/server';

const BAYREADY_API = process.env.BAYREADY_API_URL || 'https://bayready-production.up.railway.app';
const BAYREADY_MERCHANT_ID = process.env.BAYREADY_MERCHANT_ID || 'cmlh31wyn000068j37couyy08';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    const params = new URLSearchParams({ merchantId: BAYREADY_MERCHANT_ID });
    if (status) params.set('status', status);
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const res = await fetch(`${BAYREADY_API}/bookings?${params}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('BayReady bookings fetch error:', res.status, text);
      return NextResponse.json({ bookings: [] });
    }

    const bayreadyBookings = await res.json();

    // Map BayReady booking shape to NLA admin shape
    const bookings = (Array.isArray(bayreadyBookings) ? bayreadyBookings : []).map((b: {
      id: string;
      startsAt: string;
      status: string;
      notes?: string;
      depositAmountCents?: number;
      depositPaidAt?: string;
      cloverChargeId?: string;
      createdAt: string;
      updatedAt: string;
      service?: { name?: string; priceCents?: number; durationMins?: number };
      customer?: { name?: string; email?: string; phone?: string };
      vehicle?: { year?: number; make?: string; model?: string; trim?: string } | null;
    }) => {
      const startsAt = new Date(b.startsAt);
      return {
        id: b.id,
        customer_name: b.customer?.name || 'Unknown',
        customer_email: b.customer?.email || '',
        customer_phone: b.customer?.phone || '',
        service_type: b.service?.name || 'Unknown Service',
        service_price_cents: b.service?.priceCents,
        service_duration_mins: b.service?.durationMins,
        vehicle_make: b.vehicle?.make,
        vehicle_model: b.vehicle?.model,
        vehicle_year: b.vehicle?.year,
        vehicle_trim: b.vehicle?.trim,
        appointment_date: startsAt.toISOString().split('T')[0],
        appointment_time: startsAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/New_York',
        }),
        notes: b.notes,
        status: b.status.toLowerCase(),
        deposit_amount_cents: b.depositAmountCents,
        deposit_paid_at: b.depositPaidAt,
        clover_charge_id: b.cloverChargeId,
        created_at: b.createdAt,
        updated_at: b.updatedAt,
      };
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings from BayReady:', error);
    return NextResponse.json({ bookings: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BAYREADY_API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId: BAYREADY_MERCHANT_ID,
        ...body,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const booking = await res.json();
    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
