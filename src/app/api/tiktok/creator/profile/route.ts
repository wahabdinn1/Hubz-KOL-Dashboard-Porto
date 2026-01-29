import { NextRequest, NextResponse } from "next/server";
import { TikTokShopService } from "@/lib/tiktok-shop/service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // 1. Get the access token from DB
        const { data: integration, error: dbError } = await supabase
            .from('integrations')
            .select('access_token')
            .eq('platform', 'tiktok_shop')
            .limit(1)
            .single();

        if (dbError || !integration || !integration.access_token) {
            return NextResponse.json({ error: "No connected TikTok Shop account found." }, { status: 404 });
        }

        // 2. Call TikTok API
        const profileResponse = await TikTokShopService.getCreatorProfile(integration.access_token);
        
        if (profileResponse.code !== 0) {
            return NextResponse.json({ error: "TikTok API Error", details: profileResponse }, { status: 400 });
        }

        return NextResponse.json(profileResponse);

    } catch (error: any) {
        console.error("Get Profile Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
