import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendNewsletterSignup } from '@/lib/email/resend';

const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    const result = await sendNewsletterSignup(email);
    if (!result.success) {
      console.error('Newsletter signup email failed:', result.error);
    }

    return NextResponse.json(
      { success: true, message: 'Subscribed successfully.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
