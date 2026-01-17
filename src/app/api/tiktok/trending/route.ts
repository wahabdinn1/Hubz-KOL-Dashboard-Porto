import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Note: TikTok Trending API requires special handling
// Uses user's saved session cookie from their profile

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'video'; // creator | video | campaign

    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                status: 'error',
                error: 'Authentication required',
                message: 'Please log in to access trending content'
            }, { status: 401 });
        }

        // Fetch user's TikTok session cookie from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('tiktok_session_cookie')
            .eq('id', user.id)
            .single();

        const sessionCookie = profile?.tiktok_session_cookie;

        if (!sessionCookie) {
            return NextResponse.json({
                status: 'success',
                message: 'TikTok session cookie not configured',
                type: type,
                data: [],
                note: 'Configure your TikTok session cookie in Settings → General → TikTok Integration'
            });
        }

        // Once user has configured their cookie, we can use the TikTok API
        // The tiktok-api-dl library doesn't have a direct trending endpoint
        // This would need to be implemented with custom scraping or TikTok's official API
        
        // For now, return a message indicating the cookie is configured but trending needs more setup
        return NextResponse.json({
            status: 'success',
            message: 'Session cookie configured. Trending feature coming soon!',
            type: type,
            data: [],
            hasSession: true,
            note: 'Your TikTok session is connected. Full trending support requires additional API integration.'
        });

        // Future implementation with proper TikTok trending API would look like:
        /*
        const { TikTokTrending } = await import('@tobyg74/tiktok-api-dl');
        const result = await TikTokTrending({
            cookie: sessionCookie,
        });
        
        if (result.status === 'error') {
            return NextResponse.json({ error: result.message }, { status: 404 });
        }

        // Filter/transform based on type
        let filteredData = result.result || [];
        
        if (type === 'creator') {
            filteredData = filteredData.filter(item => item.type === 'user');
        } else if (type === 'video') {
            filteredData = filteredData.filter(item => item.type === 'video');
        }
        
        return NextResponse.json({
            status: 'success',
            type: type,
            data: filteredData,
        });
        */
    } catch (error) {
        console.error('TikTok Trending API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trending content' },
            { status: 500 }
        );
    }
}
