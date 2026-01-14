export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  appointment_date: string; // ISO date string
  appointment_time: string; // HH:mm format
  notes?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

