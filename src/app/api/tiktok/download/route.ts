import { NextRequest, NextResponse } from 'next/server';
import { Downloader } from '@tobyg74/tiktok-api-dl';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json(
            { error: 'TikTok video URL is required' },
            { status: 400 }
        );
    }

    // Basic URL validation
    if (!url.includes('tiktok.com')) {
        return NextResponse.json(
            { error: 'Invalid TikTok URL' },
            { status: 400 }
        );
    }

    try {
        // Use v1 downloader as specified by user
        const result = await Downloader(url, {
            version: 'v1',
        });

        if (result.status === 'error') {
            return NextResponse.json(
                { error: result.message || 'Failed to fetch video info' },
                { status: 404 }
            );
        }

        // Transform response for clean UI consumption
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoData = result.result as any;
        
        // Helper to get first element from array or return the value if it's a string
        const getFirst = (arr: unknown): string => {
            if (Array.isArray(arr) && arr.length > 0) return arr[0];
            if (typeof arr === 'string') return arr;
            return '';
        };
        
        return NextResponse.json({
            status: 'success',
            data: {
                type: videoData?.type,
                id: videoData?.id,
                createTime: videoData?.createTime,
                description: videoData?.description || videoData?.desc,
                isADS: videoData?.isADS,
                hashtag: videoData?.hashtag || [],
                author: {
                    uid: videoData?.author?.uid || videoData?.author?.id,
                    username: videoData?.author?.username || videoData?.author?.uniqueId,
                    nickname: videoData?.author?.nickname,
                    signature: videoData?.author?.signature,
                    region: videoData?.author?.region,
                    avatar: getFirst(videoData?.author?.avatarLarger) || getFirst(videoData?.author?.avatarMedium) || getFirst(videoData?.author?.avatar),
                },
                statistics: {
                    playCount: videoData?.statistics?.playCount,
                    downloadCount: videoData?.statistics?.downloadCount,
                    shareCount: videoData?.statistics?.shareCount,
                    commentCount: videoData?.statistics?.commentCount,
                    likeCount: videoData?.statistics?.diggCount || videoData?.statistics?.likeCount,
                    collectCount: videoData?.statistics?.collectCount || videoData?.statistics?.favoriteCount || 0,
                },
                video: {
                    noWatermark: getFirst(videoData?.video?.playAddr) || getFirst(videoData?.video?.noWatermark),
                    watermark: getFirst(videoData?.video?.downloadAddr) || getFirst(videoData?.video?.watermark),
                    cover: getFirst(videoData?.video?.cover) || getFirst(videoData?.video?.originCover) || getFirst(videoData?.video?.dynamicCover),
                    dynamicCover: getFirst(videoData?.video?.dynamicCover),
                    originCover: getFirst(videoData?.video?.originCover),
                },
                music: {
                    title: videoData?.music?.title || '',
                    author: videoData?.music?.author || videoData?.music?.authorName || '',
                    cover: getFirst(videoData?.music?.coverLarge) || getFirst(videoData?.music?.coverMedium) || getFirst(videoData?.music?.cover),
                    playUrl: getFirst(videoData?.music?.playUrl),
                },
            }
        });
    } catch (error) {
        console.error('TikTok Download API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video info. Please check the URL and try again.' },
            { status: 500 }
        );
    }
}
