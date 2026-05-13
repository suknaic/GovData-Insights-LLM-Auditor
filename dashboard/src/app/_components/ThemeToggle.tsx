'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Alternar tema"
      className="size-9 rounded-xl border-muted-foreground/20 bg-background/50 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <Sun className="hidden size-4 dark:flex" />
      <Moon className="flex size-4 dark:hidden" />
    </Button>
  );
}
