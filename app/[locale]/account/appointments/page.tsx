'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';

interface Appointment {
  id: string;
  service_name: string;
  starts_at: string;
  ends_at: string;
  status: string;
  vehicle_info: string | null;
  notes: string | null;
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

function statusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'text-green-400 border-green-400/30 bg-green-400/5';
    case 'pending':
      return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5';
    case 'completed':
      return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
    case 'cancelled':
      return 'text-red-400 border-red-400/30 bg-red-400/5';
    default:
      return 'text-white/50 border-white/20 bg-white/5';
  }
}

export default function AccountAppointmentsPage() {
  const t = useTranslations('account');
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.email) return;

    // Fetch appointments from BayReady via our proxy
    fetch(`/api/bookings?email=${encodeURIComponent(profile.email)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.bookings) {
          setAppointments(
            data.bookings.map((b: Record<string, unknown>) => ({
              id: b.id,
              service_name: (b.service as Record<string, unknown>)?.name || b.serviceName || 'Service',
              starts_at: b.startsAt || b.starts_at,
              ends_at: b.endsAt || b.ends_at,
              status: b.status || 'pending',
              vehicle_info: b.vehicleInfo || b.vehicle_info || null,
              notes: b.notes || null,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profile?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block w-8 h-8 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin" />
      </div>
    );
  }

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.starts_at) >= now && a.status !== 'cancelled');
  const past = appointments.filter((a) => new Date(a.starts_at) < now || a.status === 'cancelled');

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white mb-6 neon-glow"
        style={{ fontFamily: 'var(--font-oxanium)' }}
      >
        {t('appointmentsTitle')}
      </h1>

      {appointments.length === 0 ? (
        <div className="border-2 border-[#E01020]/20 p-12 text-center">
          <p className="text-white/40 font-mono text-sm mb-2">{t('noAppointmentsFound')}</p>
          <p className="text-white/30 font-mono text-xs">
            {t('bookServiceDesc')}
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2
                className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 font-mono"
              >
                {t('upcoming')}
              </h2>
              <div className="space-y-3">
                {upcoming.map((apt) => {
                  const { date, time } = formatDateTime(apt.starts_at);
                  return (
                    <div key={apt.id} className="border-2 border-[#E01020]/30 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p
                            className="text-white font-semibold text-sm"
                            style={{ fontFamily: 'var(--font-oxanium)' }}
                          >
                            {apt.service_name.toUpperCase()}
                          </p>
                          <p className="text-white/50 font-mono text-xs mt-1">
                            {date} at {time}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${statusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      {apt.vehicle_info && (
                        <p className="text-white/40 font-mono text-xs">{apt.vehicle_info}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2
                className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3 font-mono"
              >
                {t('past')}
              </h2>
              <div className="space-y-3">
                {past.map((apt) => {
                  const { date, time } = formatDateTime(apt.starts_at);
                  return (
                    <div key={apt.id} className="border-2 border-[#E01020]/10 p-4 opacity-60">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p
                            className="text-white font-semibold text-sm"
                            style={{ fontFamily: 'var(--font-oxanium)' }}
                          >
                            {apt.service_name.toUpperCase()}
                          </p>
                          <p className="text-white/50 font-mono text-xs mt-1">
                            {date} at {time}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${statusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
