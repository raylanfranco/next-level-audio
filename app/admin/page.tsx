'use client';

import { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '@/types/booking';
import { ShopifyProduct } from '@/types/shopify';

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/20',
  confirmed: 'text-green-400 bg-green-400/20',
  completed: 'text-blue-400 bg-blue-400/20',
  cancelled: 'text-red-400 bg-red-400/20',
};

const serviceNames = {
  'window-tinting': 'Window Tinting',
  'car-audio': 'Car Audio',
  'remote-start': 'Remote Start',
  'security-systems': 'Security Systems',
  'lighting': 'Custom Lighting',
  'accessories': 'Auto Accessories',
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'products'>('bookings');

  useEffect(() => {
    fetchBookings();
    fetchProducts();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/shopify/products');
      const data = await response.json();
      setProducts(data.products.edges.map((edge: any) => edge.node));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    // Mock update - in real app, this would call an API
    setBookings(prev =>
      prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus, updated_at: new Date().toISOString() }
          : booking
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#00A0E0] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="relative pt-32 pb-20 bg-black overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-[#00A0E0] text-sm uppercase tracking-widest mb-4 font-semibold neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
              ADMIN PANEL
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
              DASHBOARD
            </h1>
            <p className="text-[#00A0E0]/80 text-lg md:text-xl max-w-2xl mx-auto font-mono">
              Manage bookings and products for Next Level Audio
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
        <div className="absolute inset-0 cyber-grid opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-black/50 border-2 border-[#00A0E0]/30 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-2 font-semibold transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0]'
                    : 'text-[#00A0E0]/60 hover:text-[#00A0E0]'
                }`}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                BOOKINGS
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-2 font-semibold transition-colors ${
                  activeTab === 'products'
                    ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0]'
                    : 'text-[#00A0E0]/60 hover:text-[#00A0E0]'
                }`}
                style={{ fontFamily: 'var(--font-oxanium)' }}
              >
                PRODUCTS
              </button>
            </div>
          </div>

          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-3xl font-bold text-[#00A0E0] mb-8 text-center neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                BOOKING MANAGEMENT
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-[#00A0E0]/30">
                  <thead>
                    <tr className="border-b-2 border-[#00A0E0]/30">
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>CUSTOMER</th>
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>SERVICE</th>
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>DATE/TIME</th>
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>STATUS</th>
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-[#00A0E0]/20 hover:bg-[#00A0E0]/5">
                        <td className="px-4 py-3">
                          <div className="text-[#00A0E0]/80 font-mono">
                            <div className="font-semibold">{booking.customer_name}</div>
                            <div className="text-sm">{booking.customer_email}</div>
                            <div className="text-sm">{booking.customer_phone}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[#00A0E0]/80 font-mono">
                            <div>{serviceNames[booking.service_type as keyof typeof serviceNames]}</div>
                            {booking.vehicle_make && (
                              <div className="text-sm">
                                {booking.vehicle_year} {booking.vehicle_make} {booking.vehicle_model}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[#00A0E0]/80 font-mono">
                            <div>{new Date(booking.appointment_date).toLocaleDateString()}</div>
                            <div>{booking.appointment_time}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-sm font-mono ${statusColors[booking.status]}`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={booking.status}
                            onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                            className="bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] px-2 py-1 font-mono text-sm focus:border-[#00A0E0]"
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
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2 className="text-3xl font-bold text-[#00A0E0] mb-8 text-center neon-glow-soft" style={{ fontFamily: 'var(--font-oxanium)' }}>
                PRODUCT MANAGEMENT
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-[#00A0E0]/30">
                  <thead>
                    <tr className="border-b-2 border-[#00A0E0]/30">
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>PRODUCT</th>
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>PRICE</th>
                      <th className="px-4 py-3 text-left text-[#00A0E0] font-semibold" style={{ fontFamily: 'var(--font-oxanium)' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-[#00A0E0]/20 hover:bg-[#00A0E0]/5">
                        <td className="px-4 py-3">
                          <div className="text-[#00A0E0]/80 font-mono">
                            <div className="font-semibold">{product.title}</div>
                            <div className="text-sm">{product.description}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[#00A0E0]/80 font-mono">
                            {product.priceRange.minVariantPrice.amount} {product.priceRange.minVariantPrice.currencyCode}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button className="px-3 py-1 border border-[#00A0E0]/50 text-[#00A0E0] hover:border-[#00A0E0] transition-colors font-mono text-sm">
                            EDIT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="text-center text-[#00A0E0]/60 font-mono py-8">
                    No products found. Configure Shopify to see products here.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}