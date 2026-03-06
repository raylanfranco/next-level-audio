'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/AuthContext';

export default function AccountLoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError);
      setLoading(false);
      return;
    }

    router.push('/account');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-[#E01020] neon-glow mb-2"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            NEXT LEVEL AUDIO
          </h1>
          <p className="text-white/50 font-mono text-sm">{t('signInToAccount')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
              autoComplete="current-password"
              className="w-full bg-black border-2 border-[#E01020]/30 text-white font-mono px-4 py-3 text-sm focus:border-[#E01020] focus:outline-none transition-colors placeholder:text-white/20"
              placeholder="Enter password"
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
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          <p className="text-white/40 font-mono text-sm">
            {t('noAccount')}{' '}
            <Link href="/account/signup" className="text-[#E01020] hover:text-[#FF2A3A] transition-colors">
              {t('createOne')}
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
