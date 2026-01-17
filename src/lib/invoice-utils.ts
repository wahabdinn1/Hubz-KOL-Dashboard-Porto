export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    recipientName: string;
    recipientAddress: string;
    items: InvoiceItem[];
    totalAmount: number;
    status: InvoiceStatus;
    dueDate: string;
    issuedDate: string;
    // Relations
    kolId?: string;
    campaignId?: string;
    // Bank Snapshot
    bankName?: string;
    bankAccountNo?: string;
    bankAccountName?: string;
}

/**
 * Generates an invoice number in the format: INV-{YYYY}{MM}-{Random3Digits}
 * Example: INV-202601-842
 */
export function generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 900) + 100; // 100-999
    return `INV-${year}${month}-${random}`;
}

export const MY_BANK_DETAILS = {
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "My Name / Agency Name"
};
