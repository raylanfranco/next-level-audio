'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  CloverItem,
  CloverOrder,
  CloverCustomer,
  CloverPayment,
  CloverCategory,
} from '@/types/clover';
import type { Booking } from '@/types/booking';
import type { Inquiry } from '@/types/inquiry';
import type { CareerApplication } from '@/types/career';
import { PAGE_SIZE } from '../_lib/constants';

interface AdminData {
  // Overview datasets (fetched once, consumed by the Overview page).
  inventory: CloverItem[];
  inventoryCount: number;
  categories: CloverCategory[];
  orders: CloverOrder[];
  payments: CloverPayment[];
  customers: CloverCustomer[];
  bookings: Booking[];
  inquiries: Inquiry[];
  applications: CareerApplication[];
  // Badge counts (derived).
  pendingBookings: number;
  pendingInquiries: number;
  pendingApplications: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AdminDataContext = createContext<AdminData | null>(null);

export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<CloverItem[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [categories, setCategories] = useState<CloverCategory[]>([]);
  const [orders, setOrders] = useState<CloverOrder[]>([]);
  const [payments, setPayments] = useState<CloverPayment[]>([]);
  const [customers, setCustomers] = useState<CloverCustomer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Preserve the original Promise.allSettled partial-failure tolerance verbatim.
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, catRes, ordRes, payRes, custRes, bookRes, inqRes, appsRes] =
        await Promise.allSettled([
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
    refresh();
  }, [refresh]);

  const value: AdminData = {
    inventory,
    inventoryCount,
    categories,
    orders,
    payments,
    customers,
    bookings,
    inquiries,
    applications,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    pendingInquiries: inquiries.filter((i) => i.status === 'pending').length,
    pendingApplications: applications.filter((a) => a.status === 'pending').length,
    loading,
    refresh,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
