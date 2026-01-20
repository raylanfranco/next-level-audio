import { NextRequest, NextResponse } from 'next/server';
import { BookingFormData } from '@/types/booking';
import { z } from 'zod';

const bookingSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email address'),
  customer_phone: z.string().min(10, 'Phone number is required'),
  service_type: z.string().min(1, 'Service type is required'),
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: BookingFormData = await request.json();

    // Validate input
    const validated = bookingSchema.parse(body);

    // For demo purposes, return success without database operations
    // In production, this would check availability and create bookings
    const mockBooking = {
      id: 'demo-booking-' + Date.now(),
      customer_name: validated.customer_name,
      customer_email: validated.customer_email,
      customer_phone: validated.customer_phone,
      service_type: validated.service_type,
      vehicle_make: validated.vehicle_make,
      vehicle_model: validated.vehicle_model,
      vehicle_year: validated.vehicle_year,
      appointment_date: validated.appointment_date,
      appointment_time: validated.appointment_time,
      notes: validated.notes,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // TODO: Send confirmation email
    // TODO: Send notification to admin

    return NextResponse.json(
      {
        success: true,
        booking: mockBooking,
        message: 'Booking request submitted successfully. We will confirm your appointment soon.'
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Mock bookings data for prototype
  const mockBookings = [
    {
      id: 'booking-1',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '555-0123',
      service_type: 'car-audio',
      vehicle_make: 'Toyota',
      vehicle_model: 'Camry',
      vehicle_year: 2020,
      appointment_date: '2024-01-25',
      appointment_time: '10:00',
      notes: 'Looking forward to the upgrade',
      status: 'confirmed',
      created_at: '2024-01-20T10:00:00Z',
      updated_at: '2024-01-20T10:00:00Z',
    },
    {
      id: 'booking-2',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      customer_phone: '555-0456',
      service_type: 'window-tinting',
      appointment_date: '2024-01-26',
      appointment_time: '14:00',
      notes: '',
      status: 'pending',
      created_at: '2024-01-21T14:30:00Z',
      updated_at: '2024-01-21T14:30:00Z',
    },
  ];

  return NextResponse.json({ bookings: mockBookings });
}

