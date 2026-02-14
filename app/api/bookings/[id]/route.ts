import { NextRequest, NextResponse } from 'next/server';

const BAYREADY_API = process.env.BAYREADY_API_URL || 'https://bayready-production.up.railway.app';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const status = body.status?.toUpperCase();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const res = await fetch(`${BAYREADY_API}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('BayReady status update error:', res.status, text);
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: res.status });
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
  const { id } = await params;

  try {
    const res = await fetch(`${BAYREADY_API}/bookings/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('BayReady delete error:', res.status, text);
      return NextResponse.json({ error: 'Failed to delete booking' }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
