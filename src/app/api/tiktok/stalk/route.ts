import { NextRequest, NextResponse } from 'next/server';
import { StalkUser } from '@tobyg74/tiktok-api-dl';
import { createClient } from "@/lib/supabase/server";

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

        // Get authenticated user (Supabase)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let sessionId = process.env.TIKTOK_SESSION_ID;

        // Attempt to fetch from DB if user is logged in
        if (user) {
             const { data: profile } = await supabase
                .from('profiles')
                .select('tiktok_session_cookie')
                .eq('id', user.id)
                .single();
            if (profile?.tiktok_session_cookie) {
                sessionId = profile.tiktok_session_cookie;
            }
        }

        // Use tiktok-api-dl StalkUser function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await StalkUser(cleanUsername, { cookie: sessionId } as any);

        if (result.status === 'error') {
            return NextResponse.json(
                { status: 'error', error: result.message || 'Failed to fetch user profile' },
                { status: 404 }
            );
        }

        // Library returns: { result: { user: { ... }, stats: { ... } } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userResult = (result.result as any)?.user;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stats = (result.result as any)?.stats;

        // Transform the response to match the expected frontend interface
        return NextResponse.json({
            status: 'success',
            data: {
                username: userResult?.uniqueId || userResult?.username,
                nickname: userResult?.nickname,
                avatar: userResult?.avatarMedium || userResult?.avatarLarger,
                signature: userResult?.signature,
                verified: userResult?.verified || false,
                region: userResult?.region || 'UNK',
                followers: stats?.followerCount || 0,
                following: stats?.followingCount || 0,
                hearts: stats?.heartCount || 0,
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
