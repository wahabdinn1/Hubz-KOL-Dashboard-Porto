"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { KOL, Campaign, Category, CAMPAIGN_RAMADAN } from "@/lib/static-data";
import { supabase } from "@/lib/supabase";

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
    removeKOLFromCampaignDB: (campaignId: string, kolId: string) => Promise<void>;
    updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
    campaign: Campaign;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [kols, setKols] = useState<KOL[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const activeCampaign = campaigns.find(c => c.id === activeCampaignId) || null;
    const activeIdRef = useRef(activeCampaignId);

    useEffect(() => {
        activeIdRef.current = activeCampaignId;
    }, [activeCampaignId]);

    // Fetch Initial Data
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchData = async () => {
            try {
                // 1. Fetch KOLs
                const { data: kolsData, error: kolsError } = await supabase
                    .from('kols')
                    .select('*');

                if (kolsError && kolsError.code !== '42703') console.error("Supabase KOL Fetch Error:", JSON.stringify(kolsError, null, 2));

                if (isMounted && kolsData) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mappedKols: KOL[] = kolsData.map((k: any) => ({
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
                    }));
                    setKols(mappedKols);
                }

                // 2. Fetch Categories
                let { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (catError && catError.code === '42703') {
                    const retry = await supabase.from('categories').select('*');
                    catData = retry.data;
                    catError = retry.error;
                }

                if (catError) console.error("Supabase Category Error:", JSON.stringify(catError, null, 2));
                if (isMounted && catData) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setCategories(catData.map((c: any) => ({ id: c.id, name: c.name, sort_order: c.sort_order })));
                }

                // 3. Fetch Campaigns
                const { data: campaignData, error: campaignError } = await supabase
                    .from('campaigns')
                    .select('*');

                if (campaignError) console.error("Supabase Campaign Error:", JSON.stringify(campaignError, null, 2));

                // 4. Fetch All Deliverables
                const { data: delData, error: delError } = await supabase
                    .from('campaign_deliverables')
                    .select('*');

                if (delError) console.error("Supabase Deliverable Error:", JSON.stringify(delError, null, 2));

                if (isMounted && campaignData) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mappedCampaigns: Campaign[] = campaignData.map((c: any) => {
                        const relatedDeliverables = (delData || [])
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .filter((d: any) => d.campaign_id === c.id)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            .map((d: any) => ({
                                kolId: d.kol_id,
                                videosCount: d.videos_count,
                                totalViews: d.total_views,
                                totalEngagements: d.total_engagements,
                                salesGenerated: d.sales_generated
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
                        };
                    });

                    setCampaigns(mappedCampaigns);
                    // Set default active
                    if (mappedCampaigns.length > 0 && !activeIdRef.current) {
                        const ramadan = mappedCampaigns.find(c => c.name.includes("Ramadan"));
                        setActiveCampaignId(ramadan ? ramadan.id : mappedCampaigns[0].id);
                    }
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    // ... (Category methods same as before) ...
    const addCategory = async (name: string) => {
        try {
            const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) : 0;
            const { data, error } = await supabase.from('categories').insert([{ name, sort_order: maxOrder + 1 }]).select().single();
            if (error) throw error;
            setCategories(prev => [...prev, { id: data.id, name: data.name, sort_order: data.sort_order }]);
        } catch (e) { console.error("Error adding category:", e); }
    };

    const deleteCategory = async (id: string) => {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error("Error deleting category:", e); }
    };

    const deleteCampaign = async (id: string) => {
        try {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;
            setCampaigns(prev => prev.filter(c => c.id !== id));
            if (activeCampaignId === id) setActiveCampaignId(null);
        } catch (e) { console.error("Error deleting campaign:", e); }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateCampaignDeliverableDB = async (campaignId: string, kolId: string, metrics: any) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = {
                videos_count: metrics.videosCount,
                total_views: metrics.totalViews,
                total_engagements: metrics.totalEngagements,
                sales_generated: metrics.salesGenerated,
            };

            const { error } = await supabase
                .from('campaign_deliverables')
                .update(payload)
                .eq('campaign_id', campaignId)
                .eq('kol_id', kolId);

            if (error) throw error;

            // Update local state
            setCampaigns(prev => prev.map(c => {
                if (c.id === campaignId) {
                    return {
                        ...c,
                        deliverables: c.deliverables.map(d => {
                            if (d.kolId === kolId) {
                                return { ...d, ...metrics };
                            }
                            return d;
                        })
                    };
                }
                return c;
            }));

        } catch (e) { console.error("Error updating deliverable:", e); }
    };

    const updateCategoryOrder = async (newCategories: Category[]) => {
        try {
            setCategories(newCategories);
            const updates = newCategories.map((c, index) => ({ id: c.id, name: c.name, sort_order: index + 1 }));
            await supabase.from('categories').upsert(updates);
        } catch (e) { console.error("Error reordering categories:", e); }
    };

    // Updated addCampaign
    const addCampaign = async (name: string, budget: number, platform: 'TikTok' | 'Instagram', objective: 'AWARENESS' | 'CONVERSION', startDate?: string, endDate?: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = { name, budget, platform, objective };
            if (startDate) payload.start_date = startDate;
            if (endDate) payload.end_date = endDate;

            const { data, error } = await supabase
                .from('campaigns')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            const newCampaign: Campaign = {
                id: data.id,
                name: data.name,
                budget: data.budget,
                startDate: data.start_date,
                endDate: data.end_date,
                platform: data.platform || 'TikTok',
                objective: data.objective || 'AWARENESS',
                status: 'Active',
                deliverables: []
            };

            setCampaigns(prev => [...prev, newCampaign]);
            setActiveCampaignId(newCampaign.id);
        } catch (err) {
            console.error("Error adding campaign:", err);
        }
    };

    // Updated addKOL
    const addKOL = async (newKOL: KOL, addToCurrentCampaign = true) => {
        try {
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

            const { data, error } = await supabase
                .from('kols')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            // Map response back to frontend model
            const insertedKOL: KOL = {
                id: data.id,
                name: data.name,
                type: data.type,
                category: data.category,
                followers: data.followers,
                avgViews: data.avg_views,
                tiktokUsername: data.tiktok_username,
                tiktokProfileLink: data.tiktok_profile_link,
                tiktokFollowers: data.tiktok_followers,
                instagramUsername: data.instagram_username,
                instagramProfileLink: data.instagram_profile_link,
                instagramFollowers: data.instagram_followers,
                rateCardTiktok: data.rate_card_tiktok,
                rateCardReels: data.rate_card_reels,
                rateCardPdfLink: data.rate_card_pdf_link
            };

            setKols((prev) => [...prev, insertedKOL]);

            if (addToCurrentCampaign && activeCampaignId) {
                await addCampaignDeliverableDB(insertedKOL.id, activeCampaignId);
            }
        } catch (err) {
            console.error("Error adding KOL:", err);
        }
    };

    const deleteKOL = async (id: string) => {
        try {
            const { error } = await supabase.from('kols').delete().eq('id', id);
            if (error) throw error;
            setKols((prev) => prev.filter((k) => k.id !== id));
            setCampaigns(prev => prev.map(c => ({
                ...c,
                deliverables: c.deliverables.filter(d => d.kolId !== id)
            })));
        } catch (err) { console.error("Error deleting KOL:", err); }
    };

    // Updated updateKOL
    const updateKOL = async (id: string, updates: Partial<KOL>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.type) dbUpdates.type = updates.type;
            if (updates.category) dbUpdates.category = updates.category;
            if (updates.followers) dbUpdates.followers = updates.followers;
            if (updates.avgViews) dbUpdates.avg_views = updates.avgViews;

            // New Fields
            if (updates.tiktokUsername) dbUpdates.tiktok_username = updates.tiktokUsername;
            if (updates.tiktokProfileLink) dbUpdates.tiktok_profile_link = updates.tiktokProfileLink;
            if (updates.tiktokFollowers) dbUpdates.tiktok_followers = updates.tiktokFollowers;
            if (updates.instagramUsername) dbUpdates.instagram_username = updates.instagramUsername;
            if (updates.instagramProfileLink) dbUpdates.instagram_profile_link = updates.instagramProfileLink;
            if (updates.instagramFollowers) dbUpdates.instagram_followers = updates.instagramFollowers;
            if (updates.rateCardTiktok) dbUpdates.rate_card_tiktok = updates.rateCardTiktok;
            if (updates.rateCardReels) dbUpdates.rate_card_reels = updates.rateCardReels;
            if (updates.rateCardPdfLink) dbUpdates.rate_card_pdf_link = updates.rateCardPdfLink;

            const { error } = await supabase
                .from('kols')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setKols((prev) =>
                prev.map((k) => (k.id === id ? { ...k, ...updates } : k))
            );
        } catch (err) {
            console.error("Error updating KOL:", err);
        }
    };

    const addCampaignDeliverableDB = async (kolId: string, campaignId: string) => {
        try {
            const { error } = await supabase.from('campaign_deliverables').insert([{ kol_id: kolId, campaign_id: campaignId }]);
            if (!error) addCampaignDeliverable(kolId);
        } catch (e) { console.error("Deliverable DB Error", e); }
    }

    const addKOLToCampaign = async (kolId: string) => {
        if (!activeCampaignId) return;
        await addCampaignDeliverableDB(kolId, activeCampaignId);
    }

    // ... (rest of deliverable logic same)
    const addCampaignDeliverable = (kolId: string) => {
        if (!activeCampaignId) return;
        setCampaigns(prev => prev.map(c => {
            if (c.id === activeCampaignId) {
                if (c.deliverables.some(d => d.kolId === kolId)) return c;
                return { ...c, deliverables: [...c.deliverables, { kolId, videosCount: 0, totalViews: 0, totalEngagements: 0, salesGenerated: 0 }] };
            }
            return c;
        }));
    };

    const removeCampaignDeliverable = (kolId: string) => {
        if (!activeCampaignId) return;
        setCampaigns(prev => prev.map(c => {
            if (c.id === activeCampaignId) {
                return { ...c, deliverables: c.deliverables.filter(d => d.kolId !== kolId) };
            }
            return c;
        }));
    };

    const removeKOLFromCampaignDB = async (campaignId: string, kolId: string) => {
        try {
            const { error } = await supabase
                .from('campaign_deliverables')
                .delete()
                .eq('campaign_id', campaignId)
                .eq('kol_id', kolId);

            if (error) throw error;

            // Update local state
            setCampaigns(prev => prev.map(c => {
                if (c.id === campaignId) {
                    return {
                        ...c,
                        deliverables: c.deliverables.filter(d => d.kolId !== kolId)
                    };
                }
                return c;
            }));
        } catch (e) { console.error("Error removing KOL from campaign:", e); }
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

            const { error } = await supabase
                .from('campaigns')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;

            setCampaigns(prev => prev.map(c => {
                if (c.id === id) {
                    return { ...c, ...updates };
                }
                return c;
            }));
        } catch (e) {
            console.error("Error updating campaign:", e);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((e as any)?.message) console.error("Error message:", (e as any).message);
            console.error("Full Error:", JSON.stringify(e, null, 2));
        }
    };

    const deleteKOLs = async (ids: string[]) => {
        try {
            const { error } = await supabase.from('kols').delete().in('id', ids);
            if (error) throw error;
            setKols((prev) => prev.filter((k) => !ids.includes(k.id)));
            // Update campaigns to remove deliverables for these KOLs
            setCampaigns(prev => prev.map(c => ({
                ...c,
                deliverables: c.deliverables.filter(d => !ids.includes(d.kolId))
            })));
        } catch (err) { console.error("Error deleting KOLs:", err); }
    };

    const deleteCampaigns = async (ids: string[]) => {
        try {
            const { error } = await supabase.from('campaigns').delete().in('id', ids);
            if (error) throw error;
            setCampaigns(prev => prev.filter(c => !ids.includes(c.id)));
            if (activeCampaignId && ids.includes(activeCampaignId)) setActiveCampaignId(null);
        } catch (e) { console.error("Error deleting campaigns:", e); }
    };

    const safeCampaign = activeCampaign || CAMPAIGN_RAMADAN;

    return (
        <DataContext.Provider
            value={{
                kols, campaigns, categories, activeCampaign, activeCampaignId,
                setActiveCampaignId, addCampaign, campaign: safeCampaign,
                addKOL, updateKOL, deleteKOL, addCampaignDeliverable,
                removeCampaignDeliverable, addKOLToCampaign,
                addCategory, deleteCategory, updateCategoryOrder,
                deleteCampaign, updateCampaignDeliverableDB,
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
