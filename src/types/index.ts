export interface KOL {
    id: string;
    name: string;
    type: "Macro" | "Micro" | "Nano" | "Mega";
    category: string;
    categoryId?: string;
    followers: number; // Total / Primary
    avgViews: number;
    // New Fields
    tiktokUsername?: string;
    tiktokProfileLink?: string;
    tiktokFollowers?: number;
    instagramUsername?: string;
    instagramProfileLink?: string;
    instagramFollowers?: number;
    rateCardTiktok?: number;
    rateCardReels?: number;
    rateCardPdfLink?: string;
}

export interface Note {
    id: string;
    kolId: string;
    content: string;
    createdAt: string;
}

export interface CampaignDeliverable {
    kolId: string;
    videosCount: number;
    totalViews: number;
    totalEngagements: number;
    detailedEngagements?: {
        likes: number;
        shares: number;
        comments: number;
    };
    clicks?: number;
    orders?: number;
    salesGenerated: number;
    status: 'to_contact' | 'negotiating' | 'content_creation' | 'posted' | 'completed';
    contentLink?: string;
    dueDate?: string;
    notes?: string;
}

export interface Category {
    id: string;
    name: string;
    sort_order?: number;
}

export interface Campaign {
    id: string;
    name: string;
    budget: number;
    startDate?: string;
    endDate?: string;
    platform: 'TikTok' | 'Instagram';
    objective: 'AWARENESS' | 'CONVERSION';
    status: 'Active' | 'Completed' | 'Draft';
    deliverables: CampaignDeliverable[];
}
