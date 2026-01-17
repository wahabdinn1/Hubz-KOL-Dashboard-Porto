"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatIDR } from "@/lib/analytics";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { InvoiceStatus } from "@/lib/invoice-utils";

interface InvoiceListTableProps {
    kolId?: string;
    campaignId?: string;
    limit?: number;
    showRecipient?: boolean; // Sometimes we want to hide it if we are on the KOL page and they are the recipient? 
    // But usually recipient is the Brand/Agency or the Client. 
    // For Hubz (Agency), we issue invoices TO clients. 
    // Wait, if we are issuing invoices TO clients, `recipient_name` is the client.
    // If we are receiving invoices FROM Kols, that's different.
    // The current flow seems to be "Create Invoice" as in "We are sending an invoice".
    // OR "We are generating an invoice on behalf of a KOL"?
    // Let's stick to what's in the DB. `recipient_name`.
}

interface InvoiceDB {
    id: string;
    invoice_number: string;
    recipient_name: string;
    status: InvoiceStatus;
    total_amount: number;
    due_date: string;
    created_at: string;
}

export function InvoiceListTable({ kolId, campaignId, limit }: InvoiceListTableProps) {
    const [invoices, setInvoices] = useState<InvoiceDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (kolId) {
                query = query.eq('kol_id', kolId);
            }
            if (campaignId) {
                query = query.eq('campaign_id', campaignId);
            }
            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;

            if (error) throw error;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setInvoices((data || []) as any[]);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Failed to load invoices");
        } finally {
            setIsLoading(false);
        }
    }, [kolId, campaignId, limit]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Marking as paid handler
    const handleMarkAsPaid = async (id: string) => {
        try {
            const { error } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('invoices') as any)
                .update({ status: 'PAID' })
                .eq('id', id);

            if (error) throw error;

            toast.success("Invoice marked as PAID");
            fetchInvoices(); // Refresh
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    // Bulk select handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(invoices.filter(i => i.status !== 'PAID').map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    // Bulk mark as paid
    const handleBulkMarkAsPaid = async () => {
        if (!confirm(`Mark ${selectedIds.length} invoices as PAID?`)) return;
        
        try {
            for (const id of selectedIds) {
                await (supabase
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .from('invoices') as any)
                    .update({ status: 'PAID' })
                    .eq('id', id);
            }
            toast.success(`${selectedIds.length} invoices marked as PAID`);
            setSelectedIds([]);
            fetchInvoices();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update invoices");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>;
    }

    if (invoices.length === 0) {
        return (
            <div className="p-8 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <p className="text-muted-foreground mb-4">No invoices found.</p>
                {!kolId && !campaignId && (
                    <Link href="/invoices/new">
                        <Button variant="outline">Create your first invoice</Button>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="p-2 bg-muted flex items-center justify-between border-b">
                    <span className="text-sm text-muted-foreground">
                        {selectedIds.length} selected
                    </span>
                    <Button
                        size="sm"
                        onClick={handleBulkMarkAsPaid}
                        className="h-7 text-xs"
                    >
                        Mark as Paid ({selectedIds.length})
                    </Button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">
                            <input
                                type="checkbox"
                                className="translate-y-[2px]"
                                checked={selectedIds.length > 0 && selectedIds.length === invoices.filter(i => i.status !== 'PAID').length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        </TableHead>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => {
                        const isSelected = selectedIds.includes(invoice.id);
                        return (
                            <TableRow key={invoice.id} className={isSelected ? 'bg-muted' : ''}>
                                <TableCell className="w-[40px]">
                                    {invoice.status !== 'PAID' && (
                                        <input
                                            type="checkbox"
                                            className="translate-y-[2px]"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectRow(invoice.id, e.target.checked)}
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium font-mono">
                                    <Link href={`/invoices/${invoice.id}`} className="hover:underline text-primary">
                                        {invoice.invoice_number}
                                    </Link>
                                </TableCell>
                            <TableCell>{invoice.recipient_name}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        invoice.status === 'PAID' ? 'default' :
                                            invoice.status === 'OVERDUE' ? 'destructive' :
                                                invoice.status === 'PENDING' ? 'secondary' : 'outline'
                                    }
                                >
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">{formatIDR(invoice.total_amount)}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-GB') : '-'}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <Link href={`/invoices/${invoice.id}`}>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <FileText className="mr-2 h-4 w-4" />
                                                View Invoice
                                            </DropdownMenuItem>
                                        </Link>
                                        {invoice.status !== 'PAID' && (
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => handleMarkAsPaid(invoice.id)}
                                            >
                                                <ArrowRight className="mr-2 h-4 w-4" />
                                                Mark as Paid
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
