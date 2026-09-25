'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const STORAGE_KEY = 'taskflow-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        setTheme(currentTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
        document.documentElement.style.colorScheme = nextTheme;
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
    }, [theme]);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme, ThemeProvider içinde kullanılmalıdır');
    return context;
}
