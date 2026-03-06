'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';

export default function AccountSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-4 border-[#E01020]/30 border-t-[#E01020] animate-spin" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsNoMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(
      email,
      password,
      fullName,
      referralCode || undefined
    );

    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect after brief delay to show success
    setTimeout(() => {
      router.push('/account');
      router.refresh();
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-green-400 text-6xl mb-4">&#10003;</div>
          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {t('accountCreated')}
          </h2>
          <p className="text-white/50 font-mono text-sm">
            {t('welcomeRedirect')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-[#E01020] neon-glow mb-2"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            NEXT LEVEL AUDIO
          </h1>
          <p className="text-white/50 font-mono text-sm">{t('createYourAccount')}</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-2 font-mono" htmlFor="fullName">
              {t('fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-2 font-mono" htmlFor="email">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-2 font-mono" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-2 font-mono" htmlFor="confirmPassword">
              {t('confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="Confirm password"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-2 font-mono" htmlFor="referralCode">
              {t('referralCodeOptional')}
            </label>
            <input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoComplete="off"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20 uppercase"
              placeholder="E.g. A1B2C3D4"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm font-mono border border-red-400/30 bg-red-400/5 px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border-2 border-[#E01020] text-[#E01020] font-bold text-sm uppercase tracking-wider transition-all hover:bg-[#E01020]/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer cyber-button"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-white/40 font-mono text-sm">
            {t('haveAccount')}{' '}
            <Link href="/account/login" className="text-[#E01020] hover:text-[#FF2A3A] transition-colors">
              {t('signIn')}
            </Link>
          </p>
          <Link
            href="/"
            className="text-white/40 hover:text-white/70 text-xs font-mono transition-colors inline-block"
          >
            &larr; {t('backToSite')}
          </Link>
        </div>
      </div>
    </div>
  );
}
