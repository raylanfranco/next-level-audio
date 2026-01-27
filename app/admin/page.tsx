'use client';

import { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '@/types/booking';
import { Product, PRODUCT_BADGES } from '@/types/product';

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/30',
  completed: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
};

const serviceNames = {
  'window-tinting': 'Window Tinting',
  'car-audio': 'Car Audio',
  'remote-start': 'Remote Start',
  'security-systems': 'Security Systems',
  'lighting': 'Custom Lighting',
  'accessories': 'Auto Accessories',
};

type NavItem = 'overview' | 'bookings' | 'products';

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState<NavItem>('overview');
  const [productFilter, setProductFilter] = useState<'all' | 'clover' | 'affiliate'>('all');

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
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      setProducts(data.products || []);
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

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured }),
      });

      if (response.ok) {
        const { product: updated } = await response.json();
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, featured: !p.featured } : p));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Calculate stats
  const cloverProducts = products.filter(p => p.source === 'clover');
  const affiliateProducts = products.filter(p => p.source === 'affiliate');

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalProducts: products.length,
    cloverProducts: cloverProducts.length,
    affiliateProducts: affiliateProducts.length,
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (productFilter === 'all') return true;
    return p.source === productFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#00A0E0] text-lg font-mono">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-[#00A0E0]/20 flex flex-col">
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
            <li>
              <button
                onClick={() => setActiveNav('overview')}
                className={`w-full text-left px-4 py-3 transition-colors font-mono text-sm ${
                  activeNav === 'overview'
                    ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                    : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                }`}
              >
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveNav('bookings')}
                className={`w-full text-left px-4 py-3 transition-colors font-mono text-sm ${
                  activeNav === 'bookings'
                    ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                    : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                }`}
              >
                Bookings
                {stats.pendingBookings > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs border border-yellow-400/30">
                    {stats.pendingBookings}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveNav('products')}
                className={`w-full text-left px-4 py-3 transition-colors font-mono text-sm ${
                  activeNav === 'products'
                    ? 'bg-[#00A0E0]/10 text-[#00A0E0] border-l-2 border-[#00A0E0]'
                    : 'text-[#00A0E0]/60 hover:text-[#00A0E0] hover:bg-[#00A0E0]/5'
                }`}
              >
                Products
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-[#00A0E0]/20">
          <a
            href="/"
            className="block px-4 py-2 text-[#00A0E0]/60 hover:text-[#00A0E0] transition-colors font-mono text-sm"
          >
            ← Back to Site
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Overview Tab */}
          {activeNav === 'overview' && (
            <div>
              <div className="mb-8">
                <h2
                  className="text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  Dashboard Overview
                </h2>
                <p className="text-[#00A0E0]/60 font-mono">Welcome back! Here's what's happening today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-black border border-[#00A0E0]/30 p-6">
                  <div className="text-[#00A0E0]/60 text-sm font-mono mb-2">Total Bookings</div>
                  <div
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {stats.totalBookings}
                  </div>
                </div>

                <div className="bg-black border border-yellow-400/30 p-6">
                  <div className="text-yellow-400/80 text-sm font-mono mb-2">Pending</div>
                  <div
                    className="text-3xl font-bold text-yellow-400"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {stats.pendingBookings}
                  </div>
                </div>

                <div className="bg-black border border-green-400/30 p-6">
                  <div className="text-green-400/80 text-sm font-mono mb-2">Confirmed</div>
                  <div
                    className="text-3xl font-bold text-green-400"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {stats.confirmedBookings}
                  </div>
                </div>

                <div className="bg-black border border-[#00A0E0]/30 p-6">
                  <div className="text-[#00A0E0]/60 text-sm font-mono mb-2">Products</div>
                  <div
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    {stats.totalProducts}
                  </div>
                  <div className="text-[#00A0E0]/40 text-xs font-mono mt-2">
                    {stats.cloverProducts} Clover • {stats.affiliateProducts} Affiliate
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-black border border-[#00A0E0]/30 p-6">
                <h3
                  className="text-xl font-bold text-[#00A0E0] mb-4"
                  style={{ fontFamily: 'var(--font-oxanium)' }}
                >
                  Recent Bookings
                </h3>
                {bookings.length === 0 ? (
                  <p className="text-[#00A0E0]/40 font-mono text-sm">No bookings yet</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#00A0E0]/20 hover:border-[#00A0E0]/40 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="text-white font-mono font-semibold">{booking.customer_name}</div>
                            <div className="text-[#00A0E0]/60 text-sm font-mono">
                              {serviceNames[booking.service_type as keyof typeof serviceNames]} • {new Date(booking.appointment_date).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-mono border ${statusColors[booking.status]}`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {bookings.length > 5 && (
                      <button
                        onClick={() => setActiveNav('bookings')}
                        className="mt-4 w-full py-2 text-[#00A0E0] border border-[#00A0E0]/30 hover:border-[#00A0E0] transition-colors font-mono text-sm"
                      >
                        View All Bookings
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeNav === 'bookings' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2
                    className="text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
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
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          CUSTOMER
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          SERVICE
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          DATE & TIME
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          STATUS
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-[#00A0E0]/10 hover:bg-[#00A0E0]/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-mono">
                              <div className="text-white font-semibold">{booking.customer_name}</div>
                              <div className="text-[#00A0E0]/60 text-sm">{booking.customer_email}</div>
                              <div className="text-[#00A0E0]/60 text-sm">{booking.customer_phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono">
                              <div className="text-white">{serviceNames[booking.service_type as keyof typeof serviceNames]}</div>
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

          {/* Products Tab */}
          {activeNav === 'products' && (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2
                    className="text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-oxanium)' }}
                  >
                    Products
                  </h2>
                  <p className="text-[#00A0E0]/60 font-mono">Manage Clover inventory and affiliate products</p>
                </div>
                <a
                  href="/products"
                  target="_blank"
                  className="px-6 py-3 border border-[#00A0E0]/30 text-[#00A0E0] font-mono hover:border-[#00A0E0] transition-colors"
                >
                  View Store →
                </a>
              </div>

              {/* Product Type Filter */}
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setProductFilter('all')}
                  className={`px-4 py-2 font-mono text-sm border transition-colors ${
                    productFilter === 'all'
                      ? 'bg-[#00A0E0]/20 text-[#00A0E0] border-[#00A0E0]'
                      : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                  }`}
                >
                  All Products ({stats.totalProducts})
                </button>
                <button
                  onClick={() => setProductFilter('clover')}
                  className={`px-4 py-2 font-mono text-sm border transition-colors ${
                    productFilter === 'clover'
                      ? 'bg-green-400/20 text-green-400 border-green-400/50'
                      : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                  }`}
                >
                  Clover Inventory ({stats.cloverProducts})
                </button>
                <button
                  onClick={() => setProductFilter('affiliate')}
                  className={`px-4 py-2 font-mono text-sm border transition-colors ${
                    productFilter === 'affiliate'
                      ? 'bg-blue-400/20 text-blue-400 border-blue-400/50'
                      : 'bg-black text-[#00A0E0]/60 border-[#00A0E0]/30 hover:border-[#00A0E0]/60'
                  }`}
                >
                  Affiliate Products ({stats.affiliateProducts})
                </button>
              </div>

              <div className="bg-black border border-[#00A0E0]/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#00A0E0]/30">
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          PRODUCT
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          SOURCE
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          AVAILABILITY
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          PRICE
                        </th>
                        <th className="px-6 py-4 text-left text-[#00A0E0] font-mono font-semibold text-sm">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const badge = PRODUCT_BADGES[product.availability];
                        return (
                          <tr
                            key={product.id}
                            className="border-b border-[#00A0E0]/10 hover:bg-[#00A0E0]/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                {product.images && product.images.length > 0 && (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.title}
                                    className="w-12 h-12 object-cover border border-[#00A0E0]/20"
                                  />
                                )}
                                <div className="font-mono">
                                  <div className="text-white font-semibold flex items-center gap-2">
                                    {product.title}
                                    {product.featured && (
                                      <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs border border-yellow-400/30">
                                        FEATURED
                                      </span>
                                    )}
                                  </div>
                                  {product.brand && (
                                    <div className="text-[#00A0E0]/60 text-sm">{product.brand}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-mono border ${
                                product.source === 'clover'
                                  ? 'bg-green-400/10 text-green-400 border-green-400/30'
                                  : product.source === 'affiliate'
                                  ? 'bg-blue-400/10 text-blue-400 border-blue-400/30'
                                  : 'bg-[#00A0E0]/10 text-[#00A0E0] border-[#00A0E0]/30'
                              }`}>
                                {product.source.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-mono border ${
                                badge.color === 'green' ? 'bg-green-400/10 text-green-400 border-green-400/30' :
                                badge.color === 'blue' ? 'bg-blue-400/10 text-blue-400 border-blue-400/30' :
                                badge.color === 'yellow' ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30' :
                                'bg-red-400/10 text-red-400 border-red-400/30'
                              }`}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white font-mono font-semibold">
                                ${product.price.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleFeatured(product)}
                                  className="px-3 py-1 border border-[#00A0E0]/30 text-[#00A0E0] hover:border-[#00A0E0] transition-colors font-mono text-xs"
                                  title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                                >
                                  {product.featured ? '★' : '☆'}
                                </button>
                                {product.source === 'affiliate' && product.affiliateUrl && (
                                  <a
                                    href={product.affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 border border-blue-400/30 text-blue-400 hover:border-blue-400 transition-colors font-mono text-xs"
                                  >
                                    View Link
                                  </a>
                                )}
                                {product.source !== 'clover' && (
                                  <button
                                    onClick={() => deleteProduct(product.id)}
                                    className="px-3 py-1 border border-red-400/30 text-red-400 hover:border-red-400 transition-colors font-mono text-xs"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-[#00A0E0]/60 font-mono mb-4">
                      No products found. {productFilter === 'all' ? 'Run schema.sql to populate sample data.' : `No ${productFilter} products.`}
                    </div>
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
