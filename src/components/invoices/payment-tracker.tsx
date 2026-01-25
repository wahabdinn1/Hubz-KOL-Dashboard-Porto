"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/retroui/Progress";
import { Plus, Check, DollarSign, Calendar } from "lucide-react";
import { formatIDR } from "@/lib/analytics";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    payment_method?: string;
    notes?: string;
    created_at: string;
}

interface PaymentTrackerProps {
    invoiceId: string;
    totalAmount: number;
    invoiceStatus: string;
    onStatusChange?: (newStatus: string) => void;
}

export function PaymentTracker({
    invoiceId,
    totalAmount,
    invoiceStatus,
    onStatusChange,
}: PaymentTrackerProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({
        amount: "",
        payment_method: "",
        notes: "",
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remainingBalance = totalAmount - totalPaid;
    const paidPercentage = totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

    useEffect(() => {
        fetchPayments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invoiceId]);

    async function fetchPayments() {
        setLoading(true);
        try {
            // Cast to any since payments table may not be in generated types yet
            const { data, error } = await (supabase as unknown as { from: (table: string) => { select: (cols: string) => { eq: (col: string, val: string) => { order: (col: string, opts: { ascending: boolean }) => Promise<{ data: Payment[] | null; error: Error | null }> } } } }).from("payments")
                .select("*")
                .eq("invoice_id", invoiceId)
                .order("payment_date", { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (err) {
            console.error("Error fetching payments:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddPayment() {
        if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        const paymentAmount = parseFloat(newPayment.amount);

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any).from("payments").insert({
                invoice_id: invoiceId,
                amount: paymentAmount,
                payment_date: new Date().toISOString(),
                payment_method: newPayment.payment_method || null,
                notes: newPayment.notes || null,
            });

            if (error) throw error;

            toast.success("Payment recorded successfully");
            setNewPayment({ amount: "", payment_method: "", notes: "" });
            setIsDialogOpen(false);
            fetchPayments();

            // Check if fully paid
            const newTotalPaid = totalPaid + paymentAmount;
            if (newTotalPaid >= totalAmount && invoiceStatus !== "PAID") {
                // Update invoice status to PAID
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                    .from("invoices")
                    .update({ status: "PAID" })
                    .eq("id", invoiceId);
                onStatusChange?.("PAID");
                toast.success("Invoice marked as fully paid!");
            }
        } catch (err) {
            console.error("Error adding payment:", err);
            toast.error("Failed to record payment");
        }
    }

    if (loading) {
        return <div className="text-sm text-muted-foreground">Loading payments...</div>;
    }

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] print:hidden">
            <CardHeader className="border-b-2 border-black pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment Tracking
                    </CardTitle>
                    {invoiceStatus !== "PAID" && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Payment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <DialogHeader>
                                    <DialogTitle>Record Payment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            placeholder="Enter amount"
                                            value={newPayment.amount}
                                            max={remainingBalance}
                                            onChange={(e) =>
                                                setNewPayment({ ...newPayment, amount: e.target.value })
                                            }
                                            className="border-2 border-black"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Remaining: {formatIDR(remainingBalance)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="method">Payment Method</Label>
                                        <Input
                                            id="method"
                                            placeholder="e.g. Bank Transfer, Cash"
                                            value={newPayment.payment_method}
                                            onChange={(e) =>
                                                setNewPayment({ ...newPayment, payment_method: e.target.value })
                                            }
                                            className="border-2 border-black"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Input
                                            id="notes"
                                            placeholder="Reference number, etc."
                                            value={newPayment.notes}
                                            onChange={(e) =>
                                                setNewPayment({ ...newPayment, notes: e.target.value })
                                            }
                                            className="border-2 border-black"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                            className="border-2 border-black"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddPayment}
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                                        >
                                            Record Payment
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Payment Progress</span>
                        <span className="text-muted-foreground">{paidPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={paidPercentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Paid: {formatIDR(totalPaid)}</span>
                        <span>Remaining: {formatIDR(remainingBalance)}</span>
                    </div>
                </div>

                {/* Payment history */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Payment History</h4>
                    {payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded">
                            No payments recorded yet
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded border hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">
                                                {formatIDR(payment.amount)}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(payment.payment_date), "dd MMM yyyy")}
                                                {payment.payment_method && (
                                                    <>
                                                        <span className="mx-1">•</span>
                                                        {payment.payment_method}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {payment.notes && (
                                        <Badge variant="outline" className="text-xs">
                                            {payment.notes}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Full payment status */}
                {invoiceStatus === "PAID" && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded text-green-700 dark:text-green-400">
                        <Check className="h-5 w-5" />
                        <span className="font-bold">Fully Paid</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
