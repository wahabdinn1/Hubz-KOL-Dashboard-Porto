"use client";

import { Button } from "@/components/retroui/Button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { InvoiceListTable } from "@/components/invoices/invoice-list-table";

export default function InvoiceListPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                    <p className="text-muted-foreground">Manage your billing and payments.</p>
                </div>
                <Link href="/invoices/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                    </Button>
                </Link>
            </div>

            <InvoiceListTable title="Recent Invoices" />
        </div>
    );
}
