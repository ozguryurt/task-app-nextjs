'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
            title={isDark ? 'Açık tema' : 'Koyu tema'}
            className={cn('shadow-sm', className)}
        >
            {isDark ? <Sun /> : <Moon />}
        </Button>
    );
}
