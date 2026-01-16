import { KOL, Campaign, CampaignDeliverable } from "@/lib/static-data";

/**
 * Export data to CSV format and trigger download
 */
export function exportToCSV<T extends object>(
    data: T[],
    filename: string,
    columns?: { key: keyof T; label: string }[]
) {
    if (data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // If no columns specified, use all keys from first row
    const cols = columns || Object.keys(data[0]).map((key) => ({
        key: key as keyof T,
        label: key as string,
    }));

    // Create header row
    const headers = cols.map((col) => `"${col.label}"`).join(",");

    // Create data rows
    const rows = data.map((row) =>
        cols
            .map((col) => {
                const value = row[col.key];
                if (value === null || value === undefined) return '""';
                if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
                if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                return `"${value}"`;
            })
            .join(",")
    );

    // Combine and create blob
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Trigger download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Pre-defined column configurations for common exports
export const KOL_EXPORT_COLUMNS: { key: keyof KOL; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "type", label: "Tier" },
    { key: "category", label: "Category" },
    { key: "tiktokFollowers", label: "TikTok Followers" },
    { key: "instagramFollowers", label: "Instagram Followers" },
    { key: "tiktokUsername", label: "TikTok Username" },
    { key: "instagramUsername", label: "Instagram Username" },
    { key: "rateCardTiktok", label: "TikTok Rate (IDR)" },
    { key: "rateCardReels", label: "Reels Rate (IDR)" },
];

export const CAMPAIGN_EXPORT_COLUMNS: { key: keyof Campaign; label: string }[] = [
    { key: "name", label: "Campaign Name" },
    { key: "platform", label: "Platform" },
    { key: "budget", label: "Budget (IDR)" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
];

export const DELIVERABLE_EXPORT_COLUMNS: { key: keyof CampaignDeliverable; label: string }[] = [
    { key: "kolId", label: "KOL ID" },
    { key: "status", label: "Status" },
    { key: "videosCount", label: "Videos" },
    { key: "totalViews", label: "Total Views" },
    { key: "salesGenerated", label: "Sales (IDR)" },
];
