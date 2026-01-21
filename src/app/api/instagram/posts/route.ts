import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Instagram Posts Scraper - Pure JavaScript
 * 
 * This attempts to scrape recent posts from public Instagram profiles.
 * Note: Instagram heavily restricts access to post data, so this has limitations.
 */

interface InstagramPost {
    id: string;
    shortcode: string;
    url: string;
    caption: string | null;
    likes: number;
    comments: number;
    media_url: string;
    is_video: boolean;
}

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function scrapeInstagramPosts(username: string, limit: number = 12): Promise<InstagramPost[]> {
    const cleanUsername = username.replace(/^@/, '').trim();
    
    try {
        // Try Instagram's web API endpoint
        const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'X-IG-App-ID': '936619743392459',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `https://www.instagram.com/${cleanUsername}/`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            const user = data?.data?.user;
            
            if (user && user.edge_owner_to_timeline_media?.edges) {
                const edges = user.edge_owner_to_timeline_media.edges.slice(0, limit);
                
                return edges.map((edge: { node: {
                    id: string;
                    shortcode: string;
                    display_url: string;
                    is_video: boolean;
                    edge_liked_by?: { count: number };
                    edge_media_to_comment?: { count: number };
                    edge_media_to_caption?: { edges: Array<{ node: { text: string } }> };
                }}) => {
                    const node = edge.node;
                    return {
                        id: node.id,
                        shortcode: node.shortcode,
                        url: `https://www.instagram.com/p/${node.shortcode}/`,
                        caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || null,
                        likes: node.edge_liked_by?.count || 0,
                        comments: node.edge_media_to_comment?.count || 0,
                        media_url: node.display_url,
                        is_video: node.is_video || false,
                    };
                });
            }
        }

        // Fallback: Try scraping HTML
        const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
        const htmlResponse = await fetch(profileUrl, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        if (htmlResponse.ok) {
            const html = await htmlResponse.text();
            
            // Look for _sharedData
            const sharedDataMatch = html.match(/window\._sharedData\s*=\s*({[\s\S]*?});<\/script>/);
            if (sharedDataMatch) {
                try {
                    const sharedData = JSON.parse(sharedDataMatch[1]);
                    const edges = sharedData?.entry_data?.ProfilePage?.[0]?.graphql?.user?.edge_owner_to_timeline_media?.edges;
                    
                    if (edges) {
                        return edges.slice(0, limit).map((edge: { node: {
                            id: string;
                            shortcode: string;
                            display_url: string;
                            is_video: boolean;
                            edge_liked_by?: { count: number };
                            edge_media_to_comment?: { count: number };
                            edge_media_to_caption?: { edges: Array<{ node: { text: string } }> };
                        }}) => {
                            const node = edge.node;
                            return {
                                id: node.id,
                                shortcode: node.shortcode,
                                url: `https://www.instagram.com/p/${node.shortcode}/`,
                                caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || null,
                                likes: node.edge_liked_by?.count || 0,
                                comments: node.edge_media_to_comment?.count || 0,
                                media_url: node.display_url,
                                is_video: node.is_video || false,
                            };
                        });
                    }
                } catch {
                    // JSON parse failed
                }
            }
        }

        return [];
    } catch (error) {
        console.error('Instagram posts scraping error:', error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit') || '12');

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

        // Scrape Instagram posts
        const posts = await scrapeInstagramPosts(username, limit);

        return NextResponse.json({
            status: 'success',
            data: posts,
            count: posts.length
        });

    } catch (error) {
        console.error('Instagram Posts API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Failed to fetch Instagram posts' },
            { status: 500 }
        );
    }
}
