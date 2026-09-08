import type { Booking, BookingStatus } from '../types/booking';

export interface UpstreamBooking {
  id: string; startsAt: string; endsAt: string; status: string;
  allowedStatuses?: string[]; notes?: string; depositAmountCents?: number;
  depositPaidAt?: string; cloverChargeId?: string; createdAt: string; updatedAt: string;
  service?: { name?: string; priceCents?: number; durationMins?: number };
  customer?: { name?: string; email?: string; phone?: string };
  vehicle?: { year?: number; make?: string; model?: string; trim?: string } | null;
}

export function mapBooking(b: UpstreamBooking): Booking {
  const startsAt = new Date(b.startsAt);
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(new Date(b.endsAt).getTime())) throw new Error('Invalid booking dates');
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(startsAt);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return {
    id: b.id, starts_at: b.startsAt, ends_at: b.endsAt,
    allowed_statuses: (b.allowedStatuses ?? []).map(s => s.toLowerCase() as BookingStatus),
    customer_name: b.customer?.name || 'Unknown', customer_email: b.customer?.email || '', customer_phone: b.customer?.phone || '',
    service_type: b.service?.name || 'Unknown Service', service_price_cents: b.service?.priceCents, service_duration_mins: b.service?.durationMins,
    vehicle_make: b.vehicle?.make, vehicle_model: b.vehicle?.model, vehicle_year: b.vehicle?.year, vehicle_trim: b.vehicle?.trim,
    appointment_date: `${part('year')}-${part('month')}-${part('day')}`,
    appointment_time: startsAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/New_York' }),
    notes: b.notes, status: b.status.toLowerCase() as BookingStatus,
    deposit_amount_cents: b.depositAmountCents, deposit_paid_at: b.depositPaidAt, clover_charge_id: b.cloverChargeId,
    created_at: b.createdAt, updated_at: b.updatedAt,
  };
}
