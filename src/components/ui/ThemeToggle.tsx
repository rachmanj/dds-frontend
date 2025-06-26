"use client";

import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeManager } from '@/hooks/usePreferences';

const ThemeToggle = () => {
    const { theme, updateTheme, loading } = useThemeManager();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ] as const;

    const currentThemeOption = themeOptions.find(option => option.value === theme);
    const CurrentIcon = currentThemeOption?.icon || Sun;

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        try {
            await updateTheme(newTheme);
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={loading}
                    className="relative"
                >
                    <CurrentIcon className="h-4 w-4" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleThemeChange(option.value)}
                            className={theme === option.value ? 'bg-accent' : ''}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {option.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ThemeToggle; 