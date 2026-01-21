import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const INSTAGRAM_API_URL = process.env.INSTAGRAM_API_URL || 'http://localhost:8001';

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
        // Check authentication
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                status: 'error',
                error: 'Authentication required',
                message: 'Please log in to access Instagram data'
            }, { status: 401 });
        }

        // Fetch from Python backend
        const response = await fetch(`${INSTAGRAM_API_URL}/profile/${encodeURIComponent(username)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json({
                status: 'error',
                error: errorData.detail || 'Failed to fetch Instagram profile',
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Instagram Profile API Error:', error);
        
        // Check if Python backend is running
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json({
                status: 'error',
                error: 'Instagram API service unavailable',
                message: 'Please ensure the Python backend is running on port 8001'
            }, { status: 503 });
        }

        return NextResponse.json(
            { status: 'error', error: 'Failed to fetch Instagram profile' },
            { status: 500 }
        );
    }
}
