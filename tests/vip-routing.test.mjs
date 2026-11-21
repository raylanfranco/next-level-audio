import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { transformSync } from '@swc/core';

const require = createRequire(import.meta.url);
const { NextRequest, NextResponse } = require('next/server');
const origin = 'https://nextlevelaudiopa.com';
const customer = { id: 'customer-123', email: 'vip@example.test' };

// Execute the real route functions while isolating auth and Stripe from live services.
function loadRoute(path, dependencies, env = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const { code } = transformSync(source, {
    filename: path,
    jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    module: { type: 'commonjs' },
  });
  const loadedModule = { exports: {} };
  const mockedRequire = (name) => {
    if (name === 'next/server') return { NextRequest, NextResponse };
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unexpected route dependency: ${name}`);
  };
  new Function('require', 'module', 'exports', 'process', code)(
    mockedRequire, loadedModule, loadedModule.exports, { env }
  );
  return loadedModule.exports;
}

function checkoutHarness({ user = customer, membership = null, configured = true } = {}) {
  const sessions = [];
  const { POST } = loadRoute('../app/api/vip/checkout/route.ts', {
    '@/lib/supabase/server': {
      createSupabaseServerClient: async () => ({
        auth: { getUser: async () => ({ data: { user } }) },
      }),
    },
    '@/lib/vip': {
      isStripeConfigured: () => configured,
      getMembership: async (profileId) => {
        assert.equal(profileId, customer.id);
        return membership;
      },
      getStripe: () => ({ checkout: { sessions: { create: async (options) => {
        sessions.push(options);
        return { url: 'https://checkout.stripe.com/test-session' };
      } } } }),
    },
  }, { STRIPE_VIP_PRICE_ID: 'price_annual_from_server' });
  return { POST, sessions };
}

for (const [localeQuery, expectedLocale, prefix] of [
  ['', 'en', ''],
  ['?locale=en', 'en', ''],
  ['?locale=es', 'es', '/es'],
  ['?locale=%2F%2Fevil.example', 'en', ''],
]) {
  test(`VIP checkout keeps locale ${localeQuery || '(default)'} within supported return routes`, async () => {
    const { POST, sessions } = checkoutHarness();
    const response = await POST(new NextRequest(`${origin}/api/vip/checkout${localeQuery}`, { method: 'POST' }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { url: 'https://checkout.stripe.com/test-session' });
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].locale, expectedLocale);
    assert.equal(sessions[0].success_url, `${origin}${prefix}/account/membership?vip=success&session_id={CHECKOUT_SESSION_ID}`);
    assert.equal(sessions[0].cancel_url, `${origin}${prefix}/account/membership?vip=cancelled`);
  });
}

test('VIP checkout uses the server price and authenticated customer, ignoring client billing values', async () => {
  const { POST, sessions } = checkoutHarness();
  await POST(new NextRequest(`${origin}/api/vip/checkout?locale=es&price=price_free`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price: 'price_free', amount: 0, profileId: 'someone-else' }),
  }));
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].mode, 'subscription');
  assert.deepEqual(sessions[0].line_items, [{ price: 'price_annual_from_server', quantity: 1 }]);
  assert.equal(sessions[0].client_reference_id, customer.id);
  assert.equal(sessions[0].customer_email, customer.email);
  assert.deepEqual(sessions[0].subscription_data.metadata, { profileId: customer.id });
});

test('VIP checkout rejects unauthenticated users without creating a Stripe session', async () => {
  const { POST, sessions } = checkoutHarness({ user: null });
  const response = await POST(new NextRequest(`${origin}/api/vip/checkout?locale=es`, { method: 'POST' }));
  assert.equal(response.status, 401);
  assert.equal(sessions.length, 0);
});

test('active members cannot start another VIP subscription', async () => {
  const { POST, sessions } = checkoutHarness({ membership: { status: 'active' } });
  const response = await POST(new NextRequest(`${origin}/api/vip/checkout`, { method: 'POST' }));
  assert.equal(response.status, 400);
  assert.equal(sessions.length, 0);
});

test('unconfigured VIP billing fails without creating a Stripe session', async () => {
  const { POST, sessions } = checkoutHarness({ configured: false });
  const response = await POST(new NextRequest(`${origin}/api/vip/checkout`, { method: 'POST' }));
  assert.equal(response.status, 503);
  assert.equal(sessions.length, 0);
});

function proxyHarness(signedIn) {
  return loadRoute('../proxy.ts', {
    'next-intl/middleware': { default: () => () => NextResponse.next(), __esModule: true },
    '@/i18n/routing': { routing: { locales: ['en', 'es'] } },
    '@/lib/supabase/middleware': {
      createMiddlewareClient: () => ({
        supabase: { auth: { getSession: async () => ({ data: { session: signedIn ? { user: customer } : null } }) } },
        response: NextResponse.next(),
      }),
    },
  }).proxy;
}

for (const [signedIn, path, destination] of [
  [false, '/es/account/membership', '/es/account/login?vip=1'],
  [false, '/account/membership', '/account/login?vip=1'],
  [true, '/es/account/login?vip=1', '/es/account/membership'],
  [true, '/es/account/signup?vip=1', '/es/account/membership'],
  [true, '/account/signup?vip=1', '/account/membership'],
  [true, '/account/login', '/account'],
  [true, '/es/account/login', '/es/account'],
  [true, '/account/login?vip=https://evil.example', '/account'],
]) {
  test(`${signedIn ? 'signed-in' : 'anonymous'} ${path} redirects to ${destination}`, async () => {
    const proxy = proxyHarness(signedIn);
    const response = await proxy(new NextRequest(`${origin}${path}`));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), `${origin}${destination}`);
  });
}

test('anonymous VIP signup and login remain accessible', async () => {
  const proxy = proxyHarness(false);
  for (const path of ['/account/signup?vip=1', '/es/account/login?vip=1']) {
    const response = await proxy(new NextRequest(`${origin}${path}`));
    assert.equal(response.headers.get('location'), null);
    assert.equal(response.status, 200);
  }
});
