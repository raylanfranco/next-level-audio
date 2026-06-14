'use client';

import Link from 'next/link';
import { useAdminData } from './_context/AdminDataProvider';
import { InstrumentPanel, PanelHeader } from './_components/InstrumentPanel';
import { StatCard } from './_components/StatCard';
import { formatCents } from './_lib/format';
import { serviceNames } from './_lib/constants';
import { nextCohort } from './_lib/classes-data';

export default function OverviewPage() {
  const {
    inventory,
    inventoryCount,
    payments,
    customers,
    bookings,
    pendingInquiries,
    pendingApplications,
    loading,
  } = useAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="font-heading text-lg mb-2" style={{ color: 'var(--adm-primary)' }}>Loading dashboard…</div>
          <div className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Connecting to Clover POS</div>
        </div>
      </div>
    );
  }

  // Derived metrics from live data
  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter((b) => b.appointment_date === today);
  const weekRevenueCents = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Low-stock items (stockCount present and <= 5)
  const lowStock = inventory
    .filter((i) => typeof i.stockCount === 'number' && i.stockCount <= 5)
    .sort((a, b) => (a.stockCount ?? 0) - (b.stockCount ?? 0))
    .slice(0, 6);

  const cohort = nextCohort();
  const seatsFilled = cohort ? cohort.students.length : 0;
  const seatsTotal = cohort ? cohort.totalSeats : 0;

  return (
    <div className="relative">
      {/* faint grid backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <StatCard label="Today's Bookings" value={todaysBookings.length} />
        <StatCard
          label="Week Revenue"
          value={
            <span className="flex items-baseline">
              <span className="text-2xl mr-1" style={{ color: 'var(--adm-text-faint)' }}>$</span>
              {(weekRevenueCents / 100000).toFixed(1)}
              <span className="text-2xl ml-1" style={{ color: 'var(--adm-text-muted)' }}>K</span>
            </span>
          }
        />
        <StatCard
          label="Class Seats"
          value={
            <span className="flex items-baseline">
              {seatsFilled}
              <span className="text-3xl" style={{ color: 'var(--adm-text-faint)' }}>/{seatsTotal}</span>
            </span>
          }
        />
        <StatCard label="Inventory Items" value={inventoryCount || inventory.length} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <StatCard label="Customers" value={customers.length} />
        <StatCard label="Recent Payments" value={payments.length} />
        <StatCard label="Pending Requests" value={pendingInquiries} accent={pendingInquiries > 0} />
        <StatCard label="Pending Applications" value={pendingApplications} accent={pendingApplications > 0} />
      </div>

      {/* Two-column: schedule + (cohort & low stock) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Today's Schedule */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <InstrumentPanel className="flex-1 flex flex-col">
            <PanelHeader
              title="Today's Schedule"
              right={<span className="font-heading text-xs" style={{ color: 'var(--adm-text-muted)' }}>{today}</span>}
            />
            <div
              className="grid grid-cols-12 px-6 py-2 border-b font-body text-[10px] uppercase tracking-widest"
              style={{ borderColor: 'var(--adm-border-soft)', background: 'var(--adm-bg)', color: 'var(--adm-text-faint)' }}
            >
              <div className="col-span-2">Time</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-4">Vehicle</div>
              <div className="col-span-3">Service</div>
            </div>
            <div className="flex flex-col pb-2">
              {todaysBookings.length === 0 ? (
                <div className="px-6 py-8 text-sm" style={{ color: 'var(--adm-text-muted)' }}>No bookings scheduled today.</div>
              ) : (
                todaysBookings.map((b) => (
                  <div key={b.id} className="grid grid-cols-12 px-6 py-4 data-row items-center">
                    <div className="col-span-2 font-heading text-sm" style={{ color: 'var(--adm-primary)' }}>{b.appointment_time}</div>
                    <div className="col-span-3 font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{b.customer_name}</div>
                    <div className="col-span-4 font-body text-xs" style={{ color: 'var(--adm-text-muted)' }}>
                      {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                    </div>
                    <div className="col-span-3 font-body text-xs uppercase tracking-wider border px-2 py-1 inline-block w-max" style={{ borderColor: 'var(--adm-border)', color: 'var(--adm-text-muted)' }}>
                      {serviceNames[b.service_type] || b.service_type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </InstrumentPanel>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Next class cohort */}
          <InstrumentPanel className="flex flex-col">
            <PanelHeader
              small
              title="Next Class Cohort"
              right={
                cohort ? (
                  <span className="font-heading text-xs px-2 py-1 border" style={{ background: 'var(--adm-bg-elevated)', color: 'var(--adm-text-muted)', borderColor: 'var(--adm-border)' }}>
                    STARTS {cohort.startDate}
                  </span>
                ) : undefined
              }
            />
            <div className="p-5">
              {cohort ? (
                <>
                  <div className="flex justify-between items-end mb-4">
                    <div className="font-body text-xs uppercase tracking-widest" style={{ color: 'var(--adm-text-muted)' }}>{cohort.title}</div>
                    <div className="font-heading text-lg" style={{ color: 'var(--adm-text)' }}>
                      {seatsFilled}<span style={{ color: 'var(--adm-text-faint)' }}>/{seatsTotal} SEATS</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: seatsTotal }).map((_, i) => {
                      const filled = i < seatsFilled;
                      return (
                        <div
                          key={i}
                          className="aspect-square flex items-center justify-center border"
                          style={
                            filled
                              ? { borderColor: 'var(--adm-primary)', background: 'rgba(224,16,32,0.1)' }
                              : { borderColor: 'var(--adm-border)', borderStyle: 'dashed' }
                          }
                        >
                          {filled ? (
                            <svg className="w-4 h-4" fill="none" stroke="var(--adm-primary)" viewBox="0 0 24 24"><path strokeLinecap="square" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          ) : (
                            <span className="font-heading text-xs" style={{ color: 'var(--adm-text-faint)' }}>+</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Link href="/admin/classes" className="adm-btn-ghost mt-4 inline-block text-[10px] uppercase tracking-widest px-3 py-2 font-heading">
                    Manage Classes →
                  </Link>
                </>
              ) : (
                <div className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>No upcoming cohorts.</div>
              )}
            </div>
          </InstrumentPanel>

          {/* Low stock alerts */}
          <InstrumentPanel className="flex flex-col flex-1">
            <PanelHeader
              small
              title="Low Stock Alerts"
              right={
                <svg className="w-4 h-4" fill="none" stroke="var(--adm-primary)" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="square" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <div className="flex flex-col p-2">
              {lowStock.length === 0 ? (
                <div className="px-3 py-6 text-sm" style={{ color: 'var(--adm-text-muted)' }}>All tracked items in stock.</div>
              ) : (
                lowStock.map((item, idx) => {
                  const qty = item.stockCount ?? 0;
                  const critical = qty === 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center px-3 py-3 ${idx === lowStock.length - 1 ? '' : 'border-b'}`}
                      style={{ borderColor: 'var(--adm-border-soft)' }}
                    >
                      <div className="flex flex-col">
                        <span className="font-body text-sm font-medium" style={{ color: 'var(--adm-text)' }}>{item.name}</span>
                        <span className="font-body text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--adm-text-faint)' }}>{formatCents(item.price)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-heading text-sm font-bold" style={{ color: critical ? 'var(--adm-primary)' : 'var(--adm-warn)' }}>{qty} left</span>
                        <span
                          className="text-[9px] font-heading mt-1 uppercase px-1"
                          style={critical
                            ? { background: 'var(--adm-primary)', color: 'var(--adm-on-primary)' }
                            : { color: 'var(--adm-warn)', border: '1px solid var(--adm-warn)' }}
                        >
                          {critical ? 'Critical' : 'Low'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </InstrumentPanel>
        </div>
      </div>
    </div>
  );
}
