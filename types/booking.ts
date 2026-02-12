export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  service_price_cents?: number;
  service_duration_mins?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_trim?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status: BookingStatus;
  deposit_amount_cents?: number;
  deposit_paid_at?: string;
  clover_charge_id?: string;
  created_at: string;
  updated_at: string;
}
