"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Calculator, Link as LinkIcon, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIDR } from "@/lib/analytics";
import { generateInvoiceNumber, InvoiceItem } from "@/lib/invoice-utils";
import { useData } from "@/context/data-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface SearchableSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}

function SearchableSelect({ value, onChange, options, placeholder = "Select..." }: SearchableSelectProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value && value !== "none"
                        ? options.find((framework) => framework.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.label}
                                    onSelect={() => {
                                        onChange(framework.value);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default function CreateInvoicePage() {
    const router = useRouter();
    const { kols, campaigns } = useData();

    const [isLoading, setIsLoading] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [issuedDate, setIssuedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [status, setStatus] = useState("DRAFT");
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: "1", description: "", quantity: 1, price: 0, total: 0 }
    ]);

    // Bank Details State
    const [bankName, setBankName] = useState("BCA");
    const [accountNumber, setAccountNumber] = useState("1234567890");
    const [accountName, setAccountName] = useState("Hubz Agency");

    // Relations
    const [selectedKolId, setSelectedKolId] = useState<string>("none");
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("none");

    useEffect(() => {
        setInvoiceNumber(generateInvoiceNumber());
    }, []);

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 1, price: 0, total: 0 }
        ]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updates = { [field]: value };
                if (field === 'quantity' || field === 'price') {
                    const qty = field === 'quantity' ? Number(value) : item.quantity;
                    const price = field === 'price' ? Number(value) : item.price;
                    updates.total = qty * price;
                }
                return { ...item, ...updates };
            }
            return item;
        }));
    };

    const handleKolChange = (id: string) => {
        setSelectedKolId(id);
        if (id !== "none") {
            const kol = kols.find(k => k.id === id);
            if (kol) {
                setRecipientName(kol.name);
            }
        }
    };

    const handleSave = async () => {
        if (!recipientName) {
            toast.error("Please enter a recipient name");
            return;
        }

        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        if (items.some(item => !item.description.trim())) {
            toast.error("All items must have a description");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Insert Invoice
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: invoiceData, error: invoiceError } = await (supabase.from('invoices') as any).insert([{
                invoice_number: invoiceNumber,
                recipient_name: recipientName,
                recipient_address: recipientAddress,
                issued_date: issuedDate,
                due_date: dueDate,
                status: status,
                total_amount: calculateTotal(),
                kol_id: selectedKolId === "none" ? null : selectedKolId,
                campaign_id: selectedCampaignId === "none" ? null : selectedCampaignId,
                bank_name: bankName,
                bank_account_no: accountNumber,
                bank_account_name: accountName
            }]).select().single();

            if (invoiceError) throw invoiceError;

            // 2. Insert Items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const invData = invoiceData as any;
            const invoiceItems = items.map(item => ({
                invoice_id: invData.id,
                description: item.description,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            }));
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: itemsError } = await (supabase.from('invoice_items') as any).insert(invoiceItems);
            if (itemsError) throw itemsError;

            toast.success("Invoice created successfully!");
            router.push('/invoices');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Error saving invoice:", error);
            toast.error(`Failed to save: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">New Invoice</h2>
                    <p className="text-muted-foreground">Create and send a new invoice to your client.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setInvoiceNumber(generateInvoiceNumber())}>
                        <Calculator className="mr-2 h-4 w-4" />
                        Regenerate #
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading ? "Saving..." : "Save Invoice"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Form Area */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Relations Section */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg border border-muted">
                                <div className="space-y-2 flex flex-col">
                                    <Label className="flex items-center gap-2 mb-1">
                                        <LinkIcon className="h-3 w-3" /> Link KOL (Optional)
                                    </Label>
                                    <SearchableSelect
                                        value={selectedKolId}
                                        onChange={handleKolChange}
                                        options={[{ value: "none", label: "None" }, ...kols.map(k => ({ value: k.id, label: k.name }))]}
                                        placeholder="Select KOL..."
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    <Label className="flex items-center gap-2 mb-1">
                                        <LinkIcon className="h-3 w-3" /> Link Campaign (Optional)
                                    </Label>
                                    <SearchableSelect
                                        value={selectedCampaignId}
                                        onChange={setSelectedCampaignId}
                                        options={[{ value: "none", label: "None" }, ...campaigns.map(c => ({ value: c.id, label: c.name }))]}
                                        placeholder="Select Campaign..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Invoice Number</Label>
                                    <Input value={invoiceNumber} readOnly className="bg-muted font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="PAID">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Recipient Name / Company</Label>
                                <Input
                                    placeholder="e.g., PT Maju Mundur"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Recipient Address</Label>
                                <Textarea
                                    placeholder="Full billing address..."
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Issued Date</Label>
                                    <Input
                                        type="date"
                                        value={issuedDate}
                                        onChange={(e) => setIssuedDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button size="sm" variant="secondary" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Description</TableHead>
                                        <TableHead className="w-[15%] text-center">Qty</TableHead>
                                        <TableHead className="w-[20%]">Price</TableHead>
                                        <TableHead className="w-[20%] text-right">Total</TableHead>
                                        <TableHead className="w-[5%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Input
                                                    placeholder="Item description"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                />
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Description of the work (e.g. &quot;Instagram Reels Creation&quot;)
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    className="text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatIDR(item.total)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {items.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground text-sm">
                                    No items added. Click &quot;Add Item&quot; to start.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatIDR(calculateTotal())}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (0%)</span>
                                <span>Rp 0</span>
                            </div>
                            <div className="border-t border-border pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-xl text-primary">{formatIDR(calculateTotal())}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Bank Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Bank Name</Label>
                                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="h-8" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Account No.</Label>
                                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="h-8" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Account Name</Label>
                                <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} className="h-8" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
