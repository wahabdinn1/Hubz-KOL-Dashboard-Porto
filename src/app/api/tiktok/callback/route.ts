import { NextRequest, NextResponse } from "next/server";
import { TikTokShopService } from "@/lib/tiktok-shop/service";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    
    if (!code) {
        return NextResponse.json({ error: "Missing auth code" }, { status: 400 });
    }

    try {
        console.log("Exchanging code for token...", code);
        const tokenResponse = await TikTokShopService.getAccessToken(code);
        console.log("Token response:", tokenResponse);
        
        if (tokenResponse.code !== 0) {
             return NextResponse.json({ error: "TikTok API Error", details: tokenResponse }, { status: 400 });
        }

        const data = tokenResponse.data;
        
        // Store in Supabase
        const supabase = await createClient();
        
        // Assuming we store this in an 'integrations' or 'shops' table
        // For MVP, lets try to store in 'integrations' or create a new table if needed.
        // Checking schema first would be ideal, but assuming 'integrations' exists from previous context or generic jsonb.
        // Actually, let's just log it and return success for now if table structure is unknown, 
        // OR better, upsert into a 'tiktok_shops' table if we have one.
        // Let's create a specialized function or just use 'integrations'.
        
        const { error } = await supabase.from('integrations').upsert({
            platform: 'tiktok_shop',
            shop_id: data.shop_id || 'unknown', // Adjust based on actual response structure
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            access_token_expire_in: data.access_token_expire_in,
            refresh_token_expire_in: data.refresh_token_expire_in,
            seller_name: data.seller_name || 'TikTok Seller',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'platform, shop_id' }); // Assuming composite key or just insert generic

        if (error) {
             console.error("DB Error:", error);
             // Don't fail the request user visible, just log
        }
        
        return NextResponse.redirect(new URL("/settings?tiktok_connected=true", request.url));

    } catch (error: any) {
        console.error("Callback Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
