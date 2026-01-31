'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus } from '@/types/booking';
import type {
  CloverItem,
  CloverOrder,
  CloverCustomer,
  CloverPayment,
  CloverCategory,
} from '@/types/clover';
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
  completed: {
    dark: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    light: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  cancelled: {
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

type NavItem = 'overview' | 'inventory' | 'orders' | 'payments' | 'customers' | 'bookings';

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

  const [activeNav, setActiveNav] = useState<NavItem>('overview');
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState<CloverItem[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [orders, setOrders] = useState<CloverOrder[]>([]);
  const [payments, setPayments] = useState<CloverPayment[]>([]);
  const [customers, setCustomers] = useState<CloverCustomer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [inventoryOffset, setInventoryOffset] = useState(0);
  const [inventorySearch, setInventorySearch] = useState('');
  const [ordersOffset, setOrdersOffset] = useState(0);
  const [paymentsOffset, setPaymentsOffset] = useState(0);
  const [customersOffset, setCustomersOffset] = useState(0);

  const PAGE_SIZE = 25;

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, catRes, ordRes, payRes, custRes, bookRes] = await Promise.allSettled([
        fetch(`/api/clover/inventory?limit=${PAGE_SIZE}&offset=0`),
        fetch('/api/clover/categories'),
        fetch('/api/clover/orders?limit=10'),
        fetch('/api/clover/payments?limit=10'),
        fetch('/api/clover/customers?limit=100'),
        fetch('/api/bookings'),
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
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const fetchInventoryPage = async (offset: number) => {
    try {
      const res = await fetch(`/api/clover/inventory?limit=${PAGE_SIZE}&offset=${offset}`);
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
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
          : booking
      )
    );
  };

  const filteredInventory = inventorySearch
    ? inventory.filter(item =>
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.code || '').includes(inventorySearch)
      )
    : inventory;

  const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

              {/* Categories */}
              <div className={`${bgCard} border ${borderColor} rounded-lg p-6`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'} mb-4`}>Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span key={cat.id} className={`px-3 py-1.5 rounded-full text-xs ${
                      isDark ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20' : 'bg-purple-50 text-purple-600 border border-purple-200'
                    }`}>
                      {cat.name}
                    </span>
                  ))}
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

              {!inventorySearch && (
                <div className="flex justify-between items-center mt-4">
                  <span className={`${textMuted} text-sm`}>Showing {inventoryOffset + 1}–{inventoryOffset + inventoryCount} items</span>
                  <div className="flex gap-2">
                    <button onClick={() => fetchInventoryPage(Math.max(0, inventoryOffset - PAGE_SIZE))} disabled={inventoryOffset === 0} className={paginationBtn}>&larr; Previous</button>
                    <button onClick={() => fetchInventoryPage(inventoryOffset + PAGE_SIZE)} disabled={inventoryCount < PAGE_SIZE} className={paginationBtn}>Next &rarr;</button>
                  </div>
                </div>
              )}
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
                  <p className={textSecondary}>Manage customer appointments and reservations</p>
                </div>
                <button className={`px-5 py-2.5 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors text-sm`}>
                  + New Booking
                </button>
              </div>

              <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Customer</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Service</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Date & Time</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Status</th>
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm font-medium`}>{booking.customer_name}</div>
                            <div className={`${textSecondary} text-xs`}>{booking.customer_email}</div>
                            <div className={`${textSecondary} text-xs`}>{booking.customer_phone}</div>
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{serviceNames[booking.service_type] || booking.service_type}</div>
                            {booking.vehicle_make && (
                              <div className={`${textSecondary} text-xs`}>
                                {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className={`${textPrimary} text-sm`}>{new Date(booking.appointment_date).toLocaleDateString()}</div>
                            <div className={`${textSecondary} text-xs`}>{booking.appointment_time}</div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 text-xs rounded-full border ${getStatusClasses(booking.status)}`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                              className={`${bgInput} border ${borderColor} ${textPrimary} px-3 py-1.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bookings.length === 0 && (
                  <div className={`text-center ${textMuted} py-12 text-sm`}>
                    No bookings found. New appointments will appear here.
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
