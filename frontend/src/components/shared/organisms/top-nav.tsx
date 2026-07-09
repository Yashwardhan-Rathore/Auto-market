'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Sun, Moon, Monitor, ChevronDown, LogOut, User, Settings, HelpCircle, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/use-ui-store';
import { useAuthStore } from '@/store/use-auth-store';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants';

// ─── Theme Toggle ──────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground relative">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {options.map(({ value, icon: Icon, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(theme === value && 'bg-accent font-medium')}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Notification Bell ─────────────────────────────────────
function NotificationBell() {
  const unreadCount = 5;
  return (
    <Button variant="ghost" size="sm" className="relative w-8 h-8 p-0 text-muted-foreground hover:text-foreground">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground pointer-events-none">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}

// ─── Global Search trigger ─────────────────────────────────
function GlobalSearch() {
  const setCommandMenuOpen = useUiStore((s) => s.setCommandMenuOpen);
  return (
    <button
      onClick={() => setCommandMenuOpen(true)}
      className="group flex h-8 items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-all hover:border-ring hover:bg-accent hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-56 sm:w-72"
    >
      <Search className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-left text-xs">Search anything…</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium sm:flex">
        <Command className="h-3 w-3" />K
      </kbd>
    </button>
  );
}

// ─── User Menu ─────────────────────────────────────────────
function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const router = useRouter();

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const displayEmail = user?.email ?? '';

  const handleLogout = () => {
    clearSession();
    router.push(ROUTES.LOGIN);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring">
          <Avatar src={user?.avatar} name={displayName} size="sm" />
          <div className="hidden flex-col text-left md:flex">
            <span className="max-w-[120px] truncate text-xs font-semibold text-foreground leading-tight">
              {displayName}
            </span>
            <span className="max-w-[120px] truncate text-[11px] text-muted-foreground leading-tight">
              {displayEmail}
            </span>
          </div>
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground leading-none mt-1">{displayEmail}</p>
            {user?.role && (
              <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-4 mt-1">
                {user.role.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(ROUTES.PROFILE)}>
          <User className="mr-2 h-4 w-4" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)}>
          <Settings className="mr-2 h-4 w-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── TopNav ────────────────────────────────────────────────
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background/95 backdrop-blur-md px-4 gap-4 shrink-0">
      <div className="flex flex-1 items-center">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell />
        <Separator orientation="vertical" className="h-6 mx-1.5" />
        <UserMenu />
      </div>
    </header>
  );
}
