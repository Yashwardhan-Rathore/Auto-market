'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/use-ui-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/navigation/nav-config';
import { APP_NAME } from '@/constants';
import type { NavItem } from '@/types';

// ─── NavLink ───────────────────────────────────────────────
interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}

function NavLink({ item, collapsed, depth = 0 }: NavLinkProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(() =>
    item.children ? item.children.some((c) => pathname.startsWith(c.href)) : false
  );

  const Icon = item.icon;
  const isActive = item.children
    ? item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
    : pathname === item.href || pathname.startsWith(item.href + '/');

  const hasChildren = Boolean(item.children?.length);

  const linkClass = cn(
    'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150 select-none',
    isActive
      ? 'bg-accent text-primary font-semibold'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
    collapsed && 'justify-center px-2'
  );

  const iconClass = cn(
    'h-4 w-4 shrink-0',
    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
  );

  if (hasChildren) {
    return (
      <div>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => !collapsed && setOpen((o) => !o)}
                className={linkClass}
              >
                {Icon && <Icon className={iconClass} />}
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    {item.isNew && (
                      <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">New</Badge>
                    )}
                    <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200', open && 'rotate-180')} />
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {!collapsed && (
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-0.5 ml-4 space-y-0.5 border-l border-border/60 pl-3">
                  {item.children!.map((child) => (
                    <NavLink key={child.id} item={child} collapsed={false} depth={depth + 1} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} className={linkClass}>
            {Icon && <Icon className={iconClass} />}
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.isNew && (
                  <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">New</Badge>
                )}
                {typeof item.badge !== 'undefined' && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Sidebar ───────────────────────────────────────────────
export function Sidebar() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed);

  const W = sidebarCollapsed ? 60 : 240;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="relative flex flex-col border-r border-border bg-sidebar shrink-0 h-screen sticky top-0 overflow-hidden z-30"
      style={{ minWidth: W, maxWidth: W }}
    >
      {/* Logo */}
      <div className={cn('flex h-14 items-center border-b border-sidebar-border px-4 shrink-0', sidebarCollapsed && 'justify-center px-2')}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-[15px] truncate text-foreground">{APP_NAME}</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className={cn('space-y-0.5', sidebarCollapsed ? 'px-1.5' : 'px-2')}>
          {MAIN_NAV_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} collapsed={sidebarCollapsed} />
          ))}
        </div>

        <Separator className="my-2 mx-2" />

        <div className={cn('space-y-0.5', sidebarCollapsed ? 'px-1.5' : 'px-2')}>
          {!sidebarCollapsed && (
            <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
          )}
          {BOTTOM_NAV_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} collapsed={sidebarCollapsed} />
          ))}
        </div>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2 shrink-0">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
