'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Building, ExternalLink, Globe, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { DataTable } from '@/components/shared/organisms/data-table';
import { MOCK_COMPANIES } from '../constants';
import { Company } from '../types';
import { formatCurrency, formatCompactNumber } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CompaniesListView() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);

  const handleDelete = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    toast.success('Company removed');
  };

  const handleBulkDelete = (selected: Company[]) => {
    const ids = selected.map((c) => c.id);
    setCompanies((prev) => prev.filter((c) => !ids.includes(c.id)));
    toast.success(`Removed ${selected.length} companies`);
  };

  const columns: ColumnDef<Company>[] = [
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
      accessorFn: (row) => `${row.name} ${row.domain} ${row.industry}`,
      id: 'name',
      header: 'Company Name',
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar name={c.name} size="sm" />
            <div>
              <p className="font-semibold text-foreground truncate max-w-[200px]">{c.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                <Globe className="h-3 w-3 shrink-0" />
                <a href={`https://${c.domain}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">
                  {c.domain} <ExternalLink className="h-2 w-2" />
                </a>
              </div>
            </div>
          </div>
        );
      },
      size: 260,
    },
    {
      accessorKey: 'industry',
      header: 'Industry',
      cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue() as string}</span>,
      size: 150,
    },
    {
      accessorKey: 'employeesCount',
      header: 'Employees',
      cell: ({ getValue }) => <span className="text-muted-foreground">{formatCompactNumber(getValue() as number)}</span>,
      size: 110,
    },
    {
      accessorKey: 'annualRevenue',
      header: 'Annual Revenue',
      cell: ({ getValue }) => <span className="font-semibold text-foreground">{formatCurrency(getValue() as number)}</span>,
      size: 140,
    },
    {
      accessorKey: 'contactsCount',
      header: 'Linked Contacts',
      cell: ({ getValue }) => <span className="font-medium text-foreground">{getValue() as number} contacts</span>,
      size: 120,
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
              <DropdownMenuItem onClick={() => toast.info('Edit Company', { description: `Editing company: ${c.name}` })}>
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit details
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your target accounts and institutional clients.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() =>
            toast.success('New company modal', { description: 'Create company form launched.' })
          }
        >
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        searchKey="name"
        searchPlaceholder="Search by name, domain, or industry…"
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
