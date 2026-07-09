'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCompactNumber, formatPercentage } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  className?: string;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  iconClassName,
  prefix,
  suffix,
  compact = false,
  className,
  loading = false,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  const displayValue =
    typeof value === 'number' && compact ? formatCompactNumber(value) : value;

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="skeleton h-3 w-24 rounded" />
              <div className="skeleton h-8 w-32 rounded" />
              <div className="skeleton h-3 w-28 rounded" />
            </div>
            <div className="skeleton h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {prefix && <span className="text-lg font-semibold text-muted-foreground">{prefix}</span>}
                {displayValue}
                {suffix && <span className="text-lg font-semibold text-muted-foreground ml-1">{suffix}</span>}
              </p>
              {change !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 font-semibold',
                      isPositive && 'text-green-600 dark:text-green-400',
                      isNegative && 'text-red-600 dark:text-red-400',
                      isNeutral && 'text-muted-foreground'
                    )}
                  >
                    {isPositive && <TrendingUp className="h-3 w-3" />}
                    {isNegative && <TrendingDown className="h-3 w-3" />}
                    {isNeutral && <Minus className="h-3 w-3" />}
                    {isPositive && '+'}
                    {formatPercentage(change)}
                  </span>
                  <span className="text-muted-foreground">{changeLabel}</span>
                </div>
              )}
            </div>
            {icon && (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0',
                  iconClassName
                )}
              >
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export { StatCard };
