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

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/30',
  completed: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
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
  const [activeNav, setActiveNav] = useState<NavItem>('overview');
  const [loading, setLoading] = useState(true);

  // Clover data
  const [inventory, setInventory] = useState<CloverItem[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [orders, setOrders] = useState<CloverOrder[]>([]);
  const [payments, setPayments] = useState<CloverPayment[]>([]);
  const [customers, setCustomers] = useState<CloverCustomer[]>([]);

  // Bookings (from Supabase)
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Pagination & filters
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

  // Tab-specific data loaders
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

  // Filtered inventory for search
  const filteredInventory = inventorySearch
    ? inventory.filter(item =>
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(inventorySearch.toLowerCase()) ||
        (item.code || '').includes(inventorySearch)
      )
    : inventory;

  // Payment stats
  const totalPaymentsAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#00A0E0] text-lg font-mono mb-2">Loading dashboard...</div>
          <div className="text-[#00A0E0]/40 text-sm font-mono">Connecting to Clover POS</div>
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-[#00A0E0]/20 flex flex-col min-h-screen sticky top-0">
        <div className="p-6 border-b border-[#00A0E0]/20">
          <h1
            className="text-2xl font-bold text-[#00A0E0]"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            NEXT LEVEL
          </h1>
          <p className="text-[#00A0E0]/60 text-sm mt-1 font-mono">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => setActiveNav(item.key)}
                  className={`w-full text-left px-4 py-3 transition-colors font-mono text-sm ${
                    activeNav === item.key
                      ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                      : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs border border-yellow-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#00A0E0]/20 space-y-2">
          <button
            onClick={() => fetchOverviewData()}
            className="block w-full px-4 py-2 text-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors font-mono text-sm text-left border border-[#00A0E0]/20 hover:border-[#00A0E0]/40"
          >
            Refresh Data
          </button>
          <a
            href="/"
            className="block px-4 py-2 text-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors font-mono text-sm"
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
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  Dashboard Overview
                </h2>
                <p className="text-[#00A0E0]/60 font-mono">Live data from Clover POS</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-black border border-[#00A0E0]/30 p-5">
                  <div className="text-[#00A0E0]/60 text-xs font-mono mb-2">INVENTORY ITEMS</div>
                  <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    1,321
                  </div>
                  <div className="text-[#00A0E0]/40 text-xs font-mono mt-1">from Clover POS</div>
                </div>

                <div className="bg-black border border-purple-400/30 p-5">
                  <div className="text-purple-400/80 text-xs font-mono mb-2">CATEGORIES</div>
                  <div className="text-3xl font-bold text-purple-400" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {categories.length}
                  </div>
                  <div className="text-purple-400/40 text-xs font-mono mt-1">product categories</div>
                </div>

                <div className="bg-black border border-green-400/30 p-5">
                  <div className="text-green-400/80 text-xs font-mono mb-2">RECENT PAYMENTS</div>
                  <div className="text-3xl font-bold text-green-400" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {formatCents(totalPaymentsAmount)}
                  </div>
                  <div className="text-green-400/40 text-xs font-mono mt-1">{payments.length} transactions</div>
                </div>

                <div className="bg-black border border-[#00A0E0]/30 p-5">
                  <div className="text-[#00A0E0]/60 text-xs font-mono mb-2">CUSTOMERS</div>
                  <div className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {customers.length}
                  </div>
                  <div className="text-[#00A0E0]/40 text-xs font-mono mt-1">on record</div>
                </div>

                <div className="bg-black border border-yellow-400/30 p-5">
                  <div className="text-yellow-400/80 text-xs font-mono mb-2">PENDING BOOKINGS</div>
                  <div className="text-3xl font-bold text-yellow-400" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    {pendingBookings}
                  </div>
                  <div className="text-yellow-400/40 text-xs font-mono mt-1">awaiting confirmation</div>
                </div>
              </div>

              {/* Two-column: Recent Orders + Recent Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Recent Orders */}
                <div className="bg-black border border-[#00A0E0]/30 p-6">
                  <h3 className="text-lg font-bold text-[#00A0E0] mb-4 font-mono">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="text-[#00A0E0]/40 font-mono text-sm">No orders found</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-3 bg-[#0a0a0a] border border-[#00A0E0]/20">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-white font-mono text-sm font-semibold">
                              {formatCents(order.total)}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-mono border ${
                              order.paymentState === 'PAID'
                                ? 'text-green-400 border-green-400/30 bg-green-400/10'
                                : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                            }`}>
                              {order.paymentState || 'OPEN'}
                            </span>
                          </div>
                          {order.note && (
                            <div className="text-[#00A0E0]/60 text-xs font-mono">{order.note.split('\n')[0]}</div>
                          )}
                          {order.lineItems?.elements && (
                            <div className="text-[#00A0E0]/40 text-xs font-mono mt-1">
                              {order.lineItems.elements.map(li => li.name).join(', ')}
                            </div>
                          )}
                          {order.createdTime && (
                            <div className="text-[#00A0E0]/30 text-xs font-mono mt-1">
                              {formatDate(order.createdTime)}
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setActiveNav('orders')}
                        className="w-full py-2 text-[#00A0E0] border border-[#00A0E0]/30 hover:border-[#00A0E0] transition-colors font-mono text-sm"
                      >
                        View All Orders
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Payments */}
                <div className="bg-black border border-green-400/30 p-6">
                  <h3 className="text-lg font-bold text-green-400 mb-4 font-mono">Recent Payments</h3>
                  {payments.length === 0 ? (
                    <p className="text-[#00A0E0]/40 font-mono text-sm">No payments found</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="p-3 bg-[#0a0a0a] border border-green-400/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-white font-mono text-sm font-semibold">
                                {formatCents(payment.amount)}
                              </span>
                              {(payment.tipAmount ?? 0) > 0 && (
                                <span className="text-green-400/60 text-xs font-mono ml-2">
                                  +{formatCents(payment.tipAmount!)} tip
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-mono border ${
                              payment.result === 'SUCCESS'
                                ? 'text-green-400 border-green-400/30 bg-green-400/10'
                                : 'text-red-400 border-red-400/30 bg-red-400/10'
                            }`}>
                              {payment.result}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[#00A0E0]/50 text-xs font-mono">
                              {payment.tender?.label || 'Unknown'}
                            </span>
                            {payment.createdTime && (
                              <span className="text-[#00A0E0]/30 text-xs font-mono">
                                {formatDate(payment.createdTime)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setActiveNav('payments')}
                        className="w-full py-2 text-green-400 border border-green-400/30 hover:border-green-400 transition-colors font-mono text-sm"
                      >
                        View All Payments
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Categories Overview */}
              <div className="bg-black border border-purple-400/30 p-6">
                <h3 className="text-lg font-bold text-purple-400 mb-4 font-mono">Product Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1.5 bg-purple-400/10 text-purple-400 border border-purple-400/30 font-mono text-xs"
                    >
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
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    Clover Inventory
                  </h2>
                  <p className="text-[#00A0E0]/60 font-mono">Live inventory from your Clover POS system</p>
                </div>
                <a
                  href="/products"
                  target="_blank"
                  className="px-6 py-3 border border-[#00A0E0]/30 text-[#00A0E0] font-mono hover:border-[#00A0E0] transition-colors"
                >
                  View Store &rarr;
                </a>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search inventory by name, description, or barcode..."
                  className="w-full md:w-96 bg-black border border-[#00A0E0]/30 text-white px-4 py-2 font-mono text-sm placeholder:text-[#00A0E0]/30 focus:border-[#00A0E0] focus:outline-none"
                />
              </div>

              <div className="bg-black border border-[#00A0E0]/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#00A0E0]/30">
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">ITEM</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">BARCODE</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">PRICE</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">COST</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">STOCK</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">CATEGORY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="border-b border-[#00A0E0]/10 hover:bg-[#00A0E0]/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono">
                              <div className="text-white font-semibold">{item.name}</div>
                              {item.description && (
                                <div className="text-[#00A0E0]/50 text-xs mt-0.5 max-w-xs truncate">{item.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">{item.code || '—'}</td>
                          <td className="px-6 py-4 text-white font-mono font-semibold">{formatCents(item.price)}</td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">
                            {item.cost ? formatCents(item.cost) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-xs font-mono border ${
                              (item.stockCount ?? 0) > 5
                                ? 'text-green-400 border-green-400/30 bg-green-400/10'
                                : (item.stockCount ?? 0) > 0
                                ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                                : 'text-red-400/60 border-red-400/20 bg-red-400/5'
                            }`}>
                              {item.stockCount ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {item.categories?.elements && item.categories.elements.length > 0 ? (
                              <span className="px-2 py-0.5 text-xs font-mono border text-purple-400 border-purple-400/30 bg-purple-400/10">
                                {item.categories.elements[0].name}
                              </span>
                            ) : (
                              <span className="text-[#00A0E0]/30 text-xs font-mono">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredInventory.length === 0 && (
                  <div className="text-center text-[#00A0E0]/60 font-mono py-12">
                    {inventorySearch ? 'No items match your search.' : 'No inventory items found.'}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!inventorySearch && (
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[#00A0E0]/40 font-mono text-sm">
                    Showing {inventoryOffset + 1}–{inventoryOffset + inventoryCount} items
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchInventoryPage(Math.max(0, inventoryOffset - PAGE_SIZE))}
                      disabled={inventoryOffset === 0}
                      className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0] font-mono text-sm hover:border-[#00A0E0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &larr; Previous
                    </button>
                    <button
                      onClick={() => fetchInventoryPage(inventoryOffset + PAGE_SIZE)}
                      disabled={inventoryCount < PAGE_SIZE}
                      className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0] font-mono text-sm hover:border-[#00A0E0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== ORDERS ==================== */}
          {activeNav === 'orders' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  Orders
                </h2>
                <p className="text-[#00A0E0]/60 font-mono">Recent orders from Clover POS</p>
              </div>

              <div className="bg-black border border-[#00A0E0]/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#00A0E0]/30">
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">ORDER</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">LINE ITEMS</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">TOTAL</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">STATUS</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#00A0E0]/10 hover:bg-[#00A0E0]/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono">
                              <div className="text-white text-sm">{order.id.slice(0, 8)}...</div>
                              {order.note && (
                                <div className="text-[#00A0E0]/50 text-xs mt-0.5">{order.note.split('\n')[0]}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm">
                              {order.lineItems?.elements?.map((li, i) => (
                                <div key={li.id || i} className="text-white">
                                  {li.name}
                                  <span className="text-[#00A0E0]/40 ml-2">{formatCents(li.price)}</span>
                                </div>
                              )) || <span className="text-[#00A0E0]/30">—</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white font-mono font-semibold">{formatCents(order.total)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-xs font-mono border ${
                              order.paymentState === 'PAID'
                                ? 'text-green-400 border-green-400/30 bg-green-400/10'
                                : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                            }`}>
                              {order.paymentState || 'OPEN'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">
                            {order.createdTime ? formatDate(order.createdTime) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {orders.length === 0 && (
                  <div className="text-center text-[#00A0E0]/60 font-mono py-12">No orders found.</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-[#00A0E0]/40 font-mono text-sm">
                  Page {Math.floor(ordersOffset / PAGE_SIZE) + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchOrdersPage(Math.max(0, ordersOffset - PAGE_SIZE))}
                    disabled={ordersOffset === 0}
                    className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0] font-mono text-sm hover:border-[#00A0E0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &larr; Previous
                  </button>
                  <button
                    onClick={() => fetchOrdersPage(ordersOffset + PAGE_SIZE)}
                    disabled={orders.length < PAGE_SIZE}
                    className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0] font-mono text-sm hover:border-[#00A0E0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PAYMENTS ==================== */}
          {activeNav === 'payments' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  Payments
                </h2>
                <p className="text-[#00A0E0]/60 font-mono">Payment history from Clover POS</p>
              </div>

              <div className="bg-black border border-green-400/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-400/30">
                        <th className="px-6 py-4 text-left text-green-400 font-mono font-semibold text-sm">AMOUNT</th>
                        <th className="px-6 py-4 text-left text-green-400 font-mono font-semibold text-sm">TIP</th>
                        <th className="px-6 py-4 text-left text-green-400 font-mono font-semibold text-sm">TAX</th>
                        <th className="px-6 py-4 text-left text-green-400 font-mono font-semibold text-sm">TENDER</th>
                        <th className="px-6 py-4 text-left text-green-400 font-mono font-semibold text-sm">RESULT</th>
                        <th className="px-6 py-4 text-left text-green-400 font-mono font-semibold text-sm">DATE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-green-400/10 hover:bg-green-400/5 transition-colors">
                          <td className="px-6 py-4 text-white font-mono font-semibold">{formatCents(payment.amount)}</td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">
                            {(payment.tipAmount ?? 0) > 0 ? formatCents(payment.tipAmount!) : '—'}
                          </td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">
                            {(payment.taxAmount ?? 0) > 0 ? formatCents(payment.taxAmount!) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 text-xs font-mono border text-[#00A0E0] border-[#00A0E0]/30 bg-[#00A0E0]/10">
                              {payment.tender?.label || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-xs font-mono border ${
                              payment.result === 'SUCCESS'
                                ? 'text-green-400 border-green-400/30 bg-green-400/10'
                                : 'text-red-400 border-red-400/30 bg-red-400/10'
                            }`}>
                              {payment.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">
                            {payment.createdTime ? formatDate(payment.createdTime) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {payments.length === 0 && (
                  <div className="text-center text-[#00A0E0]/60 font-mono py-12">No payments found.</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-[#00A0E0]/40 font-mono text-sm">
                  Page {Math.floor(paymentsOffset / PAGE_SIZE) + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchPaymentsPage(Math.max(0, paymentsOffset - PAGE_SIZE))}
                    disabled={paymentsOffset === 0}
                    className="px-4 py-2 border border-green-400/30 text-green-400 font-mono text-sm hover:border-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &larr; Previous
                  </button>
                  <button
                    onClick={() => fetchPaymentsPage(paymentsOffset + PAGE_SIZE)}
                    disabled={payments.length < PAGE_SIZE}
                    className="px-4 py-2 border border-green-400/30 text-green-400 font-mono text-sm hover:border-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== CUSTOMERS ==================== */}
          {activeNav === 'customers' && (
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                  Customers
                </h2>
                <p className="text-[#00A0E0]/60 font-mono">Customer records from Clover POS</p>
              </div>

              <div className="bg-black border border-[#00A0E0]/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#00A0E0]/30">
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">NAME</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">MARKETING OPT-IN</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">CUSTOMER SINCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-[#00A0E0]/10 hover:bg-[#00A0E0]/5 transition-colors">
                          <td className="px-6 py-4 text-white font-mono">
                            {customer.firstName || customer.lastName
                              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
                              : <span className="text-[#00A0E0]/30">Unknown</span>
                            }
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 text-xs font-mono border ${
                              customer.marketingAllowed
                                ? 'text-green-400 border-green-400/30 bg-green-400/10'
                                : 'text-red-400/60 border-red-400/20 bg-red-400/5'
                            }`}>
                              {customer.marketingAllowed ? 'YES' : 'NO'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#00A0E0]/60 font-mono text-sm">
                            {customer.customerSince ? formatDate(customer.customerSince) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {customers.length === 0 && (
                  <div className="text-center text-[#00A0E0]/60 font-mono py-12">No customers found.</div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <span className="text-[#00A0E0]/40 font-mono text-sm">
                  Page {Math.floor(customersOffset / PAGE_SIZE) + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchCustomersPage(Math.max(0, customersOffset - PAGE_SIZE))}
                    disabled={customersOffset === 0}
                    className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0] font-mono text-sm hover:border-[#00A0E0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    &larr; Previous
                  </button>
                  <button
                    onClick={() => fetchCustomersPage(customersOffset + PAGE_SIZE)}
                    disabled={customers.length < PAGE_SIZE}
                    className="px-4 py-2 border border-[#00A0E0]/30 text-[#00A0E0] font-mono text-sm hover:border-[#00A0E0] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== BOOKINGS ==================== */}
          {activeNav === 'bookings' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-oxanium)' }}>
                    Bookings
                  </h2>
                  <p className="text-[#00A0E0]/60 font-mono">Manage customer appointments and reservations</p>
                </div>
                <button className="px-6 py-3 bg-[#00A0E0] text-black font-mono font-semibold hover:bg-[#00B8FF] transition-colors">
                  + New Booking
                </button>
              </div>

              <div className="bg-black border border-[#00A0E0]/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#00A0E0]/30">
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">CUSTOMER</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">SERVICE</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">DATE & TIME</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">STATUS</th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-[#00A0E0]/10 hover:bg-[#00A0E0]/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono">
                              <div className="text-white font-semibold">{booking.customer_name}</div>
                              <div className="text-[#00A0E0]/60 text-sm">{booking.customer_email}</div>
                              <div className="text-[#00A0E0]/60 text-sm">{booking.customer_phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono">
                              <div className="text-white">{serviceNames[booking.service_type] || booking.service_type}</div>
                              {booking.vehicle_make && (
                                <div className="text-[#00A0E0]/60 text-sm">
                                  {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-white">
                              <div>{new Date(booking.appointment_date).toLocaleDateString()}</div>
                              <div className="text-[#00A0E0]/60 text-sm">{booking.appointment_time}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-mono border ${statusColors[booking.status]}`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                              className="bg-[#0a0a0a] border border-[#00A0E0]/30 text-[#00A0E0] px-3 py-2 font-mono text-sm hover:border-[#00A0E0] focus:border-[#00A0E0] focus:outline-none transition-colors"
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
                  <div className="text-center text-[#00A0E0]/60 font-mono py-12">
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
