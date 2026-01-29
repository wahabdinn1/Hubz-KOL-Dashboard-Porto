import { NextResponse } from "next/server";
import { TikTokShopService } from "@/lib/tiktok-shop/service";
import { nanoid } from "nanoid";

export async function GET() {
    // Generate a random state for CSRF protection
    const state = nanoid();
    
    // In a real app, store 'state' in a cookie or DB to verify it later in the callback
    // For now, we'll just pass it along
    
    const authUrl = TikTokShopService.getAuthUrl(state);
    
    return NextResponse.redirect(authUrl);
}
