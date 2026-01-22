import axios from 'axios';

// Define types for TikWM responses
interface TikWMUserResponse {
    code: number;
    msg: string;
    data: {
        user: {
            id: string;
            uniqueId: string;
            nickname: string;
            avatarMedium: string;
            signature: string;
            fans: number;
            heart: number;
            video: number;
        }
    }
}

interface TikWMVideo {
    video_id: string;
    title: string;
    cover: string;
    play: string;
    author: {
        unique_id: string;
        nickname: string;
        avatar: string;
    };
    digg_count: number;
    play_count: number;
    comment_count: number;
    share_count: number;
    download_count: number;
    duration: number;
    create_time: number;
}

interface TikWMSearchResponse {
    code: number;
    msg: string;
    data: {
        videos: TikWMVideo[];
        cursor?: number;
        hasMore?: boolean;
    }
}




export const TikWMService = {
    async getUserInfo(username: string) {
        try {
            const { data } = await axios.get<TikWMUserResponse>(`https://www.tikwm.com/api/user/info?unique_id=${username}`);
            if (data.code === 0 && data.data?.user) {
                return data.data.user;
            }
            return null;
        } catch (error) {
            console.error('TikWM User Info Error:', error);
            return null;
        }
    },

    async getUserPosts(username: string) {
        try {
            console.log(`[TikWM] Fetching posts for ${username} via Puppeteer`);
            
            // Import dynamically to avoid build issues on edge (though this is a Node environment)
            const { PuppeteerService } = await import('./puppeteer');
            
            const data = await PuppeteerService.fetchTikWMUserPosts(username);

            if (data && data.code === 0 && data.data?.videos) {
                 return data.data.videos.map((video: TikWMVideo) => ({
                    id: video.video_id,
                    desc: video.title,
                    createTime: video.create_time,
                    stats: {
                        likeCount: video.digg_count,
                        playCount: video.play_count,
                        commentCount: video.comment_count,
                        shareCount: video.share_count
                    },
                    author: {
                        id: video.author.unique_id,
                        uniqueId: video.author.unique_id,
                        nickname: video.author.nickname,
                        avatarThumb: video.author.avatar
                    },
                    video: {
                        id: video.video_id,
                        cover: video.cover,
                        playAddr: video.play,
                        duration: video.duration
                    }
                }));
            }
            return [];
        } catch (error) {
            console.error('[TikWM] User Posts Puppeteer Error:', error);
            return [];
        }
    },

    async getUserFeed(username: string) {
        // Try the direct user posts endpoint first (as requested)
        const posts = await this.getUserPosts(username);
        if (posts.length > 0) return posts;

        try {
            console.log(`[TikWM] Fallback to feed/search for ${username}`);
            const { data } = await axios.get<TikWMSearchResponse>(`https://www.tikwm.com/api/feed/search?keywords=${username}`);
            
            if (data.code === 0 && data.data?.videos) {
                // Strictly filter videos to ensure they belong to the requested user
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const userVideos = data.data.videos.filter((v: any) => 
                    v.author && v.author.unique_id.toLowerCase() === username.toLowerCase()
                );

                return userVideos.map(video => ({
                    id: video.video_id,
                    desc: video.title,
                    createTime: video.create_time,
                    stats: {
                        likeCount: video.digg_count,
                        playCount: video.play_count,
                        commentCount: video.comment_count,
                        shareCount: video.share_count
                    },
                    author: {
                        id: video.author.unique_id,
                        uniqueId: video.author.unique_id,
                        nickname: video.author.nickname,
                        avatarThumb: video.author.avatar
                    },
                    video: {
                        id: video.video_id,
                        cover: video.cover,
                        playAddr: video.play,
                        duration: video.duration
                    }
                }));
            }
            return [];
        } catch (error) {
            console.error('TikWM Feed Search Error:', error);
            return [];
        }
    },

    async searchPosts(keyword: string, cursor: number = 0) {
        try {
            console.log(`[TikWM] Searching posts for keyword: ${keyword}, cursor: ${cursor}`);
            const { data } = await axios.get<TikWMSearchResponse>(`https://www.tikwm.com/api/feed/search?keywords=${keyword}&cursor=${cursor}`);
            
            if (data.code === 0 && data.data?.videos) {
                const posts = data.data.videos.map(video => ({
                    id: video.video_id,
                    type: 'video',
                    title: video.title || 'No description',
                    subtitle: video.create_time ? new Date(video.create_time * 1000).toLocaleDateString() : 'Unknown date',
                    cover: video.cover,
                    description: video.title,
                    link: `https://www.tiktok.com/@${video.author?.unique_id || 'user'}/video/${video.video_id}`,
                    stats: {
                        likes: video.digg_count,
                        plays: video.play_count,
                        comments: video.comment_count,
                        shares: video.share_count
                    },
                    author: {
                        nickname: video.author?.nickname || 'Unknown',
                        username: video.author?.unique_id || 'unknown',
                        avatar: video.author?.avatar
                    },
                    videoUrl: video.play
                }));

                return {
                    posts,
                    cursor: data.data.cursor || 0,
                    hasMore: data.data.hasMore || false
                };
            }
            return { posts: [], cursor: 0, hasMore: false };
        } catch (error) {
            console.error('[TikWM] Search Posts Error:', error);
            return { posts: [], cursor: 0, hasMore: false };
        }
    }
};
