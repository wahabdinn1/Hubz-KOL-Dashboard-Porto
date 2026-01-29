import { z } from "zod";

export const kolFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    categoryId: z.string().min(1, "Category is required"),
    avatar: z.string(),
    
    // TikTok
    tiktokUsername: z.string(),
    tiktokProfileLink: z.string(),
    tiktokFollowers: z.string(),
    
    // Instagram
    instagramUsername: z.string(),
    instagramProfileLink: z.string(),
    instagramFollowers: z.string(),
    
    // Rates
    rateCardTiktok: z.string(),
    rateCardReels: z.string(),
    rateCardPdfLink: z.string(),
    
    // WhatsApp
    whatsappNumber: z.string(),
    
    // Collaboration
    collaborationType: z.enum(["PAID", "AFFILIATE"]),
    defaultCommissionRate: z.string(),
});

export type KOLFormValues = z.infer<typeof kolFormSchema>;
