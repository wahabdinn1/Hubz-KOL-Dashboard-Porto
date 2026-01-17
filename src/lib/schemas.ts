import { z } from "zod";

export const KOLSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(1, "Username is required").transform(val => val.startsWith('@') ? val : `@${val}`),
    platform: z.enum(["TikTok", "Instagram"]),
    followers: z.coerce.number().min(0, "Followers must be a positive number"),
    avg_views: z.coerce.number().min(0, "Average views must be a positive number"),
    er: z.coerce.number().min(0).max(100, "ER must be between 0 and 100"),
    rate_card_min: z.coerce.number().min(0).optional(),
    rate_card_max: z.coerce.number().min(0).optional(),
    contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const CampaignSchema = z.object({
    name: z.string().min(3, "Campaign name must be at least 3 characters"),
    platform: z.enum(["TikTok", "Instagram"]),
    budget: z.coerce.number().min(100000, "Budget must be at least 100,000"),
    objective: z.string().min(1, "Objective is required"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

export type KOLFormValues = z.infer<typeof KOLSchema>;
export type CampaignFormValues = z.infer<typeof CampaignSchema>;
