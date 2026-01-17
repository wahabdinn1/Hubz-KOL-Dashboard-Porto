export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            kols: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    type: string | null
                    username: string
                    avatar: string
                    platform: 'TikTok' | 'Instagram'
                    bio: string | null
                    er: number
                    followers: number
                    avg_views: number
                    category_id: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    manager_name: string | null
                    rate_card_min: number | null
                    rate_card_max: number | null
                    tiktok_username: string | null
                    tiktok_profile_link: string | null
                    tiktok_followers: number | null
                    instagram_username: string | null
                    instagram_profile_link: string | null
                    instagram_followers: number | null
                    rate_card_tiktok: number | null
                    rate_card_reels: number | null
                    rate_card_pdf_link: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    type?: string | null
                    username: string
                    avatar?: string
                    platform: 'TikTok' | 'Instagram'
                    bio?: string | null
                    er: number
                    followers: number
                    avg_views: number
                    category_id?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    manager_name?: string | null
                    rate_card_min?: number | null
                    rate_card_max?: number | null
                    tiktok_username?: string | null
                    tiktok_profile_link?: string | null
                    tiktok_followers?: number | null
                    instagram_username?: string | null
                    instagram_profile_link?: string | null
                    instagram_followers?: number | null
                    rate_card_tiktok?: number | null
                    rate_card_reels?: number | null
                    rate_card_pdf_link?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    type?: string | null
                    username?: string
                    avatar?: string
                    platform?: 'TikTok' | 'Instagram'
                    bio?: string | null
                    er?: number
                    followers?: number
                    avg_views?: number
                    category_id?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    manager_name?: string | null
                    rate_card_min?: number | null
                    rate_card_max?: number | null
                    tiktok_username?: string | null
                    tiktok_profile_link?: string | null
                    tiktok_followers?: number | null
                    instagram_username?: string | null
                    instagram_profile_link?: string | null
                    instagram_followers?: number | null
                    rate_card_tiktok?: number | null
                    rate_card_reels?: number | null
                    rate_card_pdf_link?: string | null
                }
            }
            campaigns: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    budget: number
                    start_date: string | null
                    end_date: string | null
                    platform: 'TikTok' | 'Instagram'
                    objective: string
                    status: string
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    budget: number
                    start_date?: string | null
                    end_date?: string | null
                    platform: 'TikTok' | 'Instagram'
                    objective?: string
                    status?: string
                    user_id?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    budget?: number
                    start_date?: string | null
                    end_date?: string | null
                    platform?: 'TikTok' | 'Instagram'
                    objective?: string
                    status?: string
                    user_id?: string
                }
            }
            campaign_deliverables: {
                Row: {
                    id: string
                    campaign_id: string
                    kol_id: string
                    videos_count: number
                    total_views: number
                    total_engagements: number
                    sales_generated: number
                    created_at: string
                    status: string
                    content_link: string | null
                    due_date: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    campaign_id: string
                    kol_id: string
                    videos_count?: number
                    total_views?: number
                    total_engagements?: number
                    sales_generated?: number
                    created_at?: string
                    status?: string
                    content_link?: string | null
                    due_date?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    campaign_id?: string
                    kol_id?: string
                    videos_count?: number
                    total_views?: number
                    total_engagements?: number
                    sales_generated?: number
                    created_at?: string
                    status?: string
                    content_link?: string | null
                    due_date?: string | null
                    notes?: string | null
                }
            }
            categories: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    sort_order: number | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    sort_order?: number | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    sort_order?: number | null
                }
            }
            campaign_templates: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    description: string | null
                    default_budget: number | null
                    platform: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    description?: string | null
                    default_budget?: number | null
                    platform: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    description?: string | null
                    default_budget?: number | null
                    platform?: string
                }
            }
            kol_notes: {
                Row: {
                    id: string
                    created_at: string
                    kol_id: string
                    content: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    kol_id: string
                    content: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    kol_id?: string
                    content?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    invoice_number: string
                    recipient_name: string
                    recipient_address: string | null
                    issued_date: string
                    due_date: string | null
                    status: string
                    total_amount: number
                    kol_id: string | null
                    campaign_id: string | null
                    bank_name: string | null
                    bank_account_no: string | null
                    bank_account_name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    invoice_number: string
                    recipient_name: string
                    recipient_address?: string | null
                    issued_date?: string
                    due_date?: string | null
                    status?: string
                    total_amount?: number
                    kol_id?: string | null
                    campaign_id?: string | null
                    bank_name?: string | null
                    bank_account_no?: string | null
                    bank_account_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    invoice_number?: string
                    recipient_name?: string
                    recipient_address?: string | null
                    issued_date?: string
                    due_date?: string | null
                    status?: string
                    total_amount?: number
                    kol_id?: string | null
                    campaign_id?: string | null
                    bank_name?: string | null
                    bank_account_no?: string | null
                    bank_account_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    description: string
                    quantity: number
                    price: number
                    total: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    description: string
                    quantity?: number
                    price?: number
                    total?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    description?: string
                    quantity?: number
                    price?: number
                    total?: number
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
