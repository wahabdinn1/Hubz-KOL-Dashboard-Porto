import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { TikWMService } from "@/lib/tikwm";

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

        // EXECUTION STRATEGY:
        // Use TikWMService which implements the hybrid strategy internally (User Posts -> Fallback to Search)
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let posts: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let authorData: any = null;
        const errorMsg = "";

        // 1. Get User Info first (reliable)
        const userInfo = await TikWMService.getUserInfo(username);

        // 2. Get Feed (tries api/user/posts first, then feed/search)
        const videos = await TikWMService.getUserFeed(username);

        if (videos.length > 0 || userInfo) {
            // Normalize data to match our app's video structure
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            posts = videos.map((post: any) => ({
                id: post.id,
                type: 'video',
                title: post.desc || 'No description',
                subtitle: post.createTime ? new Date(post.createTime * 1000).toLocaleDateString() : 'Unknown date',
                cover: post.video?.cover,
                description: post.desc,
                link: `https://www.tiktok.com/@${post.author.uniqueId}/video/${post.id}`,
                stats: {
                    likes: post.stats?.likeCount || 0,
                    plays: post.stats?.playCount || 0,
                    comments: post.stats?.commentCount || 0,
                    shares: post.stats?.shareCount || 0
                },
                author: {
                    nickname: post.author?.nickname || userInfo?.nickname,
                    username: post.author?.uniqueId || userInfo?.uniqueId || username,
                    avatar: post.author?.avatarThumb || userInfo?.avatarMedium
                },
                videoUrl: post.video?.playAddr
            }));

            // Construct author object if we have userInfo
            if (!authorData) {
                authorData = userInfo ? {
                    nickname: userInfo.nickname,
                    username: userInfo.uniqueId,
                    avatarThumb: userInfo.avatarMedium,
                    stats: {
                        followers: userInfo.fans,
                        likes: userInfo.heart,
                        videos: userInfo.video
                    }
                } : posts[0]?.author;
            }
        }

        if (posts.length > 0 || authorData) {
            return NextResponse.json({
                status: 'success',
                data: posts,
                author: authorData
            });
        } else {
             return NextResponse.json(
                { 
                    status: 'error', 
                    message: errorMsg || 'User not found or no public videos found. Try providing a Session Cookie in Advanced Options.',
                    hint: 'tikwm_empty'
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
