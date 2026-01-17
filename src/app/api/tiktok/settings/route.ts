import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Retrieve user's TikTok session cookie
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('tiktok_session_cookie')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            data: {
                tiktok_session_cookie: profile?.tiktok_session_cookie || '',
                hasSession: !!profile?.tiktok_session_cookie,
            }
        });
    } catch (error) {
        console.error('TikTok Settings API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Save user's TikTok session cookie
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tiktok_session_cookie } = body;

        const { error } = await supabase
            .from('profiles')
            .update({ tiktok_session_cookie: tiktok_session_cookie || null })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'TikTok session cookie saved successfully',
        });
    } catch (error) {
        console.error('TikTok Settings API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
