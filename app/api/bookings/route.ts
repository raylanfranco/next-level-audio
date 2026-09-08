import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/auth/requireAdmin';

import { WHOS_NEXT_API, WHOS_NEXT_MERCHANT_ID, bookingManagementHeaders } from '@/lib/whos-next';
import { mapBooking, type UpstreamBooking } from '@/lib/booking-contract';

// Role-aware: admins see all bookings; a regular authenticated user sees only
// bookings matching THEIR OWN profile email (server-side filtered — the client
// cannot request someone else's bookings).
export async function GET(request: NextRequest) {
  const auth = await getAuthedUser();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    const params = new URLSearchParams({ merchantId: WHOS_NEXT_MERCHANT_ID });
    if (status) params.set('status', status.toUpperCase());
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const res = await fetch(`${WHOS_NEXT_API}/bookings?${params}`, {
      headers: bookingManagementHeaders(),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Who's Next bookings fetch error:", res.status, text);
      return NextResponse.json({ error: 'Appointments are temporarily unavailable' }, { status: 502 });
    }

    const upstreamBookings = await res.json();

    if (!Array.isArray(upstreamBookings)) throw new Error('Invalid booking response');
    const bookings = (upstreamBookings as UpstreamBooking[]).map(mapBooking);

    // Non-admins only see their own bookings (by profile email).
    const scoped = auth.isAdmin
      ? bookings
      : bookings.filter(
          (b) => auth.email && b.customer_email?.toLowerCase() === auth.email.toLowerCase()
        );

    return NextResponse.json({ bookings: scoped });
  } catch (error) {
    console.error("Error fetching bookings from Who's Next:", error);
    return NextResponse.json({ error: 'Appointments are temporarily unavailable' }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${WHOS_NEXT_API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        merchantId: WHOS_NEXT_MERCHANT_ID,
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
