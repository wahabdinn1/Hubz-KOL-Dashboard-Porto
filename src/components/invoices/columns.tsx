"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatIDR } from "@/lib/analytics";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowSelection, DataTableRowCheckbox } from "@/components/ui/data-table-row-selection";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/components/invoices/utils";

export interface InvoiceDB {
    id: string;
    invoice_number: string;
    recipient_name: string;
    status: InvoiceStatus;
    total_amount: number;
    due_date: string;
    created_at: string;
}

interface ColumnsProps {
    onMarkAsPaid: (id: string) => void;
}

export const getColumns = ({ onMarkAsPaid }: ColumnsProps): ColumnDef<InvoiceDB>[] => [
    {
        id: "select",
        header: ({ table }) => <DataTableRowSelection table={table} />,
         // Only enable row selection if status is not PAID.
         // However, TanStack table row selection is generic.
         // If we want to disable specific rows, we can pass `enableRowSelection` to `useReactTable`.
         // But here we are using `DataTable` wrapper.
         // Let's implement generic selection but hiding checkbox if PAID is handled in cell.
        cell: ({ row }) => (
            row.original.status !== 'PAID' ? (
                <DataTableRowCheckbox 
                    checked={row.getIsSelected()} 
                    onCheckedChange={(value) => row.toggleSelected(!!value)} 
                />
            ) : null
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "invoice_number",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Invoice #" />
        ),
        cell: ({ row }) => {
            return (
                <Link href={`/invoices/${row.original.id}`} className="hover:underline text-primary font-medium font-mono">
                    {row.getValue("invoice_number")}
                </Link>
            )
        }
    },
    {
        accessorKey: "recipient_name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Recipient" />
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as InvoiceStatus;
            return (
                <Badge
                    variant={
                        status === 'PAID' ? 'default' :
                            status === 'OVERDUE' ? 'destructive' :
                                status === 'PENDING' ? 'secondary' : 'outline'
                    }
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amount" className="justify-end" />
        ),
        cell: ({ row }) => (
            <div className="text-right font-bold">
                {formatIDR(row.getValue("total_amount"))}
            </div>
        ),
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Due Date" />
        ),
        cell: ({ row }) => {
            const date = row.getValue("due_date") as string;
            return (
                <div className="text-muted-foreground text-sm">
                    {date ? new Date(date).toLocaleDateString('en-GB') : '-'}
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <Link href={`/invoices/${row.original.id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                        </DropdownMenuItem>
                    </Link>
                    {row.original.status !== 'PAID' && (
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => onMarkAsPaid(row.original.id)}
                        >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Mark as Paid
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];
