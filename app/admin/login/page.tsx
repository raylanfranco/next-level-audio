'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Invalid credentials');
        setLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Heading */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-[#00A0E0] neon-glow mb-2"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            NEXT LEVEL AUDIO
          </h1>
          <p className="text-[#00A0E0]/50 font-mono text-sm">Admin Dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              className="block text-[#00A0E0]/70 text-xs uppercase tracking-wider mb-2 font-mono"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] font-mono px-4 py-3 text-sm focus:border-[#00A0E0] focus:outline-none transition-colors placeholder:text-[#00A0E0]/20"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              className="block text-[#00A0E0]/70 text-xs uppercase tracking-wider mb-2 font-mono"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-black border-2 border-[#00A0E0]/30 text-[#00A0E0] font-mono px-4 py-3 text-sm focus:border-[#00A0E0] focus:outline-none transition-colors placeholder:text-[#00A0E0]/20"
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
            className="w-full py-3 border-2 border-[#00A0E0] text-[#00A0E0] font-bold text-sm uppercase tracking-wider transition-all hover:bg-[#00A0E0]/10 disabled:opacity-30 disabled:cursor-not-allowed cyber-button"
            style={{ fontFamily: 'var(--font-oxanium)' }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-[#00A0E0]/40 hover:text-[#00A0E0]/70 text-xs font-mono transition-colors"
          >
            &larr; Back to site
          </a>
        </div>
      </div>
    </div>
  );
}
