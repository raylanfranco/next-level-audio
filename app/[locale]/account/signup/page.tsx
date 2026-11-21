'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';
import VipSignupSummary from '@/components/VipSignupSummary';

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
  const isVipSignup = searchParams.get('vip') === '1';
  const loginHref = isVipSignup ? '/account/login?vip=1' : '/account/login';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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

    try {
      const { error: authError, needsEmailConfirmation } = await signUp(
        email,
        password,
        fullName,
        referralCode || undefined,
        phone.trim() || undefined
      );

      if (authError) {
        setError(authError);
        return;
      }

      if (needsEmailConfirmation) {
        setSuccess(true);
        return;
      }

      router.push(isVipSignup ? '/account/membership' : '/account');
      router.refresh();
    } catch {
      setError(t('signupError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-green-400 text-6xl mb-4">&#10003;</div>
          <h2
            className="text-2xl font-bold text-white mb-2 font-oxanium"
          >
            {t('confirmEmailTitle')}
          </h2>
          <p className="text-white/50 font-mono text-sm">
            {t('checkEmail')}
          </p>
          <p className="text-white/70 font-mono text-sm mt-4">
            {isVipSignup ? t('vipConfirmNext') : t('confirmNext')}
          </p>
          <Link href={loginHref} className="btn-glow inline-block px-6 py-3 mt-6 text-white font-oxanium font-bold">
            {isVipSignup ? t('vipSignIn') : t('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 pt-32 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-[#E01020] neon-glow mb-2 font-oxanium"
          >
            NEXT LEVEL AUDIO
          </h1>
          <p className="text-white/50 font-mono text-sm">{isVipSignup ? t('vipCreateAccount') : t('createYourAccount')}</p>
        </div>

        {isVipSignup && <VipSignupSummary />}

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
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-2 font-mono" htmlFor="phone">
              {t('phoneOptional')}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              maxLength={50}
              aria-describedby="phone-help"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20"
            />
            <p id="phone-help" className="text-white/50 font-mono text-xs mt-2">{t('phoneHelp')}</p>
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
            className="w-full py-3 border-2 border-[#E01020] text-[#E01020] font-bold text-sm uppercase tracking-wider transition-all hover:bg-[#E01020]/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer cyber-button font-oxanium"
          >
            {loading ? t('creatingAccount') : isVipSignup ? t('vipContinue') : t('createAccount')}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-white/40 font-mono text-sm">
            {t('haveAccount')}{' '}
            <Link href={loginHref} className="text-[#E01020] hover:text-[#FF2A3A] transition-colors">
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
