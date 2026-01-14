import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
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
    
    // Check if appointment slot is available
    const supabase = createServerClient();
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('appointment_date', validated.appointment_date)
      .eq('appointment_time', validated.appointment_time)
      .in('status', ['pending', 'confirmed'])
      .single();
    
    if (existingBookings) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }
    
    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
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
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }
    
    // TODO: Send confirmation email
    // TODO: Send notification to admin
    
    return NextResponse.json(
      { 
        success: true, 
        booking,
        message: 'Booking request submitted successfully. We will confirm your appointment soon.' 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    let query = supabase
      .from('bookings')
      .select('*')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (date) {
      query = query.eq('appointment_date', date);
    }
    
    const { data: bookings, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

