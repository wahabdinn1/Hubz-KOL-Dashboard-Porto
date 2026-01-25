/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

// Note: TikTok Trending API requires special handling
// Uses user's saved session cookie from their profile

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'video'; // creator | video | campaign

    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({
                status: 'error',
                error: 'Authentication required',
                message: 'Please log in to access trending content'
            }, { status: 401 });
        }
        
        // CUSTOM OPTIONS FOR API
        // Zen Browser / Firefox Windows User Agent (matches user's cookie context)
        const API_OPTIONS = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
            region: 'ID', // Indicated by previous debug snippet "region":"ID"
            sid_tt: searchParams.get('sid_tt') // Optional if we want to pass more
        };

        // Fetch user's TikTok session cookie from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('tiktok_session_cookie')
            .eq('id', user.id)
            .single();

        // Note: TrendingCreators from this library seemingly doesn't require a cookie.
        // We will proceed without strict cookie check for this endpoint, 
        // but keep the logic available if we need to pass session_id for other endpoints.
        
        let sessionCookie = profile?.tiktok_session_cookie;
        if (!sessionCookie && process.env.TIKTOK_SESSION_ID) {
            sessionCookie = process.env.TIKTOK_SESSION_ID;
        }
        
        let filteredData: any[] = [];
        let message: string | undefined;

        // Import the library dynamically
        const { Trending, TrendingCreators } = await import('@tobyg74/tiktok-api-dl');
        
        let result: any = null;

        if (type === 'creator') {
             // https://github.com/TobyG74/tiktok-api-dl?tab=readme-ov-file#tiktok-trending
             // Returns TrendingCreatorsResponse
             // We can try passing cookie if available, or empty object
             const creatorOptions = sessionCookie ? { 
                cookie: sessionCookie,
                ...API_OPTIONS 
             } as any : { ...API_OPTIONS } as any;

             result = await TrendingCreators(creatorOptions);
             
             // Retry logic for creators
             let creators = (result.status === 'success' && Array.isArray(result.result)) ? result.result : [];
             if (creators.length === 0 && sessionCookie) {
                 const retryResult = await TrendingCreators({ ...API_OPTIONS } as any);
                 if (retryResult.status === 'success' && Array.isArray(retryResult.result) && retryResult.result.length > 0) {
                     result = retryResult;
                 }
             }

             if (result.status === 'success') {
                 // Normalize creator data
                 creators = (result.result as any[]) || [];
                 filteredData = creators.map((item: any) => ({
                     id: item.id,
                     type: 'user',
                     title: item.nickname,
                     subtitle: item.username,
                     cover: item.avatarThumb,
                     description: item.description,
                     link: item.link,
                     stats: {
                         followers: item.followerCount,
                         likes: item.heartCount,
                         videos: item.videoCount
                     }
                 }));
             } else {
                 throw new Error(result.message || 'Failed to fetch trending creators');
             }
        } else {
            // Video (General Trending)
            // https://github.com/TobyG74/tiktok-api-dl?tab=readme-ov-file#tiktok-trending
            
            // Helper to aggregate exploreList from all sections
            const aggregateExploreList = (res: any) => {
                let list: any[] = [];
                const raw = (res?.status === 'success' && Array.isArray(res?.result)) ? res.result : [];
                raw.forEach((section: any) => {
                    if (section.exploreList && Array.isArray(section.exploreList)) {
                        list = list.concat(section.exploreList);
                    }
                });
                return list;
            };

            // Attempt to use cookie
            const cookieOptions = sessionCookie ? { 
                cookie: sessionCookie,
                ...API_OPTIONS
            } as any : { ...API_OPTIONS } as any;
            
            result = await Trending(cookieOptions);
            
            let allExploreItems = aggregateExploreList(result);

            // Retry logic: If result is empty and we used a cookie, try without cookie but WITH options
            if (allExploreItems.length === 0 && sessionCookie) {
                const retryResult = await Trending({ ...API_OPTIONS } as any);
                const retryItems = aggregateExploreList(retryResult);
                
                // Mark that we attempted retry
                (result as any).retryAttempted = true;

                if (retryItems.length > 0) {
                     // Use the anonymous result
                     result = retryResult;
                     allExploreItems = retryItems;
                     (result as any).retrySuccess = true;
                }
            }

            if (result.status === 'success') {
                 // Collect types for debug
                const typesFound = new Set<number>();

                filteredData = allExploreItems
                    .filter((item: any) => {
                        const t = item.cardItem?.type;
                        if (t !== undefined) typesFound.add(t);
                         // Type 1 = Video usually. User reported Hashtag(13), Audio(3), Creator(5).
                        return t === 1; 
                    })
                    .map((item: any) => {
                    const card = item.cardItem;
                    return {
                        id: card.id,
                        type: 'video',
                        title: card.title || card.description, 
                        subtitle: card.subTitle, 
                        cover: card.cover,
                        description: card.description,
                        link: card.link,
                        stats: {
                            likes: card.extraInfo?.likes || 0,
                            plays: card.extraInfo?.play || 0,
                            digg: card.extraInfo?.digg || 0,
                        }
                    };
                });
                
                // Store types in debug
                if (!result.debug) result.debug = {};
                result.debug.typesFound = Array.from(typesFound);

            } else {
                 throw new Error(result.message || 'Failed to fetch trending videos');
            }
        }
        
        return NextResponse.json({
            status: 'success',
            type: type,
            data: filteredData,
            message: message,
            debug: {
                hasCookie: !!sessionCookie,
                cookieLength: sessionCookie?.length || 0,
                resultStatus: 'success', 
                retryAttempted: !!(result as any).retryAttempted,
                retrySuccess: !!(result as any).retrySuccess,
                rawResultCount: Array.isArray(filteredData) ? filteredData.length : 0,
                typesFound: (result as any)?.debug?.typesFound || [],
                rawResponseKeys: typeof result === 'object' ? Object.keys(result || {}) : [],
                rawResponseResultType: typeof (result as any)?.result,
                rawResponseResultIsArray: Array.isArray((result as any)?.result),
                resultResultLength: Array.isArray((result as any)?.result) ? (result as any).result.length : 'N/A',
                firstItemKeys: Array.isArray((result as any)?.result) && (result as any).result[0] ? Object.keys((result as any).result[0]) : [],
                firstItemSnippet: Array.isArray((result as any)?.result) && (result as any).result[0] ? JSON.stringify((result as any).result[0]).substring(0, 200) : 'null'
            }
        });

    } catch (error) {
        console.error('TikTok Trending API Error:', error);
        return NextResponse.json(
            { status: 'error', error: 'Failed to fetch trending content' },
            { status: 500 }
        );
    }
}

