'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import type { CareerApplication, ApplicationStatus } from '@/types/career';
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

type NavItem = 'overview' | 'inventory' | 'orders' | 'payments' | 'customers' | 'bookings' | 'requests' | 'applications' | 'best-sellers' | 'coupons' | 'price-compare';

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
  const [applications, setApplications] = useState<CareerApplication[]>([]);

  // Best sellers state
  interface BestSellerRow {
    id: string;
    clover_item_id: string;
    item_name: string;
    total_quantity_sold: number;
    total_revenue_cents: number;
    order_count: number;
    last_sold_at: string | null;
    updated_at: string;
  }
  const [bestSellers, setBestSellers] = useState<BestSellerRow[]>([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  const fetchBestSellers = useCallback(async () => {
    setBestSellersLoading(true);
    try {
      const res = await fetch('/api/best-sellers?limit=50&sort=quantity');
      if (res.ok) {
        const data = await res.json();
        setBestSellers(data.items || []);
        if (data.items?.length > 0 && data.items[0].updated_at) {
          setLastRefreshed(data.items[0].updated_at);
        }
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    } finally {
      setBestSellersLoading(false);
    }
  }, []);

  const refreshBestSellers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/best-sellers/refresh', { method: 'POST' });
      if (res.ok) {
        await fetchBestSellers();
      }
    } catch (error) {
      console.error('Error refreshing best sellers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Coupons state
  interface CouponRow {
    id: string;
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    min_order_cents: number | null;
    max_uses: number | null;
    used_count: number;
    points_cost: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
  }
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    min_order_cents: '',
    max_uses: '',
    points_cost: '',
    expires_at: '',
  });
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Price Compare state
  interface PriceResultRow {
    distributor: string;
    distributorUrl: string;
    productName: string;
    productUrl: string;
    sku: string | null;
    priceCents: number | null;
    priceDisplay: string;
    inStock: boolean | null;
    imageUrl: string | null;
    matchConfidence: 'exact' | 'high' | 'partial';
  }
  const [priceQuery, setPriceQuery] = useState('');
  const [priceResults, setPriceResults] = useState<PriceResultRow[]>([]);
  const [priceErrors, setPriceErrors] = useState<{ distributor: string; error: string }[]>([]);
  const [priceSearching, setPriceSearching] = useState(false);
  const [priceSearchedAt, setPriceSearchedAt] = useState<string | null>(null);
  const [priceSearchHistory, setPriceSearchHistory] = useState<string[]>([]);

  const searchPrices = async () => {
    const q = priceQuery.trim();
    if (!q) return;
    setPriceSearching(true);
    setPriceResults([]);
    setPriceErrors([]);
    setPriceSearchedAt(null);
    try {
      const res = await fetch('/api/admin/price-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const data = await res.json();
        setPriceResults(data.results || []);
        setPriceErrors(data.errors || []);
        setPriceSearchedAt(data.searchedAt);
        // Add to search history (deduplicated, max 10)
        setPriceSearchHistory(prev => {
          const filtered = prev.filter(h => h.toLowerCase() !== q.toLowerCase());
          return [q, ...filtered].slice(0, 10);
        });
      }
    } catch (error) {
      console.error('Price search error:', error);
    } finally {
      setPriceSearching(false);
    }
  };

  const fetchCoupons = useCallback(async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setCouponsLoading(false);
    }
  }, []);

  const handleCreateCoupon = async () => {
    setCouponSaving(true);
    setCouponError('');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponForm.code,
          type: couponForm.type,
          value: couponForm.type === 'fixed' ? Number(couponForm.value) * 100 : Number(couponForm.value),
          min_order_cents: couponForm.min_order_cents ? Number(couponForm.min_order_cents) * 100 : null,
          max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
          points_cost: couponForm.points_cost ? Number(couponForm.points_cost) : 0,
          expires_at: couponForm.expires_at || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setCouponError(data.error || 'Failed to create coupon');
        return;
      }

      setShowCouponForm(false);
      setCouponForm({ code: '', type: 'percent', value: '', min_order_cents: '', max_uses: '', points_cost: '', expires_at: '' });
      await fetchCoupons();
    } catch {
      setCouponError('Failed to create coupon');
    } finally {
      setCouponSaving(false);
    }
  };

  const handleToggleCoupon = async (couponId: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: couponId, is_active: !isActive }),
      });
      await fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CloverItem | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '', price: '', cost: '', code: '', description: '', categoryId: '', stockCount: '',
  });
  const [productSaving, setProductSaving] = useState(false);

  const [inventoryOffset, setInventoryOffset] = useState(0);
  const [inventorySearch, setInventorySearch] = useState('');
  const [ordersOffset, setOrdersOffset] = useState(0);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [editingOrderNote, setEditingOrderNote] = useState<string | null>(null);
  const [orderNoteValue, setOrderNoteValue] = useState('');
  const [orderActionLoading, setOrderActionLoading] = useState(false);
  const [paymentsOffset, setPaymentsOffset] = useState(0);
  const [customersOffset, setCustomersOffset] = useState(0);

  const PAGE_SIZE = 25;

  const fetchOverviewData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, catRes, ordRes, payRes, custRes, bookRes, inqRes, appsRes] = await Promise.allSettled([
        fetch(`/api/clover/inventory?limit=${PAGE_SIZE}&offset=0`),
        fetch('/api/clover/categories'),
        fetch('/api/clover/orders?limit=10'),
        fetch('/api/clover/payments?limit=10'),
        fetch('/api/clover/customers?limit=100'),
        fetch('/api/bookings'),
        fetch('/api/inquiries'),
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

  // Load best sellers when tab is selected
  useEffect(() => {
    if (activeNav === 'best-sellers' && bestSellers.length === 0) {
      fetchBestSellers();
    }
  }, [activeNav, bestSellers.length, fetchBestSellers]);

  // Load coupons when tab is selected
  useEffect(() => {
    if (activeNav === 'coupons' && coupons.length === 0) {
      fetchCoupons();
    }
  }, [activeNav, coupons.length, fetchCoupons]);

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

  const updateOrderNote = async (orderId: string, note: string) => {
    setOrderActionLoading(true);
    try {
      const res = await fetch(`/api/clover/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, note } : o));
        setEditingOrderNote(null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
    setOrderActionLoading(false);
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    setOrderActionLoading(true);
    try {
      const res = await fetch(`/api/clover/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setExpandedOrderId(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
    setOrderActionLoading(false);
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

  // Product CRUD
  const resetProductForm = () => {
    setProductFormData({ name: '', price: '', cost: '', code: '', description: '', categoryId: '', stockCount: '' });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const createOrUpdateProduct = async () => {
    if (!productFormData.name || !productFormData.price) return;
    setProductSaving(true);
    try {
      const priceCents = Math.round(parseFloat(productFormData.price) * 100);
      const costCents = productFormData.cost ? Math.round(parseFloat(productFormData.cost) * 100) : undefined;
      const stock = productFormData.stockCount ? parseInt(productFormData.stockCount, 10) : undefined;

      if (editingProduct) {
        await fetch(`/api/clover/inventory/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productFormData.name,
            price: priceCents,
            cost: costCents,
            code: productFormData.code || undefined,
            description: productFormData.description || undefined,
            categoryId: productFormData.categoryId || undefined,
            stockCount: stock,
          }),
        });
      } else {
        await fetch('/api/clover/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: productFormData.name,
            price: priceCents,
            cost: costCents,
            code: productFormData.code || undefined,
            description: productFormData.description || undefined,
            categoryId: productFormData.categoryId || undefined,
            stockCount: stock,
          }),
        });
      }
      resetProductForm();
      fetchInventoryPage(inventoryOffset, inventorySearch || undefined);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setProductSaving(false);
    }
  };

  const deleteProduct = async (itemId: string) => {
    if (!confirm('Delete this product from Clover? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/clover/inventory/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setInventory(prev => prev.filter(i => i.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
  const btnHover = `${bgHover} cursor-pointer`;
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
    { key: 'applications', label: 'Applications', badge: pendingApplications || undefined },
    { key: 'best-sellers', label: 'Best Sellers' },
    { key: 'coupons', label: 'Coupons' },
    { key: 'price-compare', label: 'Price Compare' },
  ];

  const getStatusClasses = (status: string) => {
    const colors = statusColors[status];
    return colors ? (isDark ? colors.dark : colors.light) : '';
  };

  // Pagination button classes
  const paginationBtn = `px-4 py-2 border ${borderColor} ${textAccent} text-sm ${btnHover} transition-colors disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className={`min-h-screen ${bg} flex`}>
      {/* Sidebar */}
      <aside className={`w-64 ${bgSidebar} border-r ${borderColor} flex flex-col min-h-screen sticky top-0`}>
        <div className={`p-6 border-b ${borderColor}`}>
          <h1
            className={`text-2xl font-bold ${textAccent} font-oxanium`}
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
                      : `${textSecondary} ${btnHover}`
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
            className={`flex items-center gap-2 w-full px-4 py-2 ${textSecondary} ${btnHover} rounded-md transition-colors text-sm`}
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
            className={`block w-full text-left px-4 py-2 ${textSecondary} ${btnHover} rounded-md transition-colors text-sm`}
          >
            Refresh Data
          </button>
          <a
            href="/"
            className={`block px-4 py-2 ${textSecondary} ${btnHover} rounded-md transition-colors text-sm`}
          >
            &larr; Back to Site
          </a>
          <button
            onClick={handleLogout}
            className={`block w-full text-left px-4 py-2 ${isDark ? 'text-red-400' : 'text-red-600'} ${btnHover} rounded-md transition-colors text-sm`}
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
                      <button onClick={() => setActiveNav('orders')} className={`w-full py-2 ${textAccent} border ${borderColor} rounded-md ${btnHover} transition-colors text-sm`}>
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
                      <button onClick={() => setActiveNav('payments')} className={`w-full py-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'} border ${borderColor} rounded-md ${btnHover} transition-colors text-sm`}>
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
                <div className="flex gap-3">
                  <button
                    onClick={() => { resetProductForm(); setShowProductForm(true); }}
                    className={`px-5 py-2.5 ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-400/30' : 'bg-blue-50 text-blue-600 border-blue-200'} border rounded-md hover:opacity-80 transition-colors text-sm`}
                  >
                    + Add Product
                  </button>
                  <a href="/products" target="_blank" className={`px-5 py-2.5 border ${borderColor} ${textAccent} rounded-md ${btnHover} transition-colors text-sm`}>
                    View Store &rarr;
                  </a>
                </div>
              </div>

              {/* Product Form */}
              {showProductForm && (
                <div className={`${bgCard} border ${borderColor} rounded-lg p-6 mb-6`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Name *</label>
                      <input
                        type="text"
                        value={productFormData.name}
                        onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Pioneer DMH-1500NEX"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productFormData.price}
                        onChange={(e) => setProductFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productFormData.cost}
                        onChange={(e) => setProductFormData(prev => ({ ...prev, cost: e.target.value }))}
                        placeholder="0.00"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Barcode / SKU</label>
                      <input
                        type="text"
                        value={productFormData.code}
                        onChange={(e) => setProductFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="e.g. 884938377621"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Category</label>
                      <select
                        value={productFormData.categoryId}
                        onChange={(e) => setProductFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors cursor-pointer`}
                      >
                        <option value="">No Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Stock Count</label>
                      <input
                        type="number"
                        min="0"
                        value={productFormData.stockCount}
                        onChange={(e) => setProductFormData(prev => ({ ...prev, stockCount: e.target.value }))}
                        placeholder="0"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors`}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Description</label>
                    <textarea
                      value={productFormData.description}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      placeholder="Product description..."
                      className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-2.5 rounded-md text-sm focus:border-blue-500 focus:outline-none transition-colors resize-y`}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={createOrUpdateProduct}
                      disabled={!productFormData.name || !productFormData.price || productSaving}
                      className={`px-5 py-2.5 ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'} rounded-md hover:opacity-90 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed`}
                    >
                      {productSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                      onClick={resetProductForm}
                      className={`px-5 py-2.5 border ${borderColor} ${textSecondary} rounded-md ${btnHover} transition-colors text-sm`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

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
                        <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Actions</th>
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
                          <td className="px-6 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(item);
                                  setProductFormData({
                                    name: item.name,
                                    price: (item.price / 100).toFixed(2),
                                    cost: item.cost ? (item.cost / 100).toFixed(2) : '',
                                    code: item.code || '',
                                    description: item.description || '',
                                    categoryId: item.categories?.elements?.[0]?.id || '',
                                    stockCount: String(item.stockCount ?? 0),
                                  });
                                  setShowProductForm(true);
                                }}
                                className={`${textAccent} text-sm ${btnHover} px-2 py-1 rounded transition-colors`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(item.id)}
                                className={`${isDark ? 'text-red-400' : 'text-red-600'} text-sm ${btnHover} px-2 py-1 rounded transition-colors`}
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
                        <React.Fragment key={order.id}>
                          <tr
                            className={`border-b ${borderColor} ${bgHover} transition-colors cursor-pointer`}
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          >
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`}>&#9654;</span>
                                <div>
                                  <div className={`${textPrimary} text-sm`}>{order.id.slice(0, 8)}...</div>
                                  {order.note && <div className={`${textMuted} text-xs mt-0.5`}>{order.note.split('\n')[0]}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div className={`${textPrimary} text-sm`}>
                                {order.lineItems?.elements?.length || 0} item{(order.lineItems?.elements?.length || 0) !== 1 ? 's' : ''}
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
                          {expandedOrderId === order.id && (
                            <tr>
                              <td colSpan={5} className={`px-6 py-4 ${isDark ? 'bg-slate-800/30' : 'bg-slate-50/50'} border-b ${borderColor}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className={`${textSecondary} text-xs uppercase tracking-wide mb-2`}>Line Items</h4>
                                    {order.lineItems?.elements?.length ? (
                                      <div className="space-y-1">
                                        {order.lineItems.elements.map((li, i) => (
                                          <div key={li.id || i} className="flex justify-between text-sm">
                                            <span className={textPrimary}>{li.name}</span>
                                            <span className={textMuted}>{formatCents(li.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className={`${textMuted} text-sm`}>No line items</span>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <span className={`${textSecondary} text-xs uppercase tracking-wide`}>Order ID</span>
                                      <div className={`${textPrimary} text-sm font-mono`}>{order.id}</div>
                                    </div>
                                    <div>
                                      <span className={`${textSecondary} text-xs uppercase tracking-wide`}>Notes</span>
                                      {editingOrderNote === order.id ? (
                                        <div className="flex gap-2 mt-1">
                                          <input
                                            type="text"
                                            value={orderNoteValue}
                                            onChange={(e) => setOrderNoteValue(e.target.value)}
                                            className={`flex-1 px-2 py-1 text-sm border ${borderColor} ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-black'}`}
                                            placeholder="Order note..."
                                          />
                                          <button
                                            onClick={() => updateOrderNote(order.id, orderNoteValue)}
                                            disabled={orderActionLoading}
                                            className="px-2 py-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                          >Save</button>
                                          <button
                                            onClick={() => setEditingOrderNote(null)}
                                            className={`px-2 py-1 text-xs ${isDark ? 'bg-slate-600 text-white' : 'bg-slate-200 text-black'}`}
                                          >Cancel</button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <span className={`${textPrimary} text-sm`}>{order.note || '—'}</span>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setEditingOrderNote(order.id); setOrderNoteValue(order.note || ''); }}
                                            className={`text-xs ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                                          >Edit</button>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className={`${textSecondary} text-xs uppercase tracking-wide`}>Payment</span>
                                      <div className={`${textPrimary} text-sm`}>{order.paymentState || 'OPEN'} &middot; {order.state || '—'}</div>
                                    </div>
                                    {order.createdTime && (
                                      <div>
                                        <span className={`${textSecondary} text-xs uppercase tracking-wide`}>Created</span>
                                        <div className={`${textPrimary} text-sm`}>{formatDate(order.createdTime)}</div>
                                      </div>
                                    )}
                                    <div className="pt-2 flex gap-2">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                                        disabled={orderActionLoading}
                                        className="px-3 py-1 text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                      >Delete Order</button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.filter(c => c.firstName || c.lastName).map((customer) => {
                  const name = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
                  const email = customer.emailAddresses?.elements?.[0]?.emailAddress;
                  const phone = customer.phoneNumbers?.elements?.[0]?.phoneNumber;
                  return (
                    <div key={customer.id} className={`${bgCard} border ${borderColor} p-5 hover:border-blue-500/40 transition-colors`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 flex items-center justify-center text-lg font-bold ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {(customer.firstName?.[0] || customer.lastName?.[0] || '?').toUpperCase()}
                        </div>
                        <span className={`px-2 py-0.5 text-xs border ${
                          customer.marketingAllowed
                            ? isDark ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50'
                            : isDark ? 'text-red-400/60 border-red-400/20 bg-red-400/5' : 'text-red-500 border-red-200 bg-red-50'
                        }`}>
                          {customer.marketingAllowed ? 'Marketing: Yes' : 'Marketing: No'}
                        </span>
                      </div>
                      <h3 className={`${textPrimary} font-semibold text-lg mb-2`}>{name}</h3>
                      <div className="space-y-1">
                        {email && (
                          <div className="flex items-center gap-2">
                            <span className={`${textMuted} text-xs`}>Email:</span>
                            <a href={`mailto:${email}`} className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline truncate`}>{email}</a>
                          </div>
                        )}
                        {phone && (
                          <div className="flex items-center gap-2">
                            <span className={`${textMuted} text-xs`}>Phone:</span>
                            <a href={`tel:${phone}`} className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>{phone}</a>
                          </div>
                        )}
                        {!email && !phone && (
                          <div className={`${textMuted} text-sm`}>No contact info</div>
                        )}
                      </div>
                      <div className={`mt-3 pt-3 border-t ${borderColor} ${textMuted} text-xs`}>
                        Customer since {customer.customerSince ? formatDate(customer.customerSince) : 'Unknown'}
                      </div>
                    </div>
                  );
                })}
              </div>
              {customers.filter(c => c.firstName || c.lastName).length === 0 && <div className={`text-center ${textMuted} py-12 text-sm`}>No customers found.</div>}

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
                  className={`px-5 py-2.5 border ${borderColor} ${textAccent} rounded-md ${btnHover} transition-colors text-sm`}
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
                              className={`${isDark ? 'text-red-400' : 'text-red-600'} text-sm ${btnHover} px-2 py-1 rounded transition-colors ml-2`}
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
                            <div className={`${textPrimary} text-sm`}>{app.position || 'General Application'}</div>
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
          {activeNav === 'best-sellers' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Best Sellers</h2>
                  <p className={textSecondary}>
                    Products ranked by sales volume from Clover order history
                    {lastRefreshed && (
                      <span className={`${textMuted} ml-2`}>
                        — Last refreshed {new Date(lastRefreshed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={refreshBestSellers}
                  disabled={refreshing}
                  className={`px-5 py-2.5 border ${borderColor} ${textAccent} text-sm ${btnHover} transition-colors disabled:opacity-50 flex items-center gap-2`}
                >
                  {refreshing ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh Data'
                  )}
                </button>
              </div>

              {bestSellersLoading ? (
                <div className={`text-center ${textMuted} py-12`}>Loading best sellers...</div>
              ) : bestSellers.length === 0 ? (
                <div className={`${bgCard} border ${borderColor} rounded-lg p-12 text-center`}>
                  <p className={`${textMuted} text-sm mb-4`}>No best sellers data yet. Click &ldquo;Refresh Data&rdquo; to aggregate sales from Clover orders.</p>
                  <button
                    onClick={refreshBestSellers}
                    disabled={refreshing}
                    className={`px-5 py-2.5 border ${borderColor} ${textAccent} text-sm ${btnHover} transition-colors disabled:opacity-50`}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh Now'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                      <p className={`${textMuted} text-xs uppercase tracking-wide mb-1`}>Total Products Sold</p>
                      <p className={`${textPrimary} text-2xl font-bold`}>
                        {bestSellers.reduce((sum, bs) => sum + bs.total_quantity_sold, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                      <p className={`${textMuted} text-xs uppercase tracking-wide mb-1`}>Total Revenue</p>
                      <p className={`${textPrimary} text-2xl font-bold`}>
                        {formatCents(bestSellers.reduce((sum, bs) => sum + bs.total_revenue_cents, 0))}
                      </p>
                    </div>
                    <div className={`${bgCard} border ${borderColor} rounded-lg p-5`}>
                      <p className={`${textMuted} text-xs uppercase tracking-wide mb-1`}>Unique Products</p>
                      <p className={`${textPrimary} text-2xl font-bold`}>
                        {bestSellers.length}
                      </p>
                    </div>
                  </div>

                  {/* Rankings table */}
                  <div className={`${bgCard} border ${borderColor} rounded-lg overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>#</th>
                            <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Product</th>
                            <th className={`px-6 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Qty Sold</th>
                            <th className={`px-6 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Revenue</th>
                            <th className={`px-6 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Orders</th>
                            <th className={`px-6 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Last Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bestSellers.map((bs, idx) => (
                            <tr key={bs.id} className={`border-b ${borderColor} ${bgHover} transition-colors`}>
                              <td className={`px-6 py-3 ${textMuted} text-sm font-mono`}>
                                {idx + 1}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  {idx < 3 && (
                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                      idx === 0
                                        ? 'bg-yellow-400/20 text-yellow-400'
                                        : idx === 1
                                        ? 'bg-slate-300/20 text-slate-300'
                                        : 'bg-amber-600/20 text-amber-600'
                                    }`}>
                                      {idx === 0 ? '1ST' : idx === 1 ? '2ND' : '3RD'}
                                    </span>
                                  )}
                                  <span className={`${textPrimary} text-sm font-medium`}>{bs.item_name}</span>
                                </div>
                              </td>
                              <td className={`px-6 py-3 text-right ${textPrimary} text-sm font-mono font-bold`}>
                                {bs.total_quantity_sold.toLocaleString()}
                              </td>
                              <td className={`px-6 py-3 text-right ${isDark ? 'text-emerald-400' : 'text-emerald-600'} text-sm font-mono`}>
                                {formatCents(bs.total_revenue_cents)}
                              </td>
                              <td className={`px-6 py-3 text-right ${textSecondary} text-sm font-mono`}>
                                {bs.order_count.toLocaleString()}
                              </td>
                              <td className={`px-6 py-3 text-right ${textMuted} text-sm`}>
                                {bs.last_sold_at
                                  ? new Date(bs.last_sold_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

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

          {activeNav === 'coupons' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className={`text-3xl font-bold ${textPrimary} mb-1`}>Coupons</h2>
                  <p className={textSecondary}>Create and manage discount coupons</p>
                </div>
                <button
                  onClick={() => setShowCouponForm(!showCouponForm)}
                  className={`px-4 py-2 border ${borderColor} ${textAccent} text-sm ${btnHover} transition-colors`}
                >
                  {showCouponForm ? 'CANCEL' : '+ NEW COUPON'}
                </button>
              </div>

              {/* Create Coupon Form */}
              {showCouponForm && (
                <div className={`${bgCard} border ${borderColor} p-6 mb-6`}>
                  <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Create Coupon</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Code *</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. SAVE20"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none uppercase`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Type *</label>
                      <select
                        value={couponForm.type}
                        onChange={(e) => setCouponForm(p => ({ ...p, type: e.target.value as 'percent' | 'fixed' }))}
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
                      >
                        <option value="percent">Percent Off (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>
                        Value * {couponForm.type === 'percent' ? '(%)' : '($)'}
                      </label>
                      <input
                        type="number"
                        value={couponForm.value}
                        onChange={(e) => setCouponForm(p => ({ ...p, value: e.target.value }))}
                        placeholder={couponForm.type === 'percent' ? '20' : '10.00'}
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Min Order ($)</label>
                      <input
                        type="number"
                        value={couponForm.min_order_cents}
                        onChange={(e) => setCouponForm(p => ({ ...p, min_order_cents: e.target.value }))}
                        placeholder="Optional"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Max Uses</label>
                      <input
                        type="number"
                        value={couponForm.max_uses}
                        onChange={(e) => setCouponForm(p => ({ ...p, max_uses: e.target.value }))}
                        placeholder="Unlimited"
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
                      />
                    </div>
                    <div>
                      <label className={`block ${textSecondary} text-xs uppercase tracking-wide mb-1`}>Expires At</label>
                      <input
                        type="date"
                        value={couponForm.expires_at}
                        onChange={(e) => setCouponForm(p => ({ ...p, expires_at: e.target.value }))}
                        className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none`}
                      />
                    </div>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-sm mb-3">{couponError}</p>
                  )}
                  <button
                    onClick={handleCreateCoupon}
                    disabled={couponSaving || !couponForm.code || !couponForm.value}
                    className={`px-6 py-2 border ${borderColor} ${textAccent} text-sm ${btnHover} transition-colors disabled:opacity-30`}
                  >
                    {couponSaving ? 'CREATING...' : 'CREATE COUPON'}
                  </button>
                </div>
              )}

              {/* Coupons Table */}
              {couponsLoading ? (
                <div className={`text-center ${textMuted} py-12`}>Loading coupons...</div>
              ) : coupons.length === 0 ? (
                <div className={`${bgCard} border ${borderColor} text-center ${textMuted} py-12 text-sm`}>
                  No coupons yet. Create one to get started.
                </div>
              ) : (
                <div className={`${bgCard} border ${borderColor} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                          <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Code</th>
                          <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Discount</th>
                          <th className={`px-6 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Min Order</th>
                          <th className={`px-6 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Usage</th>
                          <th className={`px-6 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Expires</th>
                          <th className={`px-6 py-3 text-center ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Status</th>
                          <th className={`px-6 py-3 text-center ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((c) => (
                          <tr key={c.id} className={`border-b ${borderColor} ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
                            <td className={`px-6 py-3 ${textPrimary} font-mono font-bold text-sm`}>{c.code}</td>
                            <td className={`px-6 py-3 ${textPrimary} text-sm`}>
                              {c.type === 'percent' ? `${c.value}%` : formatCents(c.value)}
                            </td>
                            <td className={`px-6 py-3 text-right ${textSecondary} text-sm font-mono`}>
                              {c.min_order_cents ? formatCents(c.min_order_cents) : '—'}
                            </td>
                            <td className={`px-6 py-3 text-right ${textPrimary} text-sm font-mono`}>
                              {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                            </td>
                            <td className={`px-6 py-3 ${textSecondary} text-sm`}>
                              {c.expires_at
                                ? new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Never'}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className={`px-2 py-0.5 border text-xs font-mono uppercase ${
                                c.is_active
                                  ? (isDark ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-emerald-600 bg-emerald-50 border-emerald-200')
                                  : (isDark ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-red-600 bg-red-50 border-red-200')
                              }`}>
                                {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button
                                onClick={() => handleToggleCoupon(c.id, c.is_active)}
                                className={`text-xs ${textAccent} ${btnHover} transition-colors px-3 py-1 border ${borderColor}`}
                              >
                                {c.is_active ? 'DISABLE' : 'ENABLE'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Compare Tab */}
          {activeNav === 'price-compare' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-semibold ${textPrimary} font-oxanium`}>
                    PRICE COMPARE
                  </h2>
                  <p className={`${textMuted} text-sm mt-1`}>
                    Search 7 distributors for the best price
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className={`${bgCard} border ${borderColor} p-6 mb-6`}>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Enter product name or SKU (e.g. CS7900-AS, dash kit, remote start)..."
                      value={priceQuery}
                      onChange={(e) => setPriceQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchPrices()}
                      className={`w-full ${bgInput} border ${borderColor} ${textPrimary} px-4 py-3 text-sm focus:border-blue-500 focus:outline-none placeholder:${textMuted}`}
                    />
                    {priceSearchHistory.length > 0 && !priceSearching && (
                      <div className={`mt-2 flex flex-wrap gap-2`}>
                        <span className={`${textMuted} text-xs`}>Recent:</span>
                        {priceSearchHistory.map((h, i) => (
                          <button
                            key={i}
                            onClick={() => { setPriceQuery(h); }}
                            className={`text-xs px-2 py-0.5 border ${borderColor} ${textSecondary} ${btnHover} transition-colors`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={searchPrices}
                    disabled={priceSearching || !priceQuery.trim()}
                    className={`px-8 py-3 border ${borderColor} ${textAccent} text-sm font-medium ${btnHover} transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap`}
                  >
                    {priceSearching ? 'SEARCHING...' : 'SEARCH'}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {priceSearching && (
                <div className={`${bgCard} border ${borderColor} p-12 text-center`}>
                  <div className={`${textAccent} text-lg mb-2 font-oxanium`}>Searching distributors...</div>
                  <p className={`${textMuted} text-sm`}>
                    Checking iDatalink, Meyer, Directechs, Firstech, ECUSAD, Specialty Marketing, Metra Online
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${isDark ? 'bg-blue-400' : 'bg-blue-600'} animate-pulse`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {!priceSearching && priceSearchedAt && (
                <div>
                  {/* Summary */}
                  <div className={`flex items-center justify-between mb-4`}>
                    <p className={`${textSecondary} text-sm`}>
                      {priceResults.length} result{priceResults.length !== 1 ? 's' : ''} found
                      {priceErrors.length > 0 && (
                        <span className={`ml-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          ({priceErrors.length} distributor{priceErrors.length !== 1 ? 's' : ''} failed)
                        </span>
                      )}
                    </p>
                    <p className={`${textMuted} text-xs`}>
                      Searched at {new Date(priceSearchedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Results Table */}
                  {priceResults.length > 0 ? (
                    <div className={`${bgCard} border ${borderColor} overflow-hidden mb-6`}>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${borderColor} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                              <th className={`px-4 py-3 text-center ${textSecondary} font-medium text-xs uppercase tracking-wide w-10`}>#</th>
                              <th className={`px-4 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Distributor</th>
                              <th className={`px-4 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Product</th>
                              <th className={`px-4 py-3 text-left ${textSecondary} font-medium text-xs uppercase tracking-wide`}>SKU</th>
                              <th className={`px-4 py-3 text-right ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Price</th>
                              <th className={`px-4 py-3 text-center ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Match</th>
                              <th className={`px-4 py-3 text-center ${textSecondary} font-medium text-xs uppercase tracking-wide`}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {priceResults.map((r, idx) => {
                              const isBest = idx === 0 && r.priceCents !== null;
                              const rowBg = isBest
                                ? (isDark ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : 'bg-emerald-50 border-l-2 border-l-emerald-500')
                                : '';
                              return (
                                <tr key={idx} className={`border-b ${borderColor} ${rowBg} ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}>
                                  <td className={`px-4 py-3 text-center ${textMuted} text-sm font-mono`}>
                                    {isBest ? (
                                      <span className={`px-2 py-0.5 text-xs font-bold ${isDark ? 'text-emerald-400 bg-emerald-400/10' : 'text-emerald-600 bg-emerald-50'}`}>
                                        BEST
                                      </span>
                                    ) : (
                                      idx + 1
                                    )}
                                  </td>
                                  <td className={`px-4 py-3 text-sm`}>
                                    <div className={`${textPrimary} font-medium`}>{r.distributor}</div>
                                  </td>
                                  <td className={`px-4 py-3 text-sm`}>
                                    <div className={`${textPrimary}`}>{r.productName}</div>
                                  </td>
                                  <td className={`px-4 py-3 ${textSecondary} text-sm font-mono`}>
                                    {r.sku || '—'}
                                  </td>
                                  <td className={`px-4 py-3 text-right text-sm font-mono font-bold ${
                                    r.priceCents !== null
                                      ? (isBest ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : textPrimary)
                                      : textMuted
                                  }`}>
                                    {r.priceDisplay}
                                  </td>
                                  <td className={`px-4 py-3 text-center`}>
                                    <span className={`px-2 py-0.5 border text-xs font-mono uppercase ${
                                      r.matchConfidence === 'exact'
                                        ? (isDark ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-emerald-600 bg-emerald-50 border-emerald-200')
                                        : r.matchConfidence === 'high'
                                        ? (isDark ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' : 'text-blue-600 bg-blue-50 border-blue-200')
                                        : (isDark ? 'text-slate-400 bg-slate-400/10 border-slate-400/30' : 'text-slate-500 bg-slate-50 border-slate-200')
                                    }`}>
                                      {r.matchConfidence}
                                    </span>
                                  </td>
                                  <td className={`px-4 py-3 text-center`}>
                                    <a
                                      href={r.productUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`text-xs ${textAccent} ${btnHover} transition-colors px-3 py-1 border ${borderColor} inline-block`}
                                    >
                                      VIEW / ORDER
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={`${bgCard} border ${borderColor} text-center ${textMuted} py-12 text-sm`}>
                      No results found. Try a different product name or SKU.
                    </div>
                  )}

                  {/* Errors Section */}
                  {priceErrors.length > 0 && (
                    <div className={`${bgCard} border ${borderColor} p-4`}>
                      <p className={`${isDark ? 'text-amber-400' : 'text-amber-600'} text-xs font-medium mb-2 uppercase tracking-wide`}>
                        Failed Distributors
                      </p>
                      <div className="space-y-1">
                        {priceErrors.map((err, idx) => (
                          <div key={idx} className={`flex items-center gap-2 ${textMuted} text-xs`}>
                            <span className={`w-1.5 h-1.5 ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`} />
                            <span className={`${textSecondary} font-medium`}>{err.distributor}:</span>
                            <span>{err.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State — before first search */}
              {!priceSearching && !priceSearchedAt && (
                <div className={`${bgCard} border ${borderColor} p-12 text-center`}>
                  <div className={`${textMuted} text-4xl mb-4`}>&#128269;</div>
                  <p className={`${textSecondary} text-sm mb-2`}>
                    Enter a product name or SKU to compare prices across all distributors.
                  </p>
                  <div className={`${textMuted} text-xs space-y-1`}>
                    <p>Searches: iDatalink, Meyer Distributing, Directechs, Firstech, ECUSAD, Specialty Marketing, Metra Online</p>
                    <p>Results include dealer pricing where available, with links to place orders directly.</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
