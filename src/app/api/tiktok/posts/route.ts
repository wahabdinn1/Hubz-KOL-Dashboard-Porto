import { NextRequest, NextResponse } from 'next/server';
import { GetUserPosts } from '@tobyg74/tiktok-api-dl';
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json(
                { status: 'error', message: 'Username is required' },
                { status: 400 }
            );
        }

        // Get authenticated user (Supabase)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { status: 'error', message: 'Authentication required' },
                { status: 401 }
            );
        }

        // Clean username (remove @ if present)
        const cleanUsername = username.replace(/^@/, '');

        // Try to get session_id from request body first, then environment variable
        const body = await request.json().catch(() => ({}));
        let sessionId = body.session_id;

        if (!sessionId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('tiktok_session_cookie')
                .eq('id', user.id)
                .single();
            
            sessionId = profile?.tiktok_session_cookie;
        }

        if (!sessionId) {
            sessionId = process.env.TIKTOK_SESSION_ID;
        }

        // Use tiktok-api-dl GetUserPosts function with session cookie
        const result = await GetUserPosts(cleanUsername, {
            cookie: sessionId // Pass full cookie string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if (result.status === 'success' && result.result) {
            // Transform the response for frontend consumption
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const posts = result.result.map((post: any) => ({
                id: post.id,
                type: 'video',
                title: post.desc || 'No description',
                subtitle: post.createTime ? new Date(post.createTime * 1000).toLocaleDateString() : 'Unknown date',
                cover: post.video?.cover || post.video?.originCover,
                description: post.desc,
                link: `https://www.tiktok.com/@${post.author?.username || cleanUsername}/video/${post.id}`,
                stats: {
                    likes: post.stats?.likeCount || 0,
                    plays: post.stats?.playCount || 0,
                    comments: post.stats?.commentCount || 0,
                    shares: post.stats?.shareCount || 0
                },
                author: {
                    nickname: post.author?.nickname || 'Unknown',
                    username: post.author?.username || cleanUsername,
                    avatar: post.author?.avatarMedium || post.author?.avatarThumb
                },
                videoUrl: post.video?.playAddr
            }));

            // Extract author data from the first post if available
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firstAuthor = (result.result[0] as any)?.author;
            const authorData = firstAuthor ? {
                nickname: firstAuthor.nickname,
                username: firstAuthor.username,
                avatarThumb: firstAuthor.avatarMedium || firstAuthor.avatarThumb,
            } : null;

            return NextResponse.json({
                status: 'success',
                data: posts,
                author: authorData
            });

        } else {
             return NextResponse.json(
                { 
                    status: 'error', 
                    message: result.message || 'No posts found or user is private.',
                },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('TikTok User Posts API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
