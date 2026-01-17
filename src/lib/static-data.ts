import { KOL, Campaign, Category, CampaignDeliverable, Note } from "@/types";

export type { KOL, Campaign, Category, CampaignDeliverable, Note };

export const MOCK_KOLS: KOL[] = [
    // MEGA (1M+)
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Aurelia S.',
        type: 'Mega',
        category: 'Beauty',
        followers: 1200000,
        avgViews: 450000,
        tiktokUsername: '@aurelia.beauty',
        tiktokFollowers: 1200000,
        instagramUsername: '@aurelia.official',
        instagramFollowers: 800000,
        rateCardTiktok: 15000000,
        rateCardReels: 12000000
    },
    {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        name: 'Raffi Ahmad (Parody)',
        type: 'Mega',
        category: 'Lifestyle',
        followers: 25000000,
        avgViews: 2000000,
        tiktokUsername: '@raffi.fakes',
        tiktokFollowers: 25000000,
        instagramUsername: '@raffi.check',
        instagramFollowers: 50000000,
        rateCardTiktok: 150000000,
        rateCardReels: 200000000
    },
    {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        name: 'Chef Juna (Fans)',
        type: 'Mega',
        category: 'Food',
        followers: 3500000,
        avgViews: 800000,
        tiktokUsername: '@junarorimpandey',
        tiktokFollowers: 3500000,
        rateCardTiktok: 45000000
    },

    // MACRO (100k - 1M)
    {
        id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
        name: 'GadgetIndo',
        type: 'Macro',
        category: 'Tech',
        followers: 550000,
        avgViews: 200000,
        tiktokUsername: '@gadgetindo_review',
        tiktokFollowers: 550000,
        rateCardTiktok: 8000000
    },
    {
        id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
        name: 'Julia Fashion',
        type: 'Macro',
        category: 'Fashion',
        followers: 250000,
        avgViews: 90000,
        tiktokUsername: '@julia.ootd',
        tiktokFollowers: 250000,
        rateCardTiktok: 5000000
    },
    {
        id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
        name: 'Fitness Budi',
        type: 'Macro',
        category: 'Sports',
        followers: 800000,
        avgViews: 300000,
        tiktokUsername: '@budi_gym',
        tiktokFollowers: 400000,
        instagramUsername: '@budifit',
        instagramFollowers: 400000,
        rateCardTiktok: 10000000,
        rateCardReels: 12000000
    },
    {
        id: 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
        name: 'Travel with Sarah',
        type: 'Macro',
        category: 'Travel',
        followers: 600000,
        avgViews: 150000,
        tiktokUsername: '@sarah.travels',
        tiktokFollowers: 600000,
        rateCardTiktok: 7500000
    },

    // MICRO (10k - 100k)
    {
        id: 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18',
        name: 'JajananViral',
        type: 'Micro',
        category: 'Food',
        followers: 85000,
        avgViews: 120000,
        tiktokUsername: '@jajanan_viral_indo',
        tiktokFollowers: 85000,
        rateCardTiktok: 1500000
    },
    {
        id: 'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a19',
        name: 'Sinta Gaming',
        type: 'Micro',
        category: 'Gaming',
        followers: 45000,
        avgViews: 25000,
        tiktokUsername: '@sinta_plays',
        tiktokFollowers: 45000,
        rateCardTiktok: 1000000
    },
    {
        id: 'd9eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
        name: 'Mommy Tips',
        type: 'Micro',
        category: 'Family',
        followers: 60000,
        avgViews: 30000,
        tiktokUsername: '@mommy_tips_id',
        tiktokFollowers: 60000,
        rateCardTiktok: 1200000
    },
    {
        id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
        name: 'CryptoKing (Small)',
        type: 'Micro',
        category: 'Finance',
        followers: 15000,
        avgViews: 5000,
        tiktokUsername: '@crypto.pemula',
        tiktokFollowers: 15000,
        rateCardTiktok: 800000
    },

    // NANO (< 10k)
    {
        id: 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        name: 'Budi Daily',
        type: 'Nano',
        category: 'Lifestyle',
        followers: 5000,
        avgViews: 2000,
        tiktokUsername: '@budidailyvlog',
        tiktokFollowers: 5000,
        rateCardTiktok: 300000
    },
    {
        id: 'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
        name: 'Cat Lovers Bandung',
        type: 'Nano',
        category: 'Pets',
        followers: 8500,
        avgViews: 4000,
        tiktokUsername: '@kucing_bdg',
        tiktokFollowers: 8500,
        rateCardTiktok: 400000
    },
    {
        id: 'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
        name: 'Review Jujur',
        type: 'Nano',
        category: 'Beauty',
        followers: 2500,
        avgViews: 1000,
        tiktokUsername: '@review.jujur.skincare',
        tiktokFollowers: 2500,
        rateCardTiktok: 150000
    },
    {
        id: 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a25',
        name: 'Indie Music ID',
        type: 'Nano',
        category: 'Music',
        followers: 9000,
        avgViews: 5000,
        tiktokUsername: '@indie.music.id',
        tiktokFollowers: 9000,
        rateCardTiktok: 500000
    }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
        name: 'Ramadan Sale 2025',
        budget: 50000000,
        startDate: '2025-03-01',
        endDate: '2025-04-01',
        platform: 'TikTok',
        objective: 'CONVERSION',
        status: 'Active',
        deliverables: [
            {
                kolId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // kol-1
                videosCount: 1,
                totalViews: 520000,
                totalEngagements: 47900,
                detailedEngagements: { likes: 45000, shares: 2100, comments: 800 },
                clicks: 15000,
                orders: 450,
                salesGenerated: 35000000,
                status: 'completed',
            },
            {
                kolId: 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', // kol-5
                videosCount: 5,
                totalViews: 800000,
                totalEngagements: 95000,
                detailedEngagements: { likes: 90000, shares: 3500, comments: 1500 },
                clicks: 22000,
                orders: 890,
                salesGenerated: 18500000,
                status: 'completed',
            }
        ],
    },
    {
        id: '20eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
        name: 'New Product Launch - Skincare',
        budget: 150000000,
        startDate: '2025-01-10',
        endDate: '2025-02-10',
        platform: 'Instagram',
        objective: 'AWARENESS',
        status: 'Active',
        deliverables: [
            {
                kolId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // kol-1
                videosCount: 2,
                totalViews: 1200000,
                totalEngagements: 80000,
                salesGenerated: 0,
                status: 'to_contact'
            },
            {
                kolId: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', // kol-mega-1
                videosCount: 1,
                totalViews: 500000,
                totalEngagements: 10000,
                salesGenerated: 0,
                status: 'negotiating'
            }
        ]
    },
    {
        id: '30eebc99-9c0b-4ef8-bb6d-6bb9bd380b03',
        name: 'Year End Clearance',
        budget: 20000000,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        platform: 'TikTok',
        objective: 'CONVERSION',
        status: 'Completed',
        deliverables: [
            {
                kolId: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', // kol-3
                videosCount: 3,
                totalViews: 300000,
                totalEngagements: 15000,
                salesGenerated: 45000000,
                status: 'completed'
            }
        ]
    }
];

// Re-export for compatibility
export const CAMPAIGN_RAMADAN = MOCK_CAMPAIGNS[0];
export const KOLS = MOCK_KOLS;
