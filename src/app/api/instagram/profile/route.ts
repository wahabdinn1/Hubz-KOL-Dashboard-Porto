import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Instagram Profile Scraper - Pure JavaScript
 * 
 * This scrapes public Instagram profiles directly without needing Python.
 * It works by fetching the Instagram profile page and extracting embedded JSON data.
 */

interface InstagramUserData {
    username: string;
    full_name: string;
    bio: string;
    followers: number;
    following: number;
    posts_count: number;
    profile_pic_url: string;
    is_private: boolean;
    is_verified: boolean;
    is_business: boolean;
    external_url: string | null;
}

// User agents to rotate through for anti-detection
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function scrapeInstagramProfile(username: string): Promise<InstagramUserData | null> {
    const cleanUsername = username.replace(/^@/, '').trim();
    
    try {
        // Method 1: Try Instagram's web API endpoint
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'X-IG-App-ID': '936619743392459', // Instagram web app ID
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `https://www.instagram.com/${cleanUsername}/`,
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const user = data?.data?.user;
            
            if (user) {
                return {
                    username: user.username || cleanUsername,
                    full_name: user.full_name || '',
                    bio: user.biography || '',
                    followers: user.edge_followed_by?.count || 0,
                    following: user.edge_follow?.count || 0,
                    posts_count: user.edge_owner_to_timeline_media?.count || 0,
                    profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || '',
                    is_private: user.is_private || false,
                    is_verified: user.is_verified || false,
                    is_business: user.is_business_account || false,
                    external_url: user.external_url || null,
                };
            }
        }

        // Method 2: Try scraping the profile page HTML
        const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
        const htmlResponse = await fetch(profileUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Cache-Control': 'no-cache',
            },
        });

        if (!htmlResponse.ok) {
            console.error(`Instagram returned ${htmlResponse.status}`);
            return null;
        }

        const html = await htmlResponse.text();

        // Look for embedded JSON data
        // Instagram stores profile data in script tags
        const scriptMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            try {
                const jsonData = JSON.parse(scriptMatch[1]);
                if (jsonData['@type'] === 'Person' || jsonData['@type'] === 'ProfilePage') {
                    return {
                        username: cleanUsername,
                        full_name: jsonData.name || jsonData.author?.name || '',
                        bio: jsonData.description || '',
                        followers: parseInt(jsonData.interactionStatistic?.find((s: { name: string }) => s.name === 'Follows')?.userInteractionCount) || 0,
                        following: 0,
                        posts_count: 0,
                        profile_pic_url: jsonData.image || '',
                        is_private: false,
                        is_verified: false,
                        is_business: false,
                        external_url: jsonData.url || null,
                    };
                }
            } catch {
                // JSON parse failed, continue to next method
            }
        }

        // Method 3: Look for __initialData or window._sharedData
        const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({[\s\S]*?});<\/script>/);
        if (sharedDataMatch) {
            try {
                const sharedData = JSON.parse(sharedDataMatch[1]);
                const user = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user;
                if (user) {
                    return {
                        username: user.username || cleanUsername,
                        full_name: user.full_name || '',
                        bio: user.biography || '',
                        followers: user.edge_followed_by?.count || 0,
                        following: user.edge_follow?.count || 0,
                        posts_count: user.edge_owner_to_timeline_media?.count || 0,
                        profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url || '',
                        is_private: user.is_private || false,
                        is_verified: user.is_verified || false,
                        is_business: user.is_business_account || false,
                        external_url: user.external_url || null,
                    };
                }
            } catch {
                // JSON parse failed
            }
        }

        return null;
    } catch (error) {
        console.error('Instagram scraping error:', error);
        return null;
    }
}

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

        // Scrape Instagram profile
        const profileData = await scrapeInstagramProfile(username);

        if (!profileData) {
            return NextResponse.json({
                status: 'error',
                error: 'Profile not found or rate limited',
                message: 'Could not fetch Instagram profile. The account may be private, or Instagram may be rate limiting requests.'
            }, { status: 404 });
        }

        return NextResponse.json({
            status: 'success',
            data: profileData
        });

    } catch (error) {
        console.error('Instagram Profile API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Failed to fetch Instagram profile' },
            { status: 500 }
        );
    }
}
