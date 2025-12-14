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
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium 
                 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            title={`Theme: ${theme === 'light' ? 'Light' : 'Dark'}`}
        >
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{theme === 'light' ? 'Light' : 'Dark'}</span>
        </button>
    );
};

export default ThemeToggle;
