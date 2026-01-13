"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { KOL, Campaign, Category, CAMPAIGN_RAMADAN } from "@/lib/static-data";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DataContextType {
    kols: KOL[];
    campaigns: Campaign[];
    categories: Category[];
    activeCampaign: Campaign | null;
    activeCampaignId: string | null;
    setActiveCampaignId: (id: string) => void;
    addCampaign: (name: string, budget: number, platform: 'TikTok' | 'Instagram', objective: 'AWARENESS' | 'CONVERSION', startDate?: string, endDate?: string) => Promise<void>;
    addKOL: (kol: KOL, addToCurrentCampaign?: boolean) => Promise<void>;
    updateKOL: (id: string, updates: Partial<KOL>) => Promise<void>;
    deleteKOL: (id: string) => Promise<void>;
    addCampaignDeliverable: (kolId: string) => void;
    removeCampaignDeliverable: (kolId: string) => void;
    addKOLToCampaign: (kolId: string) => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategoryOrder: (categories: Category[]) => Promise<void>;
    deleteCampaign: (id: string) => Promise<void>;
    deleteKOLs: (ids: string[]) => Promise<void>;
    deleteCampaigns: (ids: string[]) => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateCampaignDeliverableDB: (campaignId: string, kolId: string, metrics: any) => Promise<void>;
    addCampaignDeliverableDB: (kolId: string, campaignId: string) => Promise<void>;
    removeKOLFromCampaignDB: (campaignId: string, kolId: string) => Promise<void>;
    updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
    campaign: Campaign;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
    const activeIdRef = useRef(activeCampaignId);

    // Initial Active Campaign Set logic could be moved or kept as effect depending on pref.
    // We'll reset it if campaigns change and nothing is selected.

    useEffect(() => {
        activeIdRef.current = activeCampaignId;
    }, [activeCampaignId]);

    // 1. Fetch KOLs
    const { data: kols = [], isLoading: kolsLoading } = useQuery({
        queryKey: ['kols'],
        queryFn: async () => {
            const { data, error } = await supabase.from('kols').select('*');
            if (error) throw error;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((k: any) => ({
                id: k.id,
                name: k.name,
                type: k.type,
                category: k.category,
                followers: k.followers,
                avgViews: k.avg_views,
                tiktokUsername: k.tiktok_username,
                tiktokProfileLink: k.tiktok_profile_link,
                tiktokFollowers: k.tiktok_followers,
                instagramUsername: k.instagram_username,
                instagramProfileLink: k.instagram_profile_link,
                instagramFollowers: k.instagram_followers,
                rateCardTiktok: k.rate_card_tiktok,
                rateCardReels: k.rate_card_reels,
                rateCardPdfLink: k.rate_card_pdf_link
            })) as KOL[];
        }
    });

    // 2. Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
            if (error) {
                if (error.code === '42703') {
                    const retry = await supabase.from('categories').select('*');
                    return retry.data?.map(c => ({ id: c.id, name: c.name, sort_order: c.sort_order })) || [];
                }
                throw error;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((c: any) => ({ id: c.id, name: c.name, sort_order: c.sort_order })) as Category[];
        }
    });

    // 3. Fetch Campaigns & Deliverables
    const { data: rawCampaigns = [], isLoading: campaignsLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaigns').select('*');
            if (error) throw error;
            return data;
        }
    });

    const { data: rawDeliverables = [] } = useQuery({
        queryKey: ['deliverables'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaign_deliverables').select('*');
            if (error) throw error;
            return data;
        }
    });

    // Derive Mapped Campaigns
    const campaigns: Campaign[] = React.useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawCampaigns.map((c: any) => {
            const relatedDeliverables = rawDeliverables
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((d: any) => d.campaign_id === c.id)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((d: any) => ({
                    kolId: d.kol_id,
                    videosCount: d.videos_count,
                    totalViews: d.total_views,
                    totalEngagements: d.total_engagements,
                    salesGenerated: d.sales_generated,
                    status: d.status || 'to_contact'
                }));

            return {
                id: c.id,
                name: c.name,
                budget: c.budget,
                startDate: c.start_date,
                endDate: c.end_date,
                platform: c.platform || 'TikTok',
                objective: c.objective || 'AWARENESS',
                status: c.status || 'Active',
                deliverables: relatedDeliverables
            } as Campaign;
        });
    }, [rawCampaigns, rawDeliverables]);

    // Set Default Active Campaign
    useEffect(() => {
        if (campaigns.length > 0 && !activeCampaignId) {
            const ramadan = campaigns.find(c => c.name.includes("Ramadan"));
            setActiveCampaignId(ramadan ? ramadan.id : campaigns[0].id);
        }
    }, [campaigns, activeCampaignId]);

    const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || null;

    // --- MUTATIONS ---

    const addCategory = async (name: string) => {
        try {
            const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) : 0;
            const { error } = await supabase.from('categories').insert([{ name, sort_order: maxOrder + 1 }]);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success("Category added");
        } catch (e) {
            console.error("Error adding category:", e);
            toast.error("Failed to add category");
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success("Category deleted");
        } catch (e) {
            console.error("Error deleting category:", e);
            toast.error("Failed to delete category");
        }
    };

    const updateCategoryOrder = async (newCategories: Category[]) => {
        try {
            const updates = newCategories.map((c, index) => ({ id: c.id, name: c.name, sort_order: index + 1 }));
            const { error } = await supabase.from('categories').upsert(updates);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (e) { console.error("Error reordering categories:", e); }
    };

    const addCampaign = async (name: string, budget: number, platform: 'TikTok' | 'Instagram', objective: 'AWARENESS' | 'CONVERSION', startDate?: string, endDate?: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = { name, budget, platform, objective };
            if (startDate) payload.start_date = startDate;
            if (endDate) payload.end_date = endDate;
            const { data, error } = await supabase.from('campaigns').insert([payload]).select().single();
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setActiveCampaignId(data.id);
            toast.success("Campaign created");
        } catch (err) {
            console.error("Error adding campaign:", err);
            toast.error("Failed to create campaign");
        }
    };

    const deleteCampaign = async (id: string) => {
        try {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (activeCampaignId === id) setActiveCampaignId(null);
            toast.success("Campaign deleted");
        } catch (e) {
            console.error("Error deleting campaign:", e);
            toast.error("Failed to delete campaign");
        }
    };

    const deleteCampaigns = async (ids: string[]) => {
        try {
            const { error } = await supabase.from('campaigns').delete().in('id', ids);
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (activeCampaignId && ids.includes(activeCampaignId)) setActiveCampaignId(null);
            toast.success("Campaigns deleted");
        } catch (e) { console.error("Error deleting campaigns:", e); }
    };

    const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.budget) dbUpdates.budget = updates.budget;
            if (updates.startDate) dbUpdates.start_date = updates.startDate;
            if (updates.endDate) dbUpdates.end_date = updates.endDate;
            if (updates.platform) dbUpdates.platform = updates.platform;
            if (updates.objective) dbUpdates.objective = updates.objective;

            const { error } = await supabase.from('campaigns').update(dbUpdates).eq('id', id);
            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success("Campaign updated");
        } catch (e) {
            console.error("Error updating campaign:", e);
            toast.error("Failed to update campaign");
        }
    };

    // KOL Mutations
    const addKOL = async (newKOL: KOL, addToCurrentCampaign = true) => {
        try {
            // Map frontend to DB columns
            const payload = {
                name: newKOL.name,
                type: newKOL.type,
                category: newKOL.category,
                followers: newKOL.followers,
                avg_views: newKOL.avgViews,
                tiktok_username: newKOL.tiktokUsername,
                tiktok_profile_link: newKOL.tiktokProfileLink,
                tiktok_followers: newKOL.tiktokFollowers,
                instagram_username: newKOL.instagramUsername,
                instagram_profile_link: newKOL.instagramProfileLink,
                instagram_followers: newKOL.instagramFollowers,
                rate_card_tiktok: newKOL.rateCardTiktok,
                rate_card_reels: newKOL.rateCardReels,
                rate_card_pdf_link: newKOL.rateCardPdfLink
            };

            const { data, error } = await supabase.from('kols').insert([payload]).select().single();
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['kols'] });

            if (addToCurrentCampaign && activeCampaignId) {
                await addCampaignDeliverableDB(data.id, activeCampaignId);
            }
            toast.success("Influencer added");
        } catch (err) {
            console.error("Error adding KOL:", err);
            toast.error("Failed to add influencer");
        }
    };

    const deleteKOL = async (id: string) => {
        try {
            const { error } = await supabase.from('kols').delete().eq('id', id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['kols'] });
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
            toast.success("Influencer deleted");
        } catch (err) { console.error("Error deleting KOL:", err); }
    };

    const deleteKOLs = async (ids: string[]) => {
        try {
            const { error } = await supabase.from('kols').delete().in('id', ids);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['kols'] });
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
            toast.success("Influencers deleted");
        } catch (err) { console.error("Error deleting KOLs:", err); }
    };

    const updateKOL = async (id: string, updates: Partial<KOL>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.type) dbUpdates.type = updates.type;
            if (updates.category) dbUpdates.category = updates.category;
            if (updates.followers) dbUpdates.followers = updates.followers;
            if (updates.avgViews) dbUpdates.avg_views = updates.avgViews;
            if (updates.tiktokUsername) dbUpdates.tiktok_username = updates.tiktokUsername;
            if (updates.tiktokProfileLink) dbUpdates.tiktok_profile_link = updates.tiktokProfileLink;
            if (updates.tiktokFollowers) dbUpdates.tiktok_followers = updates.tiktokFollowers;
            if (updates.instagramUsername) dbUpdates.instagram_username = updates.instagramUsername;
            if (updates.instagramProfileLink) dbUpdates.instagram_profile_link = updates.instagramProfileLink;
            if (updates.instagramFollowers) dbUpdates.instagram_followers = updates.instagramFollowers;
            if (updates.rateCardTiktok) dbUpdates.rate_card_tiktok = updates.rateCardTiktok;
            if (updates.rateCardReels) dbUpdates.rate_card_reels = updates.rateCardReels;
            if (updates.rateCardPdfLink) dbUpdates.rate_card_pdf_link = updates.rateCardPdfLink;

            const { error } = await supabase.from('kols').update(dbUpdates).eq('id', id);
            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['kols'] });
            toast.success("Influencer updated");
        } catch (err) {
            console.error("Error updating KOL:", err);
            toast.error("Failed to update influencer");
        }
    };

    // Deliverable Mutations
    const addCampaignDeliverableDB = async (kolId: string, campaignId: string) => {
        try {
            const { error } = await supabase.from('campaign_deliverables').insert([{
                kol_id: kolId,
                campaign_id: campaignId,
                videos_count: 1 // Default to 1 so Spend/ROI updates immediately
            }]);
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['deliverables'] });
                toast.success("Added to campaign");
            }
        } catch (e) { console.error("Deliverable DB Error", e); }
    };

    const addCampaignDeliverable = (kolId: string) => {
        if (activeCampaignId) addCampaignDeliverableDB(kolId, activeCampaignId);
    };

    const addKOLToCampaign = async (kolId: string) => {
        if (!activeCampaignId) return;
        await addCampaignDeliverableDB(kolId, activeCampaignId);
    }

    const removeKOLFromCampaignDB = async (campaignId: string, kolId: string) => {
        try {
            const { error } = await supabase
                .from('campaign_deliverables')
                .delete()
                .eq('campaign_id', campaignId)
                .eq('kol_id', kolId);

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
            toast.success("Removed from campaign");
        } catch (e) { console.error("Error removing KOL from campaign:", e); }
    };

    const removeCampaignDeliverable = (kolId: string) => {
        if (activeCampaignId) removeKOLFromCampaignDB(activeCampaignId, kolId);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateCampaignDeliverableDB = async (campaignId: string, kolId: string, metrics: any) => {
        // Construct payload first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = {};
        if (metrics.videosCount !== undefined) payload.videos_count = metrics.videosCount;
        if (metrics.totalViews !== undefined) payload.total_views = metrics.totalViews;
        if (metrics.totalEngagements !== undefined) payload.total_engagements = metrics.totalEngagements;
        if (metrics.salesGenerated !== undefined) payload.sales_generated = metrics.salesGenerated;
        if (metrics.status !== undefined) payload.status = metrics.status;

        // Optimistic Update
        await queryClient.cancelQueries({ queryKey: ['deliverables'] });
        const previousDeliverables = queryClient.getQueryData(['deliverables']);

        queryClient.setQueryData(['deliverables'], (old: any[] | undefined) => {
            if (!old) return [];
            return old.map(d =>
                d.campaign_id === campaignId && d.kol_id === kolId
                    ? { ...d, ...payload }
                    : d
            );
        });

        try {
            const { error } = await supabase
                .from('campaign_deliverables')
                .update(payload)
                .eq('campaign_id', campaignId)
                .eq('kol_id', kolId);

            if (error) throw error;
            // We can choose to NOT invalidate if we are confident, but invalidating ensures consistency
            // queryClient.invalidateQueries({ queryKey: ['deliverables'] }); 
        } catch (e) {
            console.error("Error updating deliverable:", e);
            // Rollback
            queryClient.setQueryData(['deliverables'], previousDeliverables);
        } finally {
            // Always refetch eventually to be safe
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        }
    };

    const safeCampaign = activeCampaign || CAMPAIGN_RAMADAN;
    const loading = kolsLoading || campaignsLoading;

    return (
        <DataContext.Provider
            value={{
                kols, campaigns, categories, activeCampaign, activeCampaignId,
                setActiveCampaignId, addCampaign, campaign: safeCampaign,
                addKOL, updateKOL, deleteKOL, addCampaignDeliverable,
                removeCampaignDeliverable, addKOLToCampaign,
                addCategory, deleteCategory, updateCategoryOrder,
                deleteCampaign, updateCampaignDeliverableDB, addCampaignDeliverableDB,
                removeKOLFromCampaignDB, updateCampaign,
                loading, deleteKOLs, deleteCampaigns
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error("useData must be used within a DataProvider");
    return context;
}
