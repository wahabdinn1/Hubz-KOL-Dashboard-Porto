"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { MOCK_KOLS, MOCK_CAMPAIGNS, KOL, Campaign } from "@/lib/static-data";

export function SeedDataButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSeed = async () => {
        if (!confirm("⚠️ WARNING: This will populate your database with dummy data. Existing data with same IDs might be affected. Continue?")) {
            return;
        }

        setStatus("loading");
        setMessage("Starting seed...");

        try {
            // 1. Seed KOLs
            setMessage("Seeding KOLs...");
            const kolPayloads = MOCK_KOLS.map(k => ({
                id: k.id, // Keep consistent IDs for relationships
                name: k.name,
                type: k.type,
                category: k.category,
                followers: k.followers,
                avg_views: k.avgViews,
                tiktok_username: k.tiktokUsername,
                tiktok_profile_link: k.tiktokProfileLink,
                tiktok_followers: k.tiktokFollowers,
                instagram_username: k.instagramUsername,
                instagram_profile_link: k.instagramProfileLink,
                instagram_followers: k.instagramFollowers,
                rate_card_tiktok: k.rateCardTiktok,
                rate_card_reels: k.rateCardReels
            }));

            const { error: kolError } = await supabase.from('kols').upsert(kolPayloads);
            if (kolError) throw new Error(`KOL Error: ${kolError.message}`);

            // 2. Seed Campaigns
            setMessage("Seeding Campaigns...");
            const campaigns = MOCK_CAMPAIGNS;

            for (const camp of campaigns) {
                const { error: campError } = await supabase.from('campaigns').upsert({
                    id: camp.id,
                    name: camp.name,
                    budget: camp.budget,
                    start_date: camp.startDate,
                    end_date: camp.endDate,
                    platform: camp.platform,
                    objective: camp.objective
                    // status field does not exist in DB schema
                });

                if (campError) throw new Error(`Campaign Error: ${campError.message}`);

                // 3. Seed Deliverables
                if (camp.deliverables.length > 0) {
                    const delivPayloads = camp.deliverables.map(d => ({
                        campaign_id: camp.id,
                        kol_id: d.kolId,
                        videos_count: d.videosCount,
                        total_views: d.totalViews,
                        total_engagements: d.totalEngagements,
                        sales_generated: d.salesGenerated,
                    }));

                    // Delete existing deliverables for this campaign to avoid duplicates/constraint issues
                    await supabase.from('campaign_deliverables').delete().eq('campaign_id', camp.id);

                    const { error: delError } = await supabase.from('campaign_deliverables').insert(delivPayloads);
                    if (delError) throw new Error(`Deliverable Error: ${delError.message}`);
                }
            }

            setStatus("success");
            setMessage("Database seeded successfully! Please refresh.");
        } catch (error: any) {
            console.error(error);
            setStatus("error");
            setMessage(error.message || "Failed to seed data");
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={handleSeed}
                disabled={status === "loading"}
                variant={status === "error" ? "destructive" : "outline"}
                className="w-full sm:w-auto gap-2"
            >
                {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                    <Database className="h-4 w-4" />
                )}
                {status === "loading" ? "Seeding..." : "Seed Dummy Data"}
            </Button>
            {message && (
                <p className={`text-xs ${status === "error" ? "text-red-500" : status === "success" ? "text-green-500" : "text-muted-foreground"}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
