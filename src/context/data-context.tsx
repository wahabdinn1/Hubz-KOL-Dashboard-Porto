"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { KOL, Campaign, Category } from "@/types";
import { CAMPAIGN_RAMADAN } from "@/lib/static-data";
import { supabase } from "@/lib/supabase/client";
import { CampaignTemplate } from "@/lib/campaign-templates";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/types/supabase";
import { toast } from "sonner";

// Note: KOLRow type reserved for future use with direct DB operations
// type KOLRow = Database['public']['Tables']['kols']['Row'];
type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
type DeliverableRow = Database['public']['Tables']['campaign_deliverables']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type TemplateRow = Database['public']['Tables']['campaign_templates']['Row'];

export interface DeliverableUpdate {
    videosCount?: number;
    totalViews?: number;
    totalEngagements?: number;
    salesGenerated?: number;
    status?: string;
    contentLink?: string | null;
    dueDate?: string | null;
    notes?: string | null;
    // NEW: Collaboration type fields
    collaborationType?: 'PAID' | 'AFFILIATE';
    fixedFee?: number;
    commissionRate?: number;
}

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
    updateCampaignDeliverableDB: (campaignId: string, kolId: string, metrics: DeliverableUpdate) => Promise<void>;
    addCampaignDeliverableDB: (kolId: string, campaignId: string) => Promise<void>;
    removeKOLFromCampaignDB: (campaignId: string, kolId: string) => Promise<void>;
    updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
    duplicateCampaign: (id: string) => Promise<void>;
    campaign: Campaign;
    loading: boolean;
    // Campaign Templates
    campaignTemplates: CampaignTemplate[];
    addCampaignTemplate: (template: Omit<CampaignTemplate, "id">) => Promise<void>;
    deleteCampaignTemplate: (id: string) => Promise<void>;
    // Notes
    addNote: (kolId: string, content: string) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
    const activeIdRef = useRef(activeCampaignId);

    useEffect(() => {
        activeIdRef.current = activeCampaignId;
    }, [activeCampaignId]);

    // 1. Fetch KOLs
    const { data: rawKols = [], isLoading: kolsLoading } = useQuery({
        queryKey: ['kols'],
        queryFn: async () => {
            const { data, error } = await supabase.from('kols').select('*');
            if (error) throw error;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data || []).map((k: any) => ({
                id: k.id,
                name: k.name,
                type: k.type || 'Micro',
                category: k.category || 'General',
                categoryId: k.category_id,
                followers: k.followers,
                avgViews: k.avg_views,
                tiktokUsername: k.tiktok_username,
                tiktokProfileLink: k.tiktok_profile_link || '',
                tiktokFollowers: k.tiktok_followers || 0,
                instagramUsername: k.instagram_username || '',
                instagramProfileLink: k.instagram_profile_link || '',
                instagramFollowers: k.instagram_followers || 0,
                rateCardTiktok: k.rate_card_tiktok || 0,
                rateCardReels: k.rate_card_reels || 0,
                rateCardPdfLink: k.rate_card_pdf_link || '',
                avatar: k.avatar || '',
                whatsappNumber: k.whatsapp_number || '',
                collaborationType: (k.collaboration_type as 'PAID' | 'AFFILIATE') || 'PAID',
                defaultCommissionRate: k.default_commission_rate || 0
            })) as KOL[];
        }
    });

    // 2. Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
            if (error) {
                // If sort_order column doesn't exist yet, fallback
                if (error.code === '42703') {
                     // Fallback to no sort
                     const { data: retryData } = await supabase.from('categories').select('*');
                     return (retryData || []).map((c: CategoryRow) => ({ id: c.id, name: c.name, sort_order: c.sort_order || 0 }));
                }
                throw error;
            }
            return (data || []).map((c: CategoryRow) => ({ id: c.id, name: c.name, sort_order: c.sort_order || 0 })) as Category[];
        }
    });

    // 3. Fetch Campaigns & Deliverables
    const { data: rawCampaigns = [], isLoading: campaignsLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaigns').select('*');
            if (error) throw error;
            return data as CampaignRow[];
        }
    });

    const kols = React.useMemo(() => {
        return rawKols.map(kol => {
            // DB has 'category' (text). match it to our categories list.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbCategoryName = (kol as any).category; 
            const matchedCategory = categories.find(c => c.name === dbCategoryName);

            return {
                ...kol,
                category: matchedCategory ? matchedCategory.name : (dbCategoryName || 'General'),
                categoryId: matchedCategory ? matchedCategory.id : undefined
            };
        });
    }, [rawKols, categories]);

    const { data: rawDeliverables = [] } = useQuery({
        queryKey: ['deliverables'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaign_deliverables').select('*');
            if (error) throw error;
            return data as DeliverableRow[];
        }
    });

    // 4. Fetch Campaign Templates
    const { data: rawTemplates = [] } = useQuery({
        queryKey: ['campaign_templates'],
        queryFn: async () => {
            const { data, error } = await supabase.from('campaign_templates').select('*');
            if (error) {
                console.warn('Campaign templates table may not exist yet:', error.message);
                return [];
            }
            return data as TemplateRow[];
        }
    });

    // Map templates to CampaignTemplate interface
    const campaignTemplates: CampaignTemplate[] = React.useMemo(() => {
        return rawTemplates.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            defaultValues: {
                platform: (t.platform as 'TikTok' | 'Instagram') || 'TikTok',
                budget: t.default_budget || 50000000,
            },
        }));
    }, [rawTemplates]);

    // Derive Mapped Campaigns
    const campaigns: Campaign[] = React.useMemo(() => {
        return rawCampaigns.map((c) => {
            const relatedDeliverables = rawDeliverables
                .filter((d) => d.campaign_id === c.id)
                .map((d) => ({
                    kolId: d.kol_id,
                    videosCount: d.videos_count || 0,
                    totalViews: d.total_views || 0,
                    totalEngagements: d.total_engagements || 0,
                    salesGenerated: d.sales_generated || 0,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status: (d.status as any) || 'to_contact',
                    contentLink: d.content_link || undefined,
                    dueDate: d.due_date ? new Date(d.due_date) : undefined,
                    notes: d.notes || undefined,
                    // NEW: Collaboration type fields
                    collaborationType: (d.collaboration_type as 'PAID' | 'AFFILIATE') || 'PAID',
                    fixedFee: d.fixed_fee || undefined,
                    commissionRate: d.commission_rate || undefined
                }));

            return {
                id: c.id,
                name: c.name,
                budget: c.budget,
                startDate: c.start_date || undefined,
                endDate: c.end_date || undefined,
                platform: (c.platform as 'TikTok' | 'Instagram') || 'TikTok',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                objective: (c.objective as any) || 'AWARENESS',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: (c.status as any) || 'Active',
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
        const promise = async () => {
            const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sort_order || 0)) : 0;
            const payload = { name, sort_order: maxOrder + 1 };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('categories') as any).insert([payload]);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        };

        toast.promise(promise(), {
            loading: 'Adding category...',
            success: 'Category added',
            error: 'Failed to add category'
        });
    };

    const deleteCategory = async (id: string) => {
        const promise = async () => {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        };

        toast.promise(promise(), {
            loading: 'Deleting category...',
            success: 'Category deleted',
            error: 'Failed to delete category'
        });
    };

    const updateCategoryOrder = async (newCategories: Category[]) => {
        try {
            const updates = newCategories.map((c, index) => ({ id: c.id, name: c.name, sort_order: index + 1 }));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('categories') as any).upsert(updates);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (e) { console.error("Error reordering categories:", e); }
    };

    const addCampaign = async (name: string, budget: number, platform: 'TikTok' | 'Instagram', objective: 'AWARENESS' | 'CONVERSION', startDate?: string, endDate?: string) => {
        const promise = async () => {
            const payload: Database['public']['Tables']['campaigns']['Insert'] = {
                name,
                budget,
                platform,
                objective,
                start_date: startDate || null,
                end_date: endDate || null,
                status: 'Active' // Default status
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('campaigns') as any).insert([payload]).select().single();
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (data) setActiveCampaignId(data.id);
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Creating campaign...',
            success: 'Campaign created',
            error: (err) => `Failed to create campaign: ${err.message}`
        });
        return p;
    };

    const deleteCampaign = async (id: string) => {
        const promise = async () => {
            const { error } = await supabase.from('campaigns').delete().eq('id', id);
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (activeCampaignId === id) setActiveCampaignId(null);
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Deleting campaign...',
            success: 'Campaign deleted',
            error: (err) => `Failed to delete campaign: ${err.message}`
        });
        return p;
    };

    const deleteCampaigns = async (ids: string[]) => {
        try {
            const { error } = await supabase.from('campaigns').delete().in('id', ids);
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            if (activeCampaignId && ids.includes(activeCampaignId)) setActiveCampaignId(null);
            toast.success("Campaigns deleted");
        } catch (e) { 
            console.error("Error deleting campaigns:", e); 
            const message = e instanceof Error ? e.message : 'Unknown error';
            toast.error(`Failed to delete campaigns: ${message}`);
        }
    };

    const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
        const promise = async () => {
            const dbUpdates: Database['public']['Tables']['campaigns']['Update'] = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.budget) dbUpdates.budget = updates.budget;
            if (updates.startDate) dbUpdates.start_date = updates.startDate;
            if (updates.endDate) dbUpdates.end_date = updates.endDate;
            if (updates.platform) dbUpdates.platform = updates.platform;
            if (updates.objective) dbUpdates.objective = updates.objective;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('campaigns') as any).update(dbUpdates).eq('id', id);
            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Updating campaign...',
            success: 'Campaign updated',
            error: (err) => `Failed to update campaign: ${err.message}`
        });
        return p;
    };

    const duplicateCampaign = async (id: string) => {
        const promise = async () => {
            const originalCampaign = campaigns.find(c => c.id === id);
            if (!originalCampaign) throw new Error("Campaign not found");

            // Create new campaign with copied data
            const payload: Database['public']['Tables']['campaigns']['Insert'] = {
                name: `${originalCampaign.name} (Copy)`,
                budget: originalCampaign.budget,
                platform: originalCampaign.platform,
                objective: originalCampaign.objective,
                status: 'Active'
                // Leave dates empty for user to fill
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('campaigns') as any).insert([payload]).select().single();
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Duplicating campaign...',
            success: 'Campaign duplicated successfully',
            error: (err) => `Failed to duplicate campaign: ${err.message}`
        });
        return p;
    };

    // KOL Mutations
    const addKOL = async (newKOL: KOL, addToCurrentCampaign = true) => {
        const promise = async () => {
            // Map frontend to DB columns
            // Map ID back to Name for Text column in DB
            const catName = categories.find(c => c.id === newKOL.categoryId)?.name || newKOL.category || 'General';

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = {
                name: newKOL.name,
                type: newKOL.type,
                category: catName, // Save as Text
                username: newKOL.tiktokUsername || newKOL.instagramUsername || 'unknown', // mandatory field in DB
                followers: newKOL.followers,
                avg_views: newKOL.avgViews,
                er: 0, // Mandatory
                platform: 'TikTok', // Mandatory
                tiktok_username: newKOL.tiktokUsername,
                tiktok_profile_link: newKOL.tiktokProfileLink,
                tiktok_followers: newKOL.tiktokFollowers,
                instagram_username: newKOL.instagramUsername,
                instagram_profile_link: newKOL.instagramProfileLink,
                instagram_followers: newKOL.instagramFollowers,
                rate_card_tiktok: newKOL.rateCardTiktok,
                rate_card_reels: newKOL.rateCardReels,
                rate_card_pdf_link: newKOL.rateCardPdfLink,
                avatar: newKOL.avatar,
                // NEW: WhatsApp and collaboration type
                whatsapp_number: newKOL.whatsappNumber || null,
                collaboration_type: newKOL.collaborationType || 'PAID',
                default_commission_rate: newKOL.defaultCommissionRate || 0
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('kols') as any).insert([payload]).select().single();
            if (error) throw error;

            await queryClient.invalidateQueries({ queryKey: ['kols'] });

            if (addToCurrentCampaign && activeCampaignId && data) {
                await addCampaignDeliverableDB(data.id, activeCampaignId);
            }
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Adding influencer...',
            success: 'Influencer added',
            error: (err) => `Failed to add influencer: ${err.message}`
        });
        return p;
    };

    const deleteKOL = async (id: string) => {
        const promise = async () => {
            const { error } = await supabase.from('kols').delete().eq('id', id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['kols'] });
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Deleting influencer...',
            success: 'Influencer deleted',
            error: (err) => `Failed to delete influencer: ${err.message}`
        });
        return p;
    };

    const deleteKOLs = async (ids: string[]) => {
        try {
            const { error } = await supabase.from('kols').delete().in('id', ids);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['kols'] });
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
            toast.success("Influencers deleted");
        } catch (err) { 
            console.error("Error deleting KOLs:", err); 
            const message = err instanceof Error ? err.message : 'Unknown error';
            toast.error(`Failed to delete KOLs: ${message}`);
        }
    };

    const updateKOL = async (id: string, updates: Partial<KOL>) => {
        const promise = async () => {
            const dbUpdates: Database['public']['Tables']['kols']['Update'] = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.type) dbUpdates.type = updates.type;
            if (updates.categoryId) {
                const catName = categories.find(c => c.id === updates.categoryId)?.name;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (catName) (dbUpdates as any).category = catName;
            }
            if (updates.followers) dbUpdates.followers = updates.followers;
            if (updates.avgViews) dbUpdates.avg_views = updates.avgViews;
            if (updates.tiktokUsername) dbUpdates.tiktok_username = updates.tiktokUsername;
            if (updates.tiktokProfileLink) dbUpdates.tiktok_profile_link = updates.tiktokProfileLink;
            if (updates.tiktokFollowers) dbUpdates.tiktok_followers = updates.tiktokFollowers;
            if (updates.instagramUsername) dbUpdates.instagram_username = updates.instagramUsername;
            if (updates.instagramProfileLink) dbUpdates.instagram_profile_link = updates.instagramProfileLink;
            if (updates.instagramFollowers) dbUpdates.instagram_followers = updates.instagramFollowers;
            if (updates.rateCardTiktok !== undefined) dbUpdates.rate_card_tiktok = updates.rateCardTiktok;
            if (updates.rateCardReels !== undefined) dbUpdates.rate_card_reels = updates.rateCardReels;
            if (updates.rateCardPdfLink !== undefined) dbUpdates.rate_card_pdf_link = updates.rateCardPdfLink;
            if (updates.avatar) dbUpdates.avatar = updates.avatar;
            // NEW: WhatsApp and collaboration type
            if (updates.whatsappNumber !== undefined) dbUpdates.whatsapp_number = updates.whatsappNumber;
            if (updates.collaborationType) dbUpdates.collaboration_type = updates.collaborationType;
            if (updates.defaultCommissionRate !== undefined) dbUpdates.default_commission_rate = updates.defaultCommissionRate;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('kols') as any).update(dbUpdates).eq('id', id);
            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['kols'] });
        };

        const p = promise();
        toast.promise(p, {
            loading: 'Updating influencer...',
            success: 'Influencer updated',
            error: (err) => `Failed to update influencer: ${err.message}`
        });
        return p;
    };

    // Deliverable Mutations
    const addCampaignDeliverableDB = async (kolId: string, campaignId: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('campaign_deliverables') as any).insert([{
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



    const updateCampaignDeliverableDB = async (campaignId: string, kolId: string, metrics: DeliverableUpdate) => {
        // Construct payload
        const payload: Database['public']['Tables']['campaign_deliverables']['Update'] = {};
        if (metrics.videosCount !== undefined) payload.videos_count = metrics.videosCount;
        if (metrics.totalViews !== undefined) payload.total_views = metrics.totalViews;
        if (metrics.totalEngagements !== undefined) payload.total_engagements = metrics.totalEngagements;
        if (metrics.salesGenerated !== undefined) payload.sales_generated = metrics.salesGenerated;
        if (metrics.status !== undefined) payload.status = metrics.status;
        if (metrics.contentLink !== undefined) payload.content_link = metrics.contentLink;
        if (metrics.dueDate !== undefined) payload.due_date = metrics.dueDate;
        if (metrics.notes !== undefined) payload.notes = metrics.notes;
        // NEW: Collaboration type fields
        if (metrics.collaborationType !== undefined) payload.collaboration_type = metrics.collaborationType;
        if (metrics.fixedFee !== undefined) payload.fixed_fee = metrics.fixedFee;
        if (metrics.commissionRate !== undefined) payload.commission_rate = metrics.commissionRate;

        // Optimistic Update
        await queryClient.cancelQueries({ queryKey: ['deliverables'] });
        const previousDeliverables = queryClient.getQueryData(['deliverables']);

        queryClient.setQueryData(['deliverables'], (old: DeliverableRow[] | undefined) => {
            if (!old) return [];
            return old.map(d =>
                d.campaign_id === campaignId && d.kol_id === kolId
                    ? { ...d, ...payload }
                    : d
            );
        });

        try {
            const { error } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('campaign_deliverables') as any)
                .update(payload)
                .eq('campaign_id', campaignId)
                .eq('kol_id', kolId);

            if (error) throw error;
        } catch (e) {
            console.error("Error updating deliverable:", e);
            // Rollback
            queryClient.setQueryData(['deliverables'], previousDeliverables);
        } finally {
            // Always refetch eventually to be safe
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        }
    };

    // Add Campaign Template
    const addCampaignTemplate = async (template: Omit<CampaignTemplate, "id">) => {
        const promise = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('campaign_templates') as any).insert([{
                name: template.name,
                description: template.description,
                platform: template.defaultValues.platform,
                default_budget: template.defaultValues.budget,
            }]);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['campaign_templates'] });
        };

        toast.promise(promise(), {
            loading: 'Adding template...',
            success: 'Template added',
            error: 'Failed to add template'
        });
    };

    // Delete Campaign Template
    const deleteCampaignTemplate = async (id: string) => {
        const promise = async () => {
            const { error } = await supabase.from('campaign_templates').delete().eq('id', id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['campaign_templates'] });
        };

        toast.promise(promise(), {
            loading: 'Deleting template...',
            success: 'Template deleted',
            error: 'Failed to delete template'
        });
    };

    // Notes Mutations
    const addNote = async (kolId: string, content: string) => {
        const promise = async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('kol_notes') as any).insert([{
                kol_id: kolId,
                content: content
            }]);
            if (error) {
                if (error.code === '42P01') throw new Error("Notes table missing in database");
                throw error;
            }
            queryClient.invalidateQueries({ queryKey: ['notes', kolId] });
        };

        toast.promise(promise(), {
            loading: 'Adding note...',
            success: 'Note added',
            error: (err) => `Failed to add note: ${err.message}`
        });
    };

    const deleteNote = async (id: string) => {
        const promise = async () => {
            const { error } = await supabase.from('kol_notes').delete().eq('id', id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        };

        toast.promise(promise(), {
            loading: 'Deleting note...',
            success: 'Note deleted',
            error: 'Failed to delete note'
        });
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
                loading, deleteKOLs, deleteCampaigns, duplicateCampaign,
                campaignTemplates, addCampaignTemplate, deleteCampaignTemplate,
                addNote, deleteNote
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
