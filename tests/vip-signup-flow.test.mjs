import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformSync } from '@swc/core';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

// Run the real component JSX and submit handlers without a Next server or real
// customer accounts. Only hooks and external auth/navigation boundaries are
// replaced; React renders the resulting host elements and the real copy.
function formHarness({ page = 'signup', locale = 'en', query = '', result = { error: null, needsEmailConfirmation: false }, reject = false } = {}) {
  const messages = JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), 'utf8'));
  const state = [];
  const calls = [];
  const navigations = [];
  let cursor = 0;
  let tree;
  const localize = (href) => locale === 'es' ? `/es${href}` : href;
  const auth = async (...args) => {
    calls.push(args);
    if (reject) throw new Error('Network unavailable');
    return result;
  };
  const router = (localized) => ({
    push: (href) => navigations.push(localized ? localize(href) : href),
    refresh() {},
  });
  const mocks = {
    react: {
      ...React,
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
        return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
      },
    },
    'react/jsx-runtime': jsxRuntime,
    'next/navigation': { useSearchParams: () => new URLSearchParams(query), useRouter: () => router(false) },
    '@/i18n/navigation': {
      useRouter: () => router(true),
      Link: ({ href, children, ...props }) => React.createElement('a', { ...props, href: localize(href) }, children),
    },
    'next-intl': {
      useTranslations: (namespace) => (key) => {
        assert.equal(typeof messages[namespace]?.[key], 'string', `Missing ${locale} translation: ${namespace}.${key}`);
        return messages[namespace][key];
      },
    },
    '@/components/AuthContext': { useAuth: () => ({ signUp: auth, signIn: auth }) },
  };
  function load(path) {
    const { code } = transformSync(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), {
      filename: path,
      jsc: { parser: { syntax: 'typescript', tsx: true }, target: 'es2022', transform: { react: { runtime: 'automatic' } } },
      module: { type: 'commonjs' },
    });
    const compiledModule = { exports: {} };
    const requireMock = (name) => {
      assert.ok(name in mocks, `Unexpected component dependency: ${name}`);
      return mocks[name];
    };
    new Function('require', 'module', 'exports', code)(requireMock, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }
  mocks['@/components/VipSignupSummary'] = load('components/VipSignupSummary.tsx');
  const Page = load(`app/[locale]/account/${page}/page.tsx`).default;
  function expand(node) {
    if (Array.isArray(node)) return node.map((child, index) => {
      const expanded = expand(child);
      return React.isValidElement(expanded) && expanded.key === null
        ? React.cloneElement(expanded, { key: index })
        : expanded;
    });
    if (!React.isValidElement(node)) return node;
    if (typeof node.type === 'function') return expand(node.type(node.props));
    return React.cloneElement(node, undefined, expand(node.props.children));
  }
  function render() {
    cursor = 0;
    tree = expand(React.createElement(Page));
    return renderToStaticMarkup(tree);
  }
  function find(predicate, node = tree) {
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = find(predicate, child ?? null);
        if (found) return found;
      }
    } else if (React.isValidElement(node)) {
      if (predicate(node)) return node;
      return find(predicate, node.props.children ?? null);
    }
  }
  render();
  return {
    calls, navigations, render,
    find,
    fill(values) {
      for (const [id, value] of Object.entries(values)) {
        const input = find((node) => node.type === 'input' && node.props.id === id);
        assert.ok(input, `Missing input ${id}`);
        input.props.onChange({ target: { value } });
        render();
      }
    },
    async submit() {
      await find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
      return render();
    },
  };
}

const account = { fullName: 'VIP Customer', email: 'vip@example.test', password: 'test-password', confirmPassword: 'test-password' };

test('VIP signup explains the annual offer and payment before collecting account details; phone is optional', () => {
  const form = formHarness({ query: 'vip=1' });
  const html = form.render();
  assert.ok(html.indexOf('$199/year VIP Membership') < html.indexOf('<form'));
  for (const text of ['10% off installation', '2 VIP diagnostic visits', '2 free VIP system checkups', 'Priority scheduling', 'Stripe', 'renews annually', 'does not charge you']) {
    assert.ok(html.includes(text), `Missing offer detail: ${text}`);
  }
  const phone = form.find((node) => node.type === 'input' && node.props.id === 'phone');
  assert.equal(phone.props.type, 'tel');
  assert.equal(phone.props.autoComplete, 'tel');
  assert.equal(phone.props.required, undefined);
  assert.equal(phone.props['aria-describedby'], 'phone-help');
});

for (const locale of ['en', 'es']) {
  const prefix = locale === 'es' ? '/es' : '';

  test(`${locale}: signed-in VIP signup continues to membership payment with the optional phone and referral`, async () => {
    const form = formHarness({ locale, query: 'vip=1&ref=ABC12345' });
    form.fill({ ...account, phone: '  +1 (570) 555-0123  ' });
    await form.submit();
    assert.deepEqual(form.calls, [[account.email, account.password, account.fullName, 'ABC12345', '+1 (570) 555-0123']]);
    assert.deepEqual(form.navigations, [`${prefix}/account/membership`]);
  });

  test(`${locale}: email confirmation holds signup and retains a VIP sign-in link`, async () => {
    const form = formHarness({ locale, query: 'vip=1', result: { error: null, needsEmailConfirmation: true } });
    form.fill(account);
    const html = await form.submit();
    assert.deepEqual(form.navigations, []);
    assert.equal(form.calls[0][4], undefined);
    assert.ok(html.includes('$199'));
    assert.ok(html.includes('Stripe'));
    assert.ok(form.find((node) => node.type === 'a' && node.props.href === `${prefix}/account/login?vip=1`));
    assert.equal(form.find((node) => node.type === 'form'), undefined);
  });

  test(`${locale}: normal signup keeps the normal account destination`, async () => {
    const form = formHarness({ locale });
    assert.ok(!form.render().includes('vip-signup-title'));
    form.fill(account);
    await form.submit();
    assert.deepEqual(form.navigations, [`${prefix}/account`]);
  });

  test(`${locale}: existing-account sign-in and auth links preserve VIP intent`, async () => {
    const signup = formHarness({ locale, query: 'vip=1' });
    assert.ok(signup.find((node) => node.type === 'a' && node.props.href === `${prefix}/account/login?vip=1`));
    const login = formHarness({ page: 'login', locale, query: 'vip=1' });
    assert.ok(login.find((node) => node.type === 'a' && node.props.href === `${prefix}/account/signup?vip=1`));
    login.fill({ email: account.email, password: account.password });
    await login.submit();
    assert.deepEqual(login.navigations, [`${prefix}/account/membership`]);
  });
}

test('signup auth and network failures keep the form retryable instead of navigating', async () => {
  for (const options of [{ result: { error: 'Email already registered' } }, { reject: true }]) {
    const form = formHarness({ query: 'vip=1', ...options });
    form.fill(account);
    const html = await form.submit();
    assert.deepEqual(form.navigations, []);
    assert.ok(html.includes(options.reject ? 'try again' : 'Email already registered'));
    assert.equal(form.find((node) => node.type === 'button' && node.props.type === 'submit').props.disabled, false);
  }
});

test('password mismatch does not create an account or advance to payment', async () => {
  const form = formHarness({ query: 'vip=1' });
  form.fill({ ...account, confirmPassword: 'different-password' });
  assert.ok((await form.submit()).includes('Passwords do not match'));
  assert.deepEqual(form.calls, []);
  assert.deepEqual(form.navigations, []);
});
