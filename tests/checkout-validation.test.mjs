import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCheckout } from '../lib/checkout-validation.ts';
const catalog = [{ id: 'item', name: 'Speaker', price: 10000 }];
const input = () => ({ amount: 20000, orderData: { items: [{ id: 'item', name: 'Untrusted name', price: 10000, quantity: 2 }], subtotal_cents: 20000, total_cents: 20000, discount_cents: 0, vip_discount_cents: 0, coupon_id: null } });
test('uses catalog names and prices', () => assert.equal(validateCheckout(input(), catalog, null, false).items[0].name, 'Speaker'));
test('rejects underpayment and inflated reward totals', () => {
  const underpaid = input(); underpaid.amount = 1;
  assert.throws(() => validateCheckout(underpaid, catalog, null, false));
  const inflated = input(); inflated.orderData.total_cents = 9999999;
  assert.throws(() => validateCheckout(inflated, catalog, null, false));
});
test('rejects forged item prices, duplicates and invalid quantities', () => {
  for (const change of [x => x.orderData.items[0].price = 1, x => x.orderData.items.push(x.orderData.items[0]), x => x.orderData.items[0].quantity = -1]) {
    const x = input(); change(x); assert.throws(() => validateCheckout(x, catalog, null, false));
  }
});
test('validates VIP eligibility and prevents stacking', () => {
  const x = input(); x.amount = x.orderData.total_cents = 18000; x.orderData.discount_cents = x.orderData.vip_discount_cents = 2000;
  assert.equal(validateCheckout(x, catalog, null, true).total_cents, 18000);
  assert.throws(() => validateCheckout(x, catalog, null, false));
  x.orderData.coupon_id = 'coupon'; assert.throws(() => validateCheckout(x, catalog, null, true));
});
test('checks coupon expiry, usage cap and server-calculated discount', () => {
  const x = input(); x.orderData.coupon_id = 'coupon'; x.amount = x.orderData.total_cents = 18000; x.orderData.discount_cents = 2000;
  const coupon = { id: 'coupon', type: 'percent', value: 10, is_active: true, expires_at: null, max_uses: 1, used_count: 0, min_order_cents: 0 };
  assert.equal(validateCheckout(x, catalog, coupon, false).total_cents, 18000);
  assert.throws(() => validateCheckout(x, catalog, { ...coupon, used_count: 1 }, false));
  assert.throws(() => validateCheckout(x, catalog, { ...coupon, expires_at: '2020-01-01' }, false));
});
