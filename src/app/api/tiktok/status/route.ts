import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Check if we have any row in integrations table for tiktok_shop
        // In a real app with multi-tenancy, we would check for the current user's organization
        // For now, assuming single tenant or shared integrations
        const { data, error } = await supabase
            .from('integrations')
            .select('platform, seller_name, shop_id')
            .eq('platform', 'tiktok_shop')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
             console.error("DB Error checking status:", error);
             return NextResponse.json({ connected: false });
        }

        if (data) {
            return NextResponse.json({ 
                connected: true, 
                shop_id: data.shop_id,
                seller_name: data.seller_name 
            });
        }

        return NextResponse.json({ connected: false });

    } catch (error) {
        console.error("Status API Error:", error);
        return NextResponse.json({ connected: false }, { status: 500 });
    }
}
