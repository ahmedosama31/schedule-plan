import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme') as Theme | null;
            if (stored) return stored;
            // Default to system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            localStorage.setItem('theme', 'dark');
            root.classList.add('dark');
        } else {
            localStorage.setItem('theme', 'light');
            root.classList.remove('dark');
        }
    }, [theme]);

    // Listen for system preference changes only if no manual override
    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored) return; // User has made a choice, don't override

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[--text-tertiary] hover:text-[--text-primary] hover:bg-[--bg-tertiary] transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

export default ThemeToggle;
