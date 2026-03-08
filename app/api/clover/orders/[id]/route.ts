import { NextRequest, NextResponse } from 'next/server';
import { cloverFetch, isCloverConfigured } from '@/lib/clover/client';
import type { CloverOrder } from '@/types/clover';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: 'Clover API not configured' }, { status: 503 });
  }

  try {
    const { id } = await params;
    const data = await cloverFetch<CloverOrder>(`/orders/${id}`, {
      params: { expand: 'lineItems,customers' },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Clover order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order', details: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: 'Clover API not configured' }, { status: 503 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Only allow updating note and state
    const allowed: Record<string, unknown> = {};
    if (body.note !== undefined) allowed.note = body.note;
    if (body.state !== undefined) allowed.state = body.state;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const data = await cloverFetch<CloverOrder>(`/orders/${id}`, {
      method: 'POST',
      body: allowed,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Clover order update error:', error);
    return NextResponse.json({ error: 'Failed to update order', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isCloverConfigured) {
    return NextResponse.json({ error: 'Clover API not configured' }, { status: 503 });
  }

  try {
    const { id } = await params;
    await cloverFetch(`/orders/${id}`, { method: 'DELETE' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clover order delete error:', error);
    return NextResponse.json({ error: 'Failed to delete order', details: String(error) }, { status: 500 });
  }
}
