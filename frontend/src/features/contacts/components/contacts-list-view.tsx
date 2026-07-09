'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Trash2, Mail, Edit, MoreHorizontal, UserX, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { DataTable } from '@/components/shared/organisms/data-table';
import { MOCK_CONTACTS } from '../constants';
import { Contact } from '../types';
import { formatDate } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ContactsListView() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  // Bulk action handlers
  const handleBulkDelete = (selected: Contact[]) => {
    const ids = selected.map((c) => c.id);
    setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
    toast.success('Success', { description: `Successfully deleted ${selected.length} contacts.` });
  };

  const handleBulkActivate = (selected: Contact[]) => {
    const ids = selected.map((c) => c.id);
    setContacts((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, status: 'ACTIVE' as const } : c))
    );
    toast.success('Success', { description: `Activated ${selected.length} contacts.` });
  };

  // Row actions
  const handleDeleteRow = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    toast.success('Contact deleted');
  };

  const handleToggleStatus = (id: string) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const),
            }
          : c
      )
    );
    toast.success('Status updated');
  };

  // Reusable columns definition
  const columns: ColumnDef<Contact>[] = [
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
      accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const c = row.original;
        const name = `${c.firstName} ${c.lastName}`;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={name} size="sm" />
            <div>
              <p className="font-semibold text-foreground leading-none">{name}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-1">{c.email}</p>
            </div>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{getValue() as string || '—'}</span>
      ),
      size: 150,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const val = getValue() as Contact['status'];
        const map = {
          ACTIVE: 'success' as const,
          INACTIVE: 'secondary' as const,
          PENDING: 'warning' as const,
        };
        return (
          <Badge variant={map[val] ?? 'default'} dot className="capitalize text-[10px] px-1.5 py-0 h-4">
            {val.toLowerCase()}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ getValue }) => {
        const tags = getValue() as string[] ?? [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 border-muted/80 bg-muted/10 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
      size: 180,
    },
    {
      accessorKey: 'lastContactedAt',
      header: 'Last Contacted',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return <span className="text-muted-foreground">{val ? formatDate(val) : 'Never'}</span>;
      },
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
              <DropdownMenuItem onClick={() => toast.info('Edit mode', { description: `Editing contact ${c.firstName}` })}>
                <Edit className="mr-2 h-3.5 w-3.5" /> Edit details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(c.id)}>
                {c.status === 'ACTIVE' ? (
                  <>
                    <UserX className="mr-2 h-3.5 w-3.5" /> Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-3.5 w-3.5" /> Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteRow(c.id)}
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your customer database and audience segments.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() =>
            toast.success('New contact workflow', { description: 'Contact wizard initialized.' })
          }
        >
          <Plus className="h-4 w-4" /> Add Contact
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={contacts}
        searchKey="name"
        searchPlaceholder="Search by name or email…"
        bulkActions={[
          {
            label: 'Activate Selected',
            onClick: handleBulkActivate,
            icon: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
          },
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
