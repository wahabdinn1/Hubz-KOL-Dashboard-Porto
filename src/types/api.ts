/**
 * Standard API Response Types
 * Used across all API routes for consistent error handling
 */

export interface ApiResponse<T = unknown> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
    message?: string;
}

export interface ApiError {
    status: 'error';
    error: string;
    code?: string;
}

// TikTok API Types
export interface TikTokUserData {
    username: string;
    nickname: string;
    avatar: string;
    signature: string;
    verified: boolean;
    region: string;
    followers: number;
    following: number;
    hearts: number;
    videos: number;
}

export interface TikTokVideoData {
    type: string;
    id: string;
    createTime: number;
    description: string;
    isADS: boolean;
    hashtag: string[];
    author: {
        uid: string;
        username: string;
        nickname: string;
        signature: string;
        region: string;
        avatar: string;
    };
    statistics: {
        playCount: number;
        downloadCount: number;
        shareCount: number;
        commentCount: number;
        likeCount: number;
        collectCount: number;
    };
    video: {
        noWatermark: string;
        watermark: string;
        cover: string;
        dynamicCover: string;
        originCover: string;
    };
    music: {
        title: string;
        author: string;
        cover: string;
        playUrl: string;
    };
}
