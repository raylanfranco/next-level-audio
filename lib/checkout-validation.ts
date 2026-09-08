export interface CheckoutItem { id: string; name: string; price: number; quantity: number }
export interface CheckoutCoupon { id: string; type: string; value: number; is_active: boolean; expires_at: string | null; max_uses: number | null; used_count: number; min_order_cents: number | null }
export class CheckoutValidationError extends Error {}

export function validateCheckout(input: {
  amount: number;
  orderData: { items: CheckoutItem[]; subtotal_cents: number; total_cents: number; discount_cents: number; vip_discount_cents: number; coupon_id: string | null };
}, catalog: { id: string; name: string; price: number; deleted?: boolean; available?: boolean }[], coupon: CheckoutCoupon | null, vip: boolean, now = new Date()) {
  const od = input.orderData;
  const items = od.items.map(item => {
    const product = catalog.find(p => p.id === item.id);
    if (!product || product.deleted || product.available === false || !Number.isSafeInteger(product.price) || product.price < 1 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new CheckoutValidationError('An item is unavailable. Please review your cart.');
    return { id: product.id, name: product.name, price: product.price, quantity: item.quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!items.length || new Set(items.map(i => i.id)).size !== items.length || !Number.isSafeInteger(subtotal)) throw new CheckoutValidationError('Invalid cart');
  let discount = 0;
  if (od.coupon_id) {
    if (!coupon || coupon.id !== od.coupon_id || !coupon.is_active ||
        (coupon.expires_at && (!Number.isFinite(Date.parse(coupon.expires_at)) || Date.parse(coupon.expires_at) <= now.getTime())) ||
        (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) || subtotal < (coupon.min_order_cents ?? 0) ||
        !Number.isSafeInteger(coupon.value) || coupon.value < 0 || !['percent', 'fixed'].includes(coupon.type)) throw new CheckoutValidationError('Coupon is no longer valid');
    discount = Math.min(subtotal, coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100) : coupon.value);
  }
  if (od.vip_discount_cents > 0) {
    if (!vip || od.coupon_id) throw new CheckoutValidationError('VIP discount could not be verified');
    discount = Math.round(subtotal * 10 / 100);
    if (od.vip_discount_cents !== discount) throw new CheckoutValidationError('VIP discount changed. Please review your cart.');
  }
  const total = subtotal - discount;
  if (total < 1 || input.amount !== total || od.total_cents !== total || od.subtotal_cents !== subtotal || od.discount_cents !== discount || od.items.some((item, i) => item.price !== items[i].price)) throw new CheckoutValidationError('Your cart total changed. Please refresh and review your cart before paying.');
  return { items, subtotal_cents: subtotal, discount_cents: discount, total_cents: total };
}
