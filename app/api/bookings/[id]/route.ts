import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Who's Next backend (formerly BayReady). BAYREADY_API_URL is a legacy
// fallback — remove once Vercel is switched to WHOS_NEXT_API_URL.
const WHOS_NEXT_API =
  process.env.WHOS_NEXT_API_URL || process.env.BAYREADY_API_URL || 'https://whos-next-production.up.railway.app';

// Admin only — changing booking status / deleting bookings.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const body = await request.json();
    const status = body.status?.toUpperCase();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const res = await fetch(`${WHOS_NEXT_API}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Who's Next status update error:", res.status, text);
      // Surface the backend's message (e.g. invalid transition, slot conflict)
      let message = 'Failed to update booking status';
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed?.message === 'string') message = parsed.message;
      } catch { /* non-JSON body — keep generic message */ }
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const updated = await res.json();
    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const res = await fetch(`${WHOS_NEXT_API}/bookings/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Who's Next delete error:", res.status, text);
      return NextResponse.json({ error: 'Failed to delete booking' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
