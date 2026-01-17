"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MY_BANK_DETAILS, Invoice, InvoiceStatus } from "@/lib/invoice-utils";
import { formatIDR } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
type InvoiceItemRow = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceWithItems = InvoiceRow & { items: InvoiceItemRow[] };

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [invoice, setInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        async function fetchInvoice() {
            if (!id) return;
            try {
                // Fetch Invoice and Items
                const { data, error } = await supabase
                    .from('invoices')
                    .select(`
                        *,
                        items:invoice_items(*)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data) {
                    const invoiceData = data as unknown as InvoiceWithItems;
                    setInvoice({
                        id: invoiceData.id,
                        invoiceNumber: invoiceData.invoice_number,
                        recipientName: invoiceData.recipient_name,
                        recipientAddress: invoiceData.recipient_address || '',
                        items: invoiceData.items.map((item) => ({
                            id: item.id,
                            description: item.description,
                            quantity: item.quantity,
                            price: item.price,
                            total: item.total
                        })),
                        totalAmount: invoiceData.total_amount,
                        status: invoiceData.status as InvoiceStatus,
                        dueDate: invoiceData.due_date || new Date().toISOString(),
                        issuedDate: invoiceData.issued_date,
                        bankName: invoiceData.bank_name || '',
                        bankAccountNo: invoiceData.bank_account_no || '',
                        bankAccountName: invoiceData.bank_account_name || '',
                    });
                }
            } catch (err) {
                console.error("Error fetching invoice:", err);
            }
        }

        fetchInvoice();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (!invoice) return <div className="p-10 text-center">Loading Invoice...</div>;

    return (
        <div className="max-w-[210mm] mx-auto p-4 md:p-8 space-y-6 print:p-0 print:m-0 print:w-full print:max-w-none">
            {/* Action Bar - Hidden on Print */}
            <div className="flex items-center justify-between print:hidden">
                <Link href="/invoices">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to List
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print / Save PDF
                    </Button>
                </div>
            </div>

            {/* A4 Paper Container */}
            <Card className="min-h-[297mm] shadow-lg print:shadow-none print:border-none rounded-none md:rounded-lg overflow-hidden bg-white text-slate-900 border border-slate-200">
                <CardContent className="p-8 md:p-12 print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-[#FFDA5C] text-black h-8 w-8 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    <span className="font-bold text-lg">*</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">Hubz KOL</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mt-6">INVOICE</h1>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 mb-1">Invoice #</div>
                            <div className="text-lg font-mono font-bold">{invoice.invoiceNumber}</div>
                            <div className="mt-4">
                                <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'} className="text-base px-4 py-1">
                                    {invoice.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Recipient */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-semibold uppercase text-slate-500 mb-2">Billed To</h3>
                            <div className="font-bold text-lg">{invoice.recipientName}</div>
                            <div className="text-slate-600 whitespace-pre-line mt-1">{invoice.recipientAddress}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-slate-500 mb-1">Issued Date</h3>
                                <div className="font-medium">{new Date(invoice.issuedDate).toLocaleDateString('en-GB')}</div>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold uppercase text-slate-500 mb-1">Due Date</h3>
                                <div className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-2 border-slate-900 bg-slate-50 print:bg-transparent">
                                    <TableHead className="text-slate-900 font-bold w-[50%]">Description</TableHead>
                                    <TableHead className="text-slate-900 font-bold text-center">Qty</TableHead>
                                    <TableHead className="text-slate-900 font-bold text-right">Price</TableHead>
                                    <TableHead className="text-slate-900 font-bold text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoice.items.map((item) => (
                                    <TableRow key={item.id} className="border-b border-slate-200">
                                        <TableCell className="py-4 font-medium">{item.description}</TableCell>
                                        <TableCell className="py-4 text-center text-slate-600">{item.quantity}</TableCell>
                                        <TableCell className="py-4 text-right text-slate-600">{formatIDR(item.price)}</TableCell>
                                        <TableCell className="py-4 text-right font-bold">{formatIDR(item.total)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Totals & Bank Info */}
                    <div className="grid grid-cols-2 gap-12 items-start">
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 print:bg-transparent print:border-2 print:border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">i</span>
                                Payment Details
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Bank Name:</span>
                                    <span className="font-medium">{invoice.bankName || MY_BANK_DETAILS.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Account No:</span>
                                    <span className="font-bold font-mono">{invoice.bankAccountNo || MY_BANK_DETAILS.accountNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Account Name:</span>
                                    <span className="font-medium">{invoice.bankAccountName || MY_BANK_DETAILS.accountName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatIDR(invoice.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Tax (0%)</span>
                                <span>Rp 0</span>
                            </div>
                            <Separator className="my-2 bg-slate-900" />
                            <div className="flex justify-between text-xl font-extrabold text-slate-900">
                                <span>Total Due</span>
                                <span>{formatIDR(invoice.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
                        <p>Thank you for your business!</p>
                        <p className="mt-1">For any inquiries, please contact support@hubzkol.com</p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
