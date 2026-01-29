import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { Search } from '@tobyg74/tiktok-api-dl';

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

        let sessionId = process.env.TIKTOK_SESSION_ID;
        const { data: profile } = await supabase
            .from('profiles')
            .select('tiktok_session_cookie')
            .eq('id', user.id)
            .single();
        if (profile?.tiktok_session_cookie) {
            sessionId = profile.tiktok_session_cookie;
        }

        // Calculate page from cursor (assuming cursor is offset, default 0)
        // tiktok-api-dl uses 'page' (1-based index likely)
        const page = cursor ? parseInt(cursor) : 1; // Default to page 1

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await Search(keyword, { type: 'video', cookie: sessionId, page } as any);

        if (result.status === 'success' && result.result) {
            // Transform result
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const posts = result.result.map((post: any) => ({
                id: post.id || post.video_id,
                title: post.title || post.desc,
                cover: post.cover || post.origin_cover || post.dynamic_cover,
                author: {
                    uniqueId: post.author?.unique_id || post.author?.uniqueId,
                    nickname: post.author?.nickname,
                    avatar: post.author?.avatar_thumb || post.author?.avatarThumb
                },
                playCount: post.play_count || post.stats?.playCount || 0,
                diggCount: post.digg_count || post.stats?.diggCount || 0,
                commentCount: post.comment_count || post.stats?.commentCount || 0,
                shareCount: post.share_count || post.stats?.shareCount || 0,
                downloadCount: post.download_count || post.stats?.downloadCount || 0,
                duration: post.duration,
                createTime: post.create_time || post.createTime,
            }));

            return NextResponse.json({
                status: 'success',
                data: posts,
                cursor: page + 1, // Simple pagination increment
                hasMore: posts.length > 0 // Rough check
            });
        }
        
        return NextResponse.json({
            status: 'success', // Return empty success if no results
            data: [],
            cursor: page,
            hasMore: false
        });

    } catch (error) {
        console.error('TikTok Search API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
