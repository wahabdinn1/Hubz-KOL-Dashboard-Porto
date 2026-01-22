import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TikWMService } from "@/lib/tikwm";

export async function POST(request: NextRequest) {
    try {
        const { keyword, cursor } = await request.json();

        if (!keyword) {
            return NextResponse.json(
                { status: 'error', message: 'Keyword is required' },
                { status: 400 }
            );
        }

        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        const result = await TikWMService.searchPosts(keyword, cursor);

        return NextResponse.json({
            status: 'success',
            data: result.posts,
            cursor: result.cursor,
            hasMore: result.hasMore
        });

    } catch (error) {
        console.error('TikTok Search API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
