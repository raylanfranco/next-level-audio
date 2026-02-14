'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Booking, BookingStatus } from '@/types/booking';
import type {
  CloverItem,
  CloverOrder,
  CloverCustomer,
  CloverPayment,
  CloverCategory,
} from '@/types/clover';
import type { Inquiry, InquiryStatus } from '@/types/inquiry';
import type { JobListing, CareerApplication, ApplicationStatus, JobListingFormData } from '@/types/career';
import { AdminThemeProvider, useAdminTheme } from './AdminThemeProvider';

const statusColors: Record<string, { dark: string; light: string }> = {
  pending: {
    dark: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    light: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  confirmed: {
    dark: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  in_progress: {
    dark: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    light: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  },
  completed: {
    dark: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    light: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  cancelled: {
    dark: 'text-red-400 bg-red-400/10 border-red-400/30',
    light: 'text-red-600 bg-red-50 border-red-200',
  },
  no_show: {
    dark: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
    light: 'text-slate-600 bg-slate-50 border-slate-200',
  },
  reviewed: {
    dark: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    light: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  interviewed: {
    dark: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    light: 'text-violet-600 bg-violet-50 border-violet-200',
  },
  hired: {
    dark: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    light: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  rejected: {
    dark: 'text-red-400 bg-red-400/10 border-red-400/30',
    light: 'text-red-600 bg-red-50 border-red-200',
  },
};

const serviceNames: Record<string, string> = {
  'window-tinting': 'Window Tinting',
  'car-audio': 'Car Audio',
  'remote-start': 'Remote Start',
  'security-systems': 'Security Systems',
  'lighting': 'Custom Lighting',
  'accessories': 'Auto Accessories',
};

type NavItem = 'overview' | 'inventory' | 'orders' | 'payments' | 'customers' | 'bookings' | 'requests' | 'jobs' | 'applications';

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  return (
    <AdminThemeProvider>
      <AdminDashboard />
    </AdminThemeProvider>
  );
}

function AdminDashboard() {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const [activeNav, setActiveNav] = useState<NavItem>('overview');
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState<CloverItem[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [orders, setOrders] = useState<CloverOrder[]>([]);
  const [payments, setPayments] = useState<CloverPayment[]>([]);
  const [customers, setCustomers] = useState<CloverCustomer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);

  // Job form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [jobFormData, setJobFormData] = useState<JobListingFormData>({
    title: '', department: '', location: 'Stroudsburg, PA',
    type: 'full-time', description: '', requirements: '', salary_range: '',
  });

  const [inventoryOffset, setInventoryOffset] = useState(0);
  const [inventorySearch, setInventorySearch] = useState('');
  const [ordersOffset, setOrdersOffset] = useState(0);
  const [paymentsOffset, setPaymentsOffset] = useState(0);
  const [customersOffset, setCustomersOffset] = useState(0);

  const PAGE_SIZE = 25;

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, catRes, ordRes, payRes, custRes, bookRes, inqRes, jobsRes, appsRes] = await Promise.allSettled([
        fetch(`/api/clover/inventory?limit=${PAGE_SIZE}&offset=0`),
        fetch('/api/clover/categories'),
        fetch('/api/clover/orders?limit=10'),
        fetch('/api/clover/payments?limit=10'),
        fetch('/api/clover/customers?limit=100'),
        fetch('/api/bookings'),
        fetch('/api/inquiries'),
        fetch('/api/careers/jobs?active=false'),
        fetch('/api/careers/applications'),
      ]);

      if (invRes.status === 'fulfilled' && invRes.value.ok) {
        const d = await invRes.value.json();
        setInventory(d.items || []);
        setInventoryCount(d.count || 0);
      }
      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const d = await catRes.value.json();
        setCategories(d.categories || []);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value.ok) {
        const d = await ordRes.value.json();
        setOrders(d.orders || []);
      }
      if (payRes.status === 'fulfilled' && payRes.value.ok) {
        const d = await payRes.value.json();
        setPayments(d.payments || []);
      }
      if (custRes.status === 'fulfilled' && custRes.value.ok) {
        const d = await custRes.value.json();
        setCustomers(d.customers || []);
      }
      if (bookRes.status === 'fulfilled' && bookRes.value.ok) {
        const d = await bookRes.value.json();
        setBookings(d.bookings || []);
      }
      if (inqRes.status === 'fulfilled' && inqRes.value.ok) {
        const d = await inqRes.value.json();
        setInquiries(d.inquiries || []);
      }
      if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
        const d = await jobsRes.value.json();
        setJobListings(d.jobs || []);
      }
      if (appsRes.status === 'fulfilled' && appsRes.value.ok) {
        const d = await appsRes.value.json();
        setApplications(d.applications || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const fetchInventoryPage = async (offset: number, search?: string) => {
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (search) params.set('search', search);
      const res = await fetch(`/api/clover/inventory?${params}`);
      if (res.ok) {
        const d = await res.json();
        setInventory(d.items || []);
        setInventoryCount(d.count || 0);
        setInventoryOffset(offset);
      }
    } catch (error) {
      console.error('Error fetching inventory page:', error);
    }
  };

  const fetchOrdersPage = async (offset: number) => {
    try {
      const res = await fetch(`/api/clover/orders?limit=${PAGE_SIZE}&offset=${offset}`);
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
        setOrdersOffset(offset);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPaymentsPage = async (offset: number) => {
    try {
      const res = await fetch(`/api/clover/payments?limit=${PAGE_SIZE}&offset=${offset}`);
      if (res.ok) {
        const d = await res.json();
        setPayments(d.payments || []);
        setPaymentsOffset(offset);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchCustomersPage = async (offset: number) => {
    try {
      const res = await fetch(`/api/clover/customers?limit=${PAGE_SIZE}&offset=${offset}`);
      if (res.ok) {
        const d = await res.json();
        setCustomers(d.customers || []);
        setCustomersOffset(offset);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
              : booking
          )
        );
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries(prev =>
          prev.map(inq =>
            inq.id === inquiryId
              ? { ...inq, status: newStatus, updated_at: new Date().toISOString() }
              : inq
          )
        );
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
    }
  };

  const resetJobForm = () => {
    setJobFormData({ title: '', department: '', location: 'Stroudsburg, PA', type: 'full-time', description: '', requirements: '', salary_range: '' });
    setEditingJob(null);
    setShowJobForm(false);
  };

  const createOrUpdateJob = async () => {
    try {
      const url = editingJob ? `/api/careers/jobs/${editingJob.id}` : '/api/careers/jobs';
      const method = editingJob ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobFormData),
      });
      if (res.ok) {
        resetJobForm();
        fetchOverviewData();
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const toggleJobActive = async (job: JobListing) => {
    try {
      const res = await fetch(`/api/careers/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !job.is_active }),
      });
      if (res.ok) {
        setJobListings(prev => prev.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
      }
    } catch (error) {
      console.error('Error toggling job:', error);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Delete this job listing? All associated applications will also be deleted.')) return;
    try {
      const res = await fetch(`/api/careers/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobListings(prev => prev.filter(j => j.id !== jobId));
        setApplications(prev => prev.filter(a => a.job_listing_id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/careers/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications(prev =>
          prev.map(a => a.id === appId ? { ...a, status: newStatus, updated_at: new Date().toISOString() } : a)
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  // Debounced server-side search
  useEffect(() => {
    if (!inventorySearch) {
      fetchInventoryPage(0);
      return;
    }
    const timer = setTimeout(() => {
      fetchInventoryPage(0, inventorySearch);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventorySearch]);

  const filteredInventory = inventory;

  const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;

  // Theme-aware class helpers
  const bg = isDark ? 'bg-slate-900' : 'bg-slate-100';
  const bgSidebar = isDark ? 'bg-slate-950' : 'bg-white';
  const bgCard = isDark ? 'bg-slate-800' : 'bg-white';
  const bgInput = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const bgHover = isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const textAccent = isDark ? 'text-blue-400' : 'text-blue-600';

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`${textAccent} text-lg mb-2`}>Loading dashboard...</div>
          <div className={`${textMuted} text-sm`}>Connecting to Clover POS</div>
        </div>
      </div>
    );
  }

  const navItems: { key: NavItem; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'orders', label: 'Orders' },
    { key: 'payments', label: 'Payments' },
    { key: 'customers', label: 'Customers' },
    { key: 'bookings', label: 'Bookings', badge: pendingBookings || undefined },
    { key: 'requests', label: 'Requests', badge: pendingInquiries || undefined },
    { key: 'jobs', label: 'Jobs' },
    { key: 'applications', label: 'Applications', badge: pendingApplications || undefined },
  ];

  const getStatusClasses = (status: string) => {
    const colors = statusColors[status];
    return colors ? (isDark ? colors.dark : colors.light) : '';
  };

  // Pagination button classes
  const paginationBtn = `px-4 py-2 border ${borderColor} ${textAccent} text-sm ${bgHover} transition-colors disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className={`min-h-screen ${bg} flex`}>
      {/* Sidebar */}
      <aside className={`w-64 ${bgSidebar} border-r ${borderColor} flex flex-col min-h-screen sticky top-0`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <h1
            className={`text-2xl font-bold ${textAccent}`}
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            NEXT LEVEL
          </h1>
          <p className={`${textMuted} text-sm mt-1`}>Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveNav(item.key)}
                  className={`w-full text-left px-4 py-2.5 rounded-md transition-colors text-sm font-medium ${
                    activeNav === item.key
                      ? `${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'} border-l-2 border-blue-500`
                      : `${textSecondary} ${bgHover}`
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      isDark ? 'bg-amber-400/10 text-amber-400' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-4 border-t ${borderColor} space-y-2`}>
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 w-full px-4 py-2 ${textSecondary} ${bgHover} rounded-md transition-colors text-sm`}
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => fetchOverviewData()}
            className={`block w-full text-left px-4 py-2 ${textSecondary} ${bgHover} rounded-md transition-colors text-sm`}
          >
            Refresh Data
          </button>
          <a
            href="/"
            className={`block px-4 py-2 ${textSecondary} ${bgHover} rounded-md transition-colors text-sm`}
          >
            &larr; Back to Site
          </a>
          <button
            onClick={handleLogout}
            className={`block w-full text-left px-4 py-2 ${isDark ? 'text-red-400' : 'text-red-600'} ${bgHover} rounded-md transition-colors text-sm`}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">

          {/* ==================== OVERVIEW ==================== */}
          {activeNav === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Dashboard Overview</h2>
                <p className={textSecondary}>Live data from Clover POS</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                  <div className={`${textSecondary} text-xs uppercase tracking-wide mb-2`}>Inventory Items</div>
                  <div className={`text-3xl font-bold ${textPrimary}`}>1,321</div>
                  <div className={`${textMuted} text-xs mt-1`}>from Clover POS</div>
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                  <div className={`${isDark ? 'text-purple-400' : 'text-purple-600'} text-xs uppercase tracking-wide mb-2`}>Categories</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{categories.length}</div>
                  <div className={`${textMuted} text-xs mt-1`}>product categories</div>
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                  <div className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-xs uppercase tracking-wide mb-2`}>Recent Payments</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatCents(totalPaymentsAmount)}</div>
                  <div className={`${textMuted} text-xs mt-1`}>{payments.length} transactions</div>
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                  <div className={`${textSecondary} text-xs uppercase tracking-wide mb-2`}>Customers</div>
                  <div className={`text-3xl font-bold ${textPrimary}`}>{customers.length}</div>
                  <div className={`${textMuted} text-xs mt-1`}>on record</div>
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                  <div className={`${isDark ? 'text-amber-400' : 'text-amber-600'} text-xs uppercase tracking-wide mb-2`}>Pending Bookings</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{pendingBookings}</div>
                  <div className={`${textMuted} text-xs mt-1`}>awaiting confirmation</div>
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-5 cursor-pointer`} onClick={() => setActiveNav('requests')}>
                  <div className={`${isDark ? 'text-orange-400' : 'text-orange-600'} text-xs uppercase tracking-wide mb-2`}>Pending Requests</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{pendingInquiries}</div>
                  <div className={`${textMuted} text-xs mt-1`}>backorder requests</div>
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-5 cursor-pointer`} onClick={() => setActiveNav('applications')}>
                  <div className={`${isDark ? 'text-violet-400' : 'text-violet-600'} text-xs uppercase tracking-wide mb-2`}>Pending Applications</div>
                  <div className={`text-3xl font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>{pendingApplications}</div>
                  <div className={`${textMuted} text-xs mt-1`}>career applications</div>
                </div>
              </div>

              {/* Two-column: Orders + Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className={`${bgCard} border ${borderColor} rounded-lg p-6`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className={`${textMuted} text-sm`}>No orders found</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className={`p-3 rounded-md ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border ${borderColor}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`${textPrimary} text-sm font-semibold`}>{formatCents(order.total)}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              order.paymentState === 'PAID'
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : isDark ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-amber-600 border-amber-200 bg-amber-50'
                            }`}>
                              {order.paymentState || 'OPEN'}
                            </span>
                          </div>
                          {order.note && <div className={`${textSecondary} text-xs`}>{order.note.split('\n')[0]}</div>}
                          {order.lineItems?.elements && (
                            <div className={`${textMuted} text-xs mt-1`}>
                              {order.lineItems.elements.map(li => li.name).join(', ')}
                            </div>
                          )}
                          {order.createdTime && <div className={`${textMuted} text-xs mt-1`}>{formatDate(order.createdTime)}</div>}
                        </div>
                      ))}
                      <button onClick={() => setActiveNav('orders')} className={`w-full py-2 ${textAccent} border ${borderColor} rounded-md ${bgHover} transition-colors text-sm`}>
                        View All Orders
                      </button>
                    </div>
                  )}
                </div>

                <div className={`${bgCard} border ${borderColor} rounded-lg p-6`}>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'} mb-4`}>Recent Payments</h3>
                  {payments.length === 0 ? (
                    <p className={`${textMuted} text-sm`}>No payments found</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className={`p-3 rounded-md ${isDark ? 'bg-slate-900' : 'bg-slate-50'} border ${borderColor}`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={`${textPrimary} text-sm font-semibold`}>{formatCents(payment.amount)}</span>
                              {(payment.tipAmount ?? 0) > 0 && (
                                <span className={`${isDark ? 'text-emerald-400/60' : 'text-emerald-600'} text-xs ml-2`}>
                                  +{formatCents(payment.tipAmount!)} tip
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              payment.result === 'SUCCESS'
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : isDark ? 'text-red-400 border-red-400/30 bg-red-400/10' : 'text-red-600 border-red-200 bg-red-50'
                            }`}>
                              {payment.result}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className={`${textMuted} text-xs`}>{payment.tender?.label || 'Unknown'}</span>
                            {payment.createdTime && <span className={`${textMuted} text-xs`}>{formatDate(payment.createdTime)}</span>}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setActiveNav('payments')} className={`w-full py-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} border ${borderColor} rounded-md ${bgHover} transition-colors text-sm`}>
                        View All Payments
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ==================== INVENTORY ==================== */}
          {activeNav === 'inventory' && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Clover Inventory</h2>
                  <p className={textSecondary}>Live inventory from your Clover POS system</p>
                </div>
                <a href="/products" target="_blank" className={`px-5 py-2.5 border ${borderColor} ${textAccent} rounded-md ${bgHover} transition-colors text-sm`}>
                  View Store &rarr;
                </a>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search inventory by name, description, or barcode..."
                  className={`w-full md:w-96 ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm placeholder:${textMuted} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
                />
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Item</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Barcode</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Price</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Cost</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Stock</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm font-medium`}>{item.name}</div>
                            {item.description && <div className={`${textMuted} text-xs mt-0.5 max-w-xs truncate`}>{item.description}</div>}
                          </td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{item.code || '—'}</td>
                          <td className={`px-6 py-3 ${textPrimary} text-sm font-medium`}>{formatCents(item.price)}</td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{item.cost ? formatCents(item.cost) : '—'}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              (item.stockCount ?? 0) > 5
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : (item.stockCount ?? 0) > 0
                                ? isDark ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-amber-600 border-amber-200 bg-amber-50'
                                : isDark ? 'text-red-400/60 border-red-400/20 bg-red-400/5' : 'text-red-500 border-red-200 bg-red-50'
                            }`}>
                              {item.stockCount ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            {item.categories?.elements && item.categories.elements.length > 0 ? (
                              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                                isDark ? 'text-purple-400 border-purple-400/20 bg-purple-400/10' : 'text-purple-600 border-purple-200 bg-purple-50'
                              }`}>
                                {item.categories.elements[0].name}
                              </span>
                            ) : (
                              <span className={`${textMuted} text-xs`}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredInventory.length === 0 && (
                  <div className={`text-center ${textMuted} py-12 text-sm`}>
                    {inventorySearch ? 'No items match your search.' : 'No inventory items found.'}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`${textMuted} text-sm`}>Showing {inventoryOffset + 1}–{inventoryOffset + inventoryCount} items{inventorySearch ? ` matching "${inventorySearch}"` : ''}</span>
                <div className="flex gap-2">
                  <button onClick={() => fetchInventoryPage(Math.max(0, inventoryOffset - PAGE_SIZE), inventorySearch || undefined)} disabled={inventoryOffset === 0} className={paginationBtn}>&larr; Previous</button>
                  <button onClick={() => fetchInventoryPage(inventoryOffset + PAGE_SIZE, inventorySearch || undefined)} disabled={inventoryCount < PAGE_SIZE} className={paginationBtn}>Next &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ORDERS ==================== */}
          {activeNav === 'orders' && (
            <div>
              <div className="mb-6">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Orders</h2>
                <p className={textSecondary}>Recent orders from Clover POS</p>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Order</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Line Items</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Total</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Status</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{order.id.slice(0, 8)}...</div>
                            {order.note && <div className={`${textMuted} text-xs mt-0.5`}>{order.note.split('\n')[0]}</div>}
                          </td>
                          <td className="px-6 py-3">
                            <div className="text-sm">
                              {order.lineItems?.elements?.map((li, i) => (
                                <div key={li.id || i} className={textPrimary}>
                                  {li.name} <span className={textMuted}>{formatCents(li.price)}</span>
                                </div>
                              )) || <span className={textMuted}>—</span>}
                            </div>
                          </td>
                          <td className={`px-6 py-3 ${textPrimary} text-sm font-medium`}>{formatCents(order.total)}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              order.paymentState === 'PAID'
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : isDark ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-amber-600 border-amber-200 bg-amber-50'
                            }`}>
                              {order.paymentState || 'OPEN'}
                            </span>
                          </td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{order.createdTime ? formatDate(order.createdTime) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orders.length === 0 && <div className={`text-center ${textMuted} py-12 text-sm`}>No orders found.</div>}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`${textMuted} text-sm`}>Page {Math.floor(ordersOffset / PAGE_SIZE) + 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => fetchOrdersPage(Math.max(0, ordersOffset - PAGE_SIZE))} disabled={ordersOffset === 0} className={paginationBtn}>&larr; Previous</button>
                  <button onClick={() => fetchOrdersPage(ordersOffset + PAGE_SIZE)} disabled={orders.length < PAGE_SIZE} className={paginationBtn}>Next &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PAYMENTS ==================== */}
          {activeNav === 'payments' && (
            <div>
              <div className="mb-6">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Payments</h2>
                <p className={textSecondary}>Payment history from Clover POS</p>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Amount</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Tip</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Tax</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Tender</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Result</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className={`px-6 py-3 ${textPrimary} text-sm font-medium`}>{formatCents(payment.amount)}</td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{(payment.tipAmount ?? 0) > 0 ? formatCents(payment.tipAmount!) : '—'}</td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{(payment.taxAmount ?? 0) > 0 ? formatCents(payment.taxAmount!) : '—'}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              isDark ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : 'text-blue-600 border-blue-200 bg-blue-50'
                            }`}>
                              {payment.tender?.label || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              payment.result === 'SUCCESS'
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : isDark ? 'text-red-400 border-red-400/30 bg-red-400/10' : 'text-red-600 border-red-200 bg-red-50'
                            }`}>
                              {payment.result}
                            </span>
                          </td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{payment.createdTime ? formatDate(payment.createdTime) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {payments.length === 0 && <div className={`text-center ${textMuted} py-12 text-sm`}>No payments found.</div>}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`${textMuted} text-sm`}>Page {Math.floor(paymentsOffset / PAGE_SIZE) + 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => fetchPaymentsPage(Math.max(0, paymentsOffset - PAGE_SIZE))} disabled={paymentsOffset === 0} className={paginationBtn}>&larr; Previous</button>
                  <button onClick={() => fetchPaymentsPage(paymentsOffset + PAGE_SIZE)} disabled={payments.length < PAGE_SIZE} className={paginationBtn}>Next &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CUSTOMERS ==================== */}
          {activeNav === 'customers' && (
            <div>
              <div className="mb-6">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Customers</h2>
                <p className={textSecondary}>Customer records from Clover POS</p>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Name</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Marketing Opt-in</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Customer Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className={`px-6 py-3 ${textPrimary} text-sm`}>
                            {customer.firstName || customer.lastName
                              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                              : <span className={textMuted}>Unknown</span>
                            }
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              customer.marketingAllowed
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : isDark ? 'text-red-400/60 border-red-400/20 bg-red-400/5' : 'text-red-500 border-red-200 bg-red-50'
                            }`}>
                              {customer.marketingAllowed ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{customer.customerSince ? formatDate(customer.customerSince) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {customers.length === 0 && <div className={`text-center ${textMuted} py-12 text-sm`}>No customers found.</div>}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`${textMuted} text-sm`}>Page {Math.floor(customersOffset / PAGE_SIZE) + 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => fetchCustomersPage(Math.max(0, customersOffset - PAGE_SIZE))} disabled={customersOffset === 0} className={paginationBtn}>&larr; Previous</button>
                  <button onClick={() => fetchCustomersPage(customersOffset + PAGE_SIZE)} disabled={customers.length < PAGE_SIZE} className={paginationBtn}>Next &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BOOKINGS ==================== */}
          {activeNav === 'bookings' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Bookings</h2>
                  <p className={textSecondary}>Live appointments from BayReady</p>
                </div>
                <a
                  href="https://bayready.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 border ${borderColor} ${textAccent} rounded-md ${bgHover} transition-colors text-sm`}
                >
                  Open BayReady &rarr;
                </a>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Customer</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Service</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Vehicle</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Date & Time</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Deposit</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Status</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm font-medium`}>{booking.customer_name}</div>
                            {booking.customer_email && <div className={`${textSecondary} text-xs`}>{booking.customer_email}</div>}
                            {booking.customer_phone && <div className={`${textSecondary} text-xs`}>{booking.customer_phone}</div>}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{booking.service_type}</div>
                            {booking.service_price_cents != null && (
                              <div className={`${textMuted} text-xs`}>{formatCents(booking.service_price_cents)}</div>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            {booking.vehicle_make ? (
                              <div className={`${textSecondary} text-sm`}>
                                {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model}
                                {booking.vehicle_trim && <span className={textMuted}> {booking.vehicle_trim}</span>}
                              </div>
                            ) : (
                              <span className={`${textMuted} text-xs`}>&mdash;</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{new Date(booking.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div className={`${textSecondary} text-xs`}>{booking.appointment_time}</div>
                          </td>
                          <td className="px-6 py-3">
                            {booking.deposit_paid_at ? (
                              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                                isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                              }`}>
                                {booking.deposit_amount_cents != null ? formatCents(booking.deposit_amount_cents) : 'Paid'}
                              </span>
                            ) : (
                              <span className={`${textMuted} text-xs`}>&mdash;</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusClasses(booking.status)}`}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                              className={`${bgInput} border ${borderColor} ${textPrimary} px-3 py-1.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors cursor-pointer`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="no_show">No Show</option>
                            </select>
                            <button
                              onClick={() => deleteBooking(booking.id)}
                              className={`${isDark ? 'text-red-400' : 'text-red-600'} text-sm ${bgHover} px-2 py-1 rounded transition-colors ml-2`}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bookings.length === 0 && (
                  <div className={`text-center ${textMuted} py-12 text-sm`}>
                    No bookings found. Appointments from BayReady will appear here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== JOBS ==================== */}
          {activeNav === 'jobs' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Job Listings</h2>
                  <p className={textSecondary}>Manage career opportunities</p>
                </div>
                <button
                  onClick={() => { resetJobForm(); setShowJobForm(true); }}
                  className={`px-5 py-2.5 ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-400/30' : 'bg-blue-50 text-blue-600 border-blue-200'} border rounded-md hover:opacity-80 transition-colors text-sm`}
                >
                  + Create New Job
                </button>
              </div>

              {/* Job Form */}
              {showJobForm && (
                <div className={`${bgCard} border ${borderColor} rounded-lg p-6 mb-6`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
                    {editingJob ? 'Edit Job Listing' : 'Create New Job Listing'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Title *</label>
                      <input
                        type="text"
                        value={jobFormData.title}
                        onChange={(e) => setJobFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Car Audio Installer"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Department *</label>
                      <input
                        type="text"
                        value={jobFormData.department}
                        onChange={(e) => setJobFormData(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g. Installation"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Location</label>
                      <input
                        type="text"
                        value={jobFormData.location}
                        onChange={(e) => setJobFormData(prev => ({ ...prev, location: e.target.value }))}
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Type</label>
                      <select
                        value={jobFormData.type}
                        onChange={(e) => setJobFormData(prev => ({ ...prev, type: e.target.value as 'full-time' | 'part-time' | 'contract' }))}
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors cursor-pointer`}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Salary Range</label>
                      <input
                        type="text"
                        value={jobFormData.salary_range}
                        onChange={(e) => setJobFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                        placeholder="e.g. $40,000 - $60,000"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Description *</label>
                    <textarea
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Describe the role and responsibilities..."
                      className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors resize-y`}
                    />
                  </div>
                  <div className="mb-4">
                    <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Requirements</label>
                    <textarea
                      value={jobFormData.requirements}
                      onChange={(e) => setJobFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={3}
                      placeholder="List qualifications, skills, experience needed..."
                      className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors resize-y`}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={createOrUpdateJob}
                      disabled={!jobFormData.title || !jobFormData.department || !jobFormData.description}
                      className={`px-5 py-2.5 ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'} rounded-md hover:opacity-90 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </button>
                    <button
                      onClick={resetJobForm}
                      className={`px-5 py-2.5 border ${borderColor} ${textSecondary} rounded-md ${bgHover} transition-colors text-sm`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Jobs Table */}
              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Title</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Department</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Type</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Salary</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Active</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobListings.map((job) => (
                        <tr key={job.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm font-medium`}>{job.title}</div>
                            <div className={`${textMuted} text-xs`}>{job.location}</div>
                          </td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{job.department}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              isDark ? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10' : 'text-cyan-600 border-cyan-200 bg-cyan-50'
                            }`}>
                              {job.type}
                            </span>
                          </td>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>{job.salary_range || '—'}</td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => toggleJobActive(job)}
                              className={`px-2.5 py-1 text-xs rounded-full border cursor-pointer transition-colors ${
                                job.is_active
                                  ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                  : isDark ? 'text-slate-400 border-slate-400/30 bg-slate-400/10' : 'text-slate-500 border-slate-200 bg-slate-50'
                              }`}
                            >
                              {job.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingJob(job);
                                  setJobFormData({
                                    title: job.title,
                                    department: job.department,
                                    location: job.location,
                                    type: job.type,
                                    description: job.description,
                                    requirements: job.requirements || '',
                                    salary_range: job.salary_range || '',
                                  });
                                  setShowJobForm(true);
                                }}
                                className={`${textAccent} text-sm ${bgHover} px-2 py-1 rounded transition-colors`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteJob(job.id)}
                                className={`${isDark ? 'text-red-400' : 'text-red-600'} text-sm ${bgHover} px-2 py-1 rounded transition-colors`}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {jobListings.length === 0 && (
                  <div className={`text-center ${textMuted} py-12 text-sm`}>
                    No job listings yet. Click &ldquo;Create New Job&rdquo; to add your first listing.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== APPLICATIONS ==================== */}
          {activeNav === 'applications' && (
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Career Applications</h2>
                <p className={textSecondary}>Review and manage job applications</p>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Date</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Applicant</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Position</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Resume</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Cover Letter</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Status</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>
                            {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm font-medium`}>{app.applicant_name}</div>
                            <div className={`${textSecondary} text-xs`}>{app.applicant_email}</div>
                            {app.applicant_phone && <div className={`${textMuted} text-xs`}>{app.applicant_phone}</div>}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{app.job_listing?.title || 'Unknown Position'}</div>
                            {app.job_listing?.department && <div className={`${textMuted} text-xs`}>{app.job_listing.department}</div>}
                          </td>
                          <td className="px-6 py-3">
                            {app.resume_url ? (
                              <a
                                href={app.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${textAccent} text-sm underline`}
                              >
                                Download
                              </a>
                            ) : (
                              <span className={`${textMuted} text-xs`}>None</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            {app.cover_letter ? (
                              <div className={`${textMuted} text-xs max-w-xs truncate italic`}>&ldquo;{app.cover_letter}&rdquo;</div>
                            ) : (
                              <span className={`${textMuted} text-xs`}>None</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusClasses(app.status)}`}>
                              {app.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value as ApplicationStatus)}
                              className={`${bgInput} border ${borderColor} ${textPrimary} px-3 py-1.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors cursor-pointer`}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="interviewed">Interviewed</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {applications.length === 0 && (
                  <div className={`text-center ${textMuted} py-12 text-sm`}>
                    No applications yet. Applications will appear here when candidates apply through the careers page.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== REQUESTS ==================== */}
          {activeNav === 'requests' && (
            <div>
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Item Requests</h2>
                <p className={textSecondary}>Backorder and inquiry requests from customers</p>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Date</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Customer</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Product</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Type</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Status</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className={`px-6 py-3 ${textSecondary} text-sm`}>
                            {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm font-medium`}>{inq.customer_name}</div>
                            <div className={`${textSecondary} text-xs`}>{inq.customer_email}</div>
                            {inq.customer_phone && <div className={`${textMuted} text-xs`}>{inq.customer_phone}</div>}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{inq.product_name}</div>
                            <div className={`${textMuted} text-xs`}>{formatCents(inq.product_price)}</div>
                            {inq.message && <div className={`${textMuted} text-xs mt-1 max-w-xs truncate italic`}>&ldquo;{inq.message}&rdquo;</div>}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${
                              inq.request_type === 'backorder'
                                ? isDark ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' : 'text-orange-600 border-orange-200 bg-orange-50'
                                : isDark ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-blue-600 border-blue-200 bg-blue-50'
                            }`}>
                              {inq.request_type === 'backorder' ? 'Backorder' : 'Inquiry'}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 text-xs rounded-full border ${
                              inq.status === 'pending'
                                ? isDark ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-amber-600 border-amber-200 bg-amber-50'
                                : inq.status === 'contacted'
                                ? isDark ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-blue-600 border-blue-200 bg-blue-50'
                                : inq.status === 'fulfilled'
                                ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                : isDark ? 'text-slate-400 border-slate-400/30 bg-slate-400/10' : 'text-slate-600 border-slate-200 bg-slate-50'
                            }`}>
                              {inq.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <select
                              value={inq.status}
                              onChange={(e) => updateInquiryStatus(inq.id, e.target.value as InquiryStatus)}
                              className={`${bgInput} border ${borderColor} ${textPrimary} px-3 py-1.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="fulfilled">Fulfilled</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {inquiries.length === 0 && (
                  <div className={`text-center ${textMuted} py-12 text-sm`}>
                    No requests yet. Backorder requests from customers will appear here.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
