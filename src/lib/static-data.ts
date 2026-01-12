export interface KOL {
    id: string;
    name: string;
    type: "Macro" | "Micro" | "Nano";
    category: string;
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

export const KOLS: KOL[] = [
    {
        id: 'kol-1',
        name: 'Aurelia S.',
        type: 'Macro',
        category: 'Beauty',
        followers: 1200000,
        avgViews: 450000,
    },
    {
        id: 'kol-2',
        name: 'GadgetIndo',
        type: 'Macro',
        category: 'Tech',
        followers: 550000,
        avgViews: 200000,
    },
    {
        id: 'kol-3',
        name: 'JajananViral',
        type: 'Micro',
        category: 'Food',
        followers: 85000,
        avgViews: 120000,
    },
];

export const CAMPAIGN_RAMADAN: Campaign = {
    id: 'cmp-1',
    name: 'Ramadan Sale 2025',
    budget: 50000000,
    platform: 'TikTok',
    objective: 'CONVERSION',
    status: 'Active',
    deliverables: [
        {
            kolId: 'kol-1',
            videosCount: 1,
            totalViews: 520000,
            totalEngagements: 47900,
            detailedEngagements: {
                likes: 45000,
                shares: 2100,
                comments: 800,
            },
            clicks: 15000,
            orders: 450,
            salesGenerated: 35000000,
        },
        {
            kolId: 'kol-2',
            videosCount: 2,
            totalViews: 380000,
            totalEngagements: 15000,
            detailedEngagements: { likes: 14000, shares: 500, comments: 500 },
            clicks: 8500,
            orders: 200,
            salesGenerated: 22000000,
        },
        {
            kolId: 'kol-3',
            videosCount: 5,
            totalViews: 800000,
            totalEngagements: 95000,
            detailedEngagements: { likes: 90000, shares: 3500, comments: 1500 },
            clicks: 22000,
            orders: 890,
            salesGenerated: 18500000,
        },
    ],
};
