import { NextRequest, NextResponse } from 'next/server';
import { StalkUser } from '@tobyg74/tiktok-api-dl';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json(
            { status: 'error', error: 'Username is required' },
            { status: 400 }
        );
    }

    try {
        // Clean username (remove @ if present)
        const cleanUsername = username.replace(/^@/, '');

        const result = await StalkUser(cleanUsername);

        if (result.status === 'error') {
            return NextResponse.json(
                { status: 'error', error: result.message || 'Failed to fetch user profile' },
                { status: 404 }
            );
        }

        // Library returns: { user: { username, nickname, avatar, ... }, stats: { followerCount, ... } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = (result.result as any)?.user;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (result.result as any)?.stats;

        // Transform the response for cleaner frontend consumption
        return NextResponse.json({
            status: 'success',
            data: {
                username: user?.username || user?.uniqueId,
                nickname: user?.nickname,
                avatar: user?.avatar || user?.avatarLarger || user?.avatarMedium,
                signature: user?.signature,
                verified: user?.verified || false,
                region: user?.region,
                followers: stats?.followerCount || 0,
                following: stats?.followingCount || 0,
                hearts: stats?.heartCount || stats?.likeCount || 0,
                videos: stats?.videoCount || 0,
            }
        });
    } catch (error) {
        console.error('TikTok Stalk API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Failed to fetch user profile. Please try again.' },
            { status: 500 }
        );
    }
}
