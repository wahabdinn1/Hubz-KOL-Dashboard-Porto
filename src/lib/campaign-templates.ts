import { Campaign } from "@/lib/static-data";

export interface CampaignTemplate {
    id: string;
    name: string;
    description: string;
    defaultValues: Partial<Omit<Campaign, "id" | "deliverables">>;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
    {
        id: "product-launch",
        name: "Product Launch",
        description: "Perfect for new product announcements with high-impact influencers",
        defaultValues: {
            platform: "TikTok",
            budget: 50000000, // 50M IDR
        },
    },
    {
        id: "brand-awareness",
        name: "Brand Awareness",
        description: "Long-term campaign to build brand recognition across platforms",
        defaultValues: {
            platform: "Instagram",
            budget: 100000000, // 100M IDR
        },
    },
    {
        id: "event-promotion",
        name: "Event Promotion",
        description: "Short-term intensive campaign for events and launches",
        defaultValues: {
            platform: "TikTok",
            budget: 25000000, // 25M IDR
        },
    },
    {
        id: "seasonal-sale",
        name: "Seasonal Sale",
        description: "Drive traffic during major shopping seasons (Ramadan, 12.12, etc.)",
        defaultValues: {
            platform: "TikTok",
            budget: 75000000, // 75M IDR
        },
    },
];
