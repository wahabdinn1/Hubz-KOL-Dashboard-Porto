import { format } from "date-fns";

export interface ContractData {
    KOL_NAME?: string;
    KOL_NIK?: string;
    KOL_ADDRESS?: string;
    BRAND_NAME?: string;
    FEE_AMOUNT?: number;
    SOW?: string;
    PAYMENT_TERMS?: string;
    START_DATE?: string | Date;
    END_DATE?: string | Date;
}

export function hydrateContract(template: string, data: ContractData): string {
    let content = template;

    // Helper to escape regex special characters if we were using dynamic regex, 
    // but here we know our keys are safe {KEY}.
    
    // 1. Basic Text Replacements
    content = content.replace(/{KOL_NAME}/g, data.KOL_NAME || "____________________");
    content = content.replace(/{KOL_NIK}/g, data.KOL_NIK || "____________________");
    content = content.replace(/{KOL_ADDRESS}/g, data.KOL_ADDRESS || "____________________");
    content = content.replace(/{BRAND_NAME}/g, data.BRAND_NAME || "____________________");
    content = content.replace(/{SOW}/g, data.SOW || "____________________");
    content = content.replace(/{PAYMENT_TERMS}/g, data.PAYMENT_TERMS || "____________________");

    // 2. Formatted Replacements
    
    // FEE_AMOUNT -> IDR Currency
    if (data.FEE_AMOUNT !== undefined) {
        const formattedFee = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(data.FEE_AMOUNT);
        content = content.replace(/{FEE_AMOUNT}/g, formattedFee);
    } else {
        content = content.replace(/{FEE_AMOUNT}/g, "Rp ____________________");
    }

    // Dates -> dd MMMM yyyy
    const formatDate = (date?: string | Date) => {
        if (!date) return "____________________";
        try {
            return format(new Date(date), "d MMMM yyyy");
        } catch {
            return String(date);
        }
    };

    content = content.replace(/{START_DATE}/g, formatDate(data.START_DATE));
    content = content.replace(/{END_DATE}/g, formatDate(data.END_DATE));
    content = content.replace(/{TODAY_DATE}/g, format(new Date(), "d MMMM yyyy"));

    return content;
}
