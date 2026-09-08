import test from 'node:test';
import assert from 'node:assert/strict';
import { mapBooking } from '../lib/booking-contract.ts';

test('appointments retain usable timestamps, service and backend actions', () => {
  const b = mapBooking({ id: 'test', startsAt: '2026-09-10T14:00:00Z', endsAt: '2026-09-10T15:00:00Z', status: 'CONFIRMED', allowedStatuses: ['CHECKED_IN', 'CANCELLED'], service: { name: 'Tint' }, createdAt: '', updatedAt: '' });
  assert.equal(b.service_type, 'Tint');
  assert.equal(b.appointment_time, '10:00');
  assert.ok(Number.isFinite(new Date(b.starts_at).getTime()));
  assert.deepEqual(b.allowed_statuses, ['checked_in', 'cancelled']);
  assert.ok(!b.allowed_statuses.includes('completed'));
});
test('date and time use the same shop timezone across midnight and DST', () => {
  for (const [startsAt, date, time] of [['2026-09-10T01:00:00Z', '2026-09-09', '21:00'], ['2026-01-10T15:00:00Z', '2026-01-10', '10:00']]) {
    const b = mapBooking({ id: 'test', startsAt, endsAt: startsAt, status: 'PENDING', createdAt: '', updatedAt: '' });
    assert.equal(b.appointment_date, date); assert.equal(b.appointment_time, time);
  }
});
test('invalid dates fail instead of displaying a false empty schedule', () => {
  assert.throws(() => mapBooking({ startsAt: 'invalid', endsAt: 'invalid' }), /Invalid booking dates/);
});
