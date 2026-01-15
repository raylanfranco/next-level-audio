import { NextRequest, NextResponse } from 'next/server';

export async function PATCH() {
  return NextResponse.json(
    { error: 'Booking management not yet implemented' },
    { status: 501 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Booking management not yet implemented' },
    { status: 501 }
  );
}

