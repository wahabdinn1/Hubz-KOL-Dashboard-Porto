"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { MOCK_KOLS, MOCK_CAMPAIGNS } from "@/lib/static-data";
import { generateInvoiceNumber } from "@/components/invoices/utils";

export function SeedDataButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSeed = async () => {
        if (!confirm("⚠️ WARNING: This will populate your database with dummy data. Existing data (Categories, KOLs, Campaigns, Invoices) might be affected. Continue?")) {
            return;
        }

        setStatus("loading");
        setMessage("Starting seed...");

        try {
            // 0. Seed Categories
            setMessage("Seeding Categories...");
            // Extract unique categories from MOCK_KOLS
            const uniqueCategories = Array.from(new Set(MOCK_KOLS.map(k => k.category).filter(Boolean)));
            
            // Fetch existing categories to map
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingCategories } = await (supabase.from('categories') as any).select('id, name');
            const categoryMap = new Map<string, string>();
            
            // Map existing
            if (existingCategories) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                existingCategories.forEach((c: any) => categoryMap.set(c.name, c.id));
            }

            // Insert missing categories
            for (const catName of uniqueCategories) {
                if (!categoryMap.has(catName)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: newCat, error: catError } = await (supabase.from('categories') as any)
                        .insert([{ name: catName, sort_order: categoryMap.size + 1 }])
                        .select()
                        .single();
                    
                    if (catError) throw new Error(`Category Error: ${catError.message}`);
                    if (newCat) categoryMap.set(catName, newCat.id);
                }
            }


            // 1. Seed KOLs
            setMessage("Seeding KOLs...");
            const kolPayloads = MOCK_KOLS.map(k => ({
                id: k.id, // Keep consistent IDs for relationships
                name: k.name,
                type: k.type,
                // category: k.category, // Removed, use category_id
                category_id: categoryMap.get(k.category) || null,
                followers: k.followers,
                avg_views: k.avgViews,
                er: 2.5, // Default ER
                platform: 'TikTok', // Default platform
                tiktok_username: k.tiktokUsername,
                tiktok_profile_link: k.tiktokProfileLink,
                tiktok_followers: k.tiktokFollowers,
                instagram_username: k.instagramUsername,
                instagram_profile_link: k.instagramProfileLink,
                instagram_followers: k.instagramFollowers,
                rate_card_tiktok: k.rateCardTiktok,
                rate_card_reels: k.rateCardReels,
                // Mandatory fields for new schema
                username: k.tiktokUsername || k.instagramUsername || 'unknown'
            }));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: kolError } = await (supabase.from('kols') as any).upsert(kolPayloads);
            if (kolError) throw new Error(`KOL Error: ${kolError.message}`);

            // 2. Seed Campaigns
            setMessage("Seeding Campaigns...");
            const campaigns = MOCK_CAMPAIGNS;

            for (const camp of campaigns) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: campError } = await (supabase.from('campaigns') as any).upsert({
                    id: camp.id,
                    name: camp.name,
                    budget: camp.budget,
                    start_date: camp.startDate,
                    end_date: camp.endDate,
                    platform: camp.platform,
                    objective: camp.objective,
                    status: camp.status || 'Active'
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
                        status: d.status || 'to_contact'
                    }));

                    // Delete existing deliverables for this campaign to avoid duplicates/constraint issues
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from('campaign_deliverables') as any).delete().eq('campaign_id', camp.id);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { error: delError } = await (supabase.from('campaign_deliverables') as any).insert(delivPayloads);
                    if (delError) throw new Error(`Deliverable Error: ${delError.message}`);
                }
            }

            // 4. Seed Invoices
            setMessage("Seeding Invoices...");
            
            // Create a few sample invoices
            // Sample 1: Invoice for a KOL (KOL 1)
            const kol1 = MOCK_KOLS[0];
            const invoice1Id = 'inv_seed_001';
            const invoice1Items = [
                { description: 'TikTok Video Creation - Ramadan Campaign', quantity: 1, price: 15000000, total: 15000000 },
                { description: 'Content Usage Rights (3 Months)', quantity: 1, price: 5000000, total: 5000000 }
            ];
            const total1 = invoice1Items.reduce((acc, item) => acc + item.total, 0);

            const invoice1 = {
                id: invoice1Id, // consistent ID for testing
                invoice_number: generateInvoiceNumber(),
                recipient_name: kol1.name,
                recipient_address: 'Jakarta, Indonesia',
                issued_date: new Date().toISOString(),
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
                status: 'UNPAID',
                total_amount: total1,
                kol_id: kol1.id,
                campaign_id: MOCK_CAMPAIGNS[0].id,
                bank_name: 'BCA',
                bank_account_no: '1234567890',
                bank_account_name: kol1.name
            };

            // Sample 2: Invoice for a Campaign (Agency Fee or similar) - just another example
            // Or maybe another KOL invoice
            const kol2 = MOCK_KOLS[1];
            const invoice2Id = 'inv_seed_002';
            const total2 = 150000000;
            const invoice2 = {
                id: invoice2Id,
                invoice_number: generateInvoiceNumber(),
                recipient_name: kol2.name,
                recipient_address: 'Bandung, Indonesia',
                issued_date: new Date().toISOString(),
                due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'PAID',
                total_amount: total2,
                kol_id: kol2.id,
                campaign_id: MOCK_CAMPAIGNS[0].id,
                bank_name: 'Mandiri',
                bank_account_no: '0987654321',
                bank_account_name: kol2.name
            };

            const invoices = [invoice1, invoice2];
            
            for (const inv of invoices) {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const { error: invError } = await (supabase.from('invoices') as any).upsert(inv);
                 if (invError) throw new Error(`Invoice Error: ${invError.message}`);
                 
                 // Seed Items
                 // Delete existing first
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 await (supabase.from('invoice_items') as any).delete().eq('invoice_id', inv.id);

                 const items = inv.id === invoice1Id ? invoice1Items : [{ description: 'Campaign Fee', quantity: 1, price: total2, total: total2 }];
                 const itemPayloads = items.map(item => ({
                     invoice_id: inv.id,
                     ...item
                 }));
                 
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const { error: itemError } = await (supabase.from('invoice_items') as any).insert(itemPayloads);
                 if (itemError) throw new Error(`Invoice Item Error: ${itemError.message}`);
            }

            setStatus("success");
            setMessage("Database seeded successfully! Please refresh.");
        } catch (error: unknown) {
            console.error(error);
            setStatus("error");
            setMessage((error as Error).message || "Failed to seed data");
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
