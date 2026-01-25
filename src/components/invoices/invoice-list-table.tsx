"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DataView } from "@/components/shared/data-view";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, InvoiceDB } from "@/components/invoices/columns";
import { Badge } from "@/components/ui/badge";

interface InvoiceListTableProps {
    kolId?: string;
    campaignId?: string;
    limit?: number;
    showRecipient?: boolean; 
    title?: string;
}

export function InvoiceListTable({ kolId, campaignId, limit, title = "Recent Invoices" }: InvoiceListTableProps) {
    const [invoices, setInvoices] = useState<InvoiceDB[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

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
    const handleMarkAsPaid = useCallback(async (id: string) => {
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
    }, [fetchInvoices]);

    // Bulk mark as paid
    const handleBulkMarkAsPaid = async () => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;
        
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
            setRowSelection({});
            fetchInvoices();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update invoices");
        }
    };

    const columns = useMemo(() => getColumns({ onMarkAsPaid: handleMarkAsPaid }), [handleMarkAsPaid]);

    const selectedCount = Object.keys(rowSelection).length;

    const cardActions = (
        <div className="flex items-center gap-2">
             {/* Note: DataTable has built-in search via searchKey/filter. 
                 If we want external search bar we can control global filter or pass it.
                 DataTable already renders a search bar if showSearch=true.
                 The search bar below was manual. I will rely on DataTable's search unless I need it outside.
                 If I want it in the header, I can disable DataTable search and put it here, passing value to DataTable.
                 However, DataTable encapsulates its UI.
                 For now, let's keep bulk actions here.
              */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md animate-in fade-in">
                     <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {selectedCount} selected
                    </span>
                    <Button
                        size="sm"
                        onClick={handleBulkMarkAsPaid}
                        className="h-7 text-xs"
                    >
                        Mark Paid
                    </Button>
                </div>
            )}
        </div>
    );

    const mobileView = (
        <div className="divide-y">
            {invoices.map((invoice) => (
                <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                    <div className="p-4 hover:bg-muted/50 cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{invoice.invoice_number}</span>
                            <Badge variant={invoice.status === 'PAID' ? 'default' : invoice.status === 'OVERDUE' ? 'destructive' : 'outline'}>
                                {invoice.status}
                            </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">{invoice.recipient_name}</div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Rp {invoice.total_amount.toLocaleString('id-ID')}</span>
                            <span className="text-muted-foreground">Due: {new Date(invoice.due_date).toLocaleDateString('id-ID')}</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <DataView 
            cardTitle={title}
            cardActions={cardActions}
            isLoading={isLoading}
            isEmpty={!isLoading && invoices.length === 0}
            emptyState={
                <div className="p-8 text-center border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-muted-foreground mb-4">No invoices found.</p>
                    {!kolId && !campaignId && (
                        <Link href="/invoices/new">
                            <Button variant="outline">Create your first invoice</Button>
                        </Link>
                    )}
                </div>
            }
            desktopView={
                <DataTable 
                    columns={columns} 
                    data={invoices}
                    searchKey="recipient_name" 
                    searchPlaceholder="Search recipient..."
                    showPagination={!limit}
                    pageSize={limit || 10}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    getRowId={(row) => row.id}
                />
            }
            mobileView={mobileView}
        />
    );
}
