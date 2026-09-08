export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'waiting_on_parts' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

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
  starts_at: string;
  ends_at: string;
  allowed_statuses: BookingStatus[];
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
