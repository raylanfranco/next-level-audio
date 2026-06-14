'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useAdminTheme() {
  return useContext(ThemeContext);
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is browser-only, must read in an effect
      setTheme(stored);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('admin-theme', next);
  };

  // Prevent flash of wrong theme — placeholder uses the admin dark bg token.
  if (!mounted) {
    return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }} />;
  }

  // Use a dedicated admin theme class (NOT the global `.dark`, which is
  // hardcoded on <html> by the root layout and would always win).
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'admin-dark' : 'admin-light'}>{children}</div>
    </ThemeContext.Provider>
  );
}
