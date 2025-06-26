"use client";

import React, { useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import preferencesService from '@/services/preferencesService';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [mounted, setMounted] = useState(false);
    const [defaultTheme, setDefaultTheme] = useState<'light' | 'dark' | 'system'>('light');

    // Load user's theme preference on mount
    useEffect(() => {
        const loadUserTheme = async () => {
            try {
                const preferences = await preferencesService.getUserPreferences();
                setDefaultTheme(preferences.theme);
            } catch (error) {
                console.error('Failed to load user theme preference:', error);
                // Fallback to light theme
                setDefaultTheme('light');
            } finally {
                setMounted(true);
            }
        };

        loadUserTheme();
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="h-screen w-screen bg-white dark:bg-gray-900">
                {children}
            </div>
        );
    }

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme={defaultTheme}
            enableSystem
            disableTransitionOnChange={false}
        >
            {children}
        </NextThemesProvider>
    );
}

export default ThemeProvider; 