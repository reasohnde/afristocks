'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
  theme: 'light',
  toggle: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialisation : lit le choix persisté (ou la classe déjà posée par le script anti-flash).
  useEffect(() => {
    let initial: Theme = 'light';
    try {
      const saved = localStorage.getItem('afristocks-theme');
      if (saved === 'dark' || saved === 'light') initial = saved;
      else if (document.documentElement.classList.contains('dark')) initial = 'dark';
    } catch {
      /* ignore */
    }
    setTheme(initial);
  }, []);

  // Applique le thème au <html> + persiste.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('afristocks-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}
