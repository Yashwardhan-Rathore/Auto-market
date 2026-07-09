'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, BarChart2, Calendar, Mail, MessageSquare, Phone, BellRing, Eye, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/organisms/data-table';
import { MOCK_CAMPAIGNS } from '../constants';
import { Campaign } from '../types';
import { formatDate, formatCompactNumber, formatPercentage } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CampaignsListView() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.success('Campaign deleted');
  };

  const handleBulkDelete = (selected: Campaign[]) => {
    const ids = selected.map((c) => c.id);
    setCampaigns((prev) => prev.filter((c) => !ids.includes(c.id)));
    toast.success(`Deleted ${selected.length} campaigns`);
  };

  // Icon maps for channel types
  const getChannelIcon = (type: Campaign['type']) => {
    const map = {
      EMAIL: <Mail className="h-4 w-4 text-blue-500" />,
      SMS: <Phone className="h-4 w-4 text-purple-500" />,
      WHATSAPP: <MessageSquare className="h-4 w-4 text-green-500" />,
      PUSH: <BellRing className="h-4 w-4 text-amber-500" />,
    };
    return map[type] || <Mail className="h-4 w-4" />;
  };

  // Status badges
  const getStatusBadge = (status: Campaign['status']) => {
    const variantMap: Record<Campaign['status'], 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'info'> = {
      DRAFT: 'secondary',
      SCHEDULED: 'info',
      PUBLISHED: 'success',
      PAUSED: 'warning',
      COMPLETED: 'default',
      FAILED: 'destructive',
    };
    return (
      <Badge variant={variantMap[status] || 'default'} dot className="text-[10px] px-1.5 py-0 h-4">
        {status.toLowerCase()}
      </Badge>
    );
  };

  const columns: ColumnDef<Campaign>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary cursor-pointer align-middle"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="h-4 w-4 rounded border-input accent-primary cursor-pointer align-middle"
        />
      ),
      size: 40,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
              {getChannelIcon(c.type)}
            </div>
            <div>
              <p className="font-semibold text-foreground truncate max-w-[280px]">{c.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-muted/80 text-muted-foreground bg-muted/10 font-normal capitalize">
                  {c.type.toLowerCase()}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  Created {formatDate(c.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      },
      size: 320,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getStatusBadge(getValue() as Campaign['status']),
      size: 110,
    },
    {
      accessorKey: 'recipientsCount',
      header: 'Audience Size',
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{formatCompactNumber(getValue() as number)}</span>
      ),
      size: 110,
    },
    {
      accessorKey: 'openRate',
      header: 'Open Rate',
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return (
          <span className="font-semibold text-foreground">
            {val !== undefined ? formatPercentage(val) : '—'}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'clickRate',
      header: 'Click Rate',
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return (
          <span className="font-semibold text-foreground">
            {val !== undefined ? formatPercentage(val) : '—'}
          </span>
        );
      },
      size: 100,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info('Preview mode', { description: `Previewing campaign: ${c.name}` })}>
                <Eye className="mr-2 h-3.5 w-3.5" /> Preview details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Analytics mode', { description: `Loading metrics for campaign: ${c.name}` })}>
                <BarChart2 className="mr-2 h-3.5 w-3.5" /> View reports
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(c.id)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 60,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build, launch, and monitor your multi-channel marketing campaigns.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() =>
            toast.success('Launch wizard', { description: 'New campaign flow started.' })
          }
        >
          <Plus className="h-4 w-4" /> New Campaign
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        searchKey="name"
        searchPlaceholder="Filter campaigns by name…"
        bulkActions={[
          {
            label: 'Delete Selected',
            onClick: handleBulkDelete,
            icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
          },
        ]}
      />
    </div>
  );
}
