/**
 * Utility functions for handling content URLs
 */

export type ContentPlatform = "tiktok" | "instagram" | "youtube" | "unknown";

/**
 * Detect the platform from a URL
 */
export function detectPlatform(url: string): ContentPlatform {
    if (!url) return "unknown";
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes("tiktok.com") || lowerUrl.includes("vm.tiktok.com")) {
        return "tiktok";
    }
    
    if (lowerUrl.includes("instagram.com") || lowerUrl.includes("instagr.am")) {
        return "instagram";
    }
    
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        return "youtube";
    }
    
    return "unknown";
}

/**
 * Extract video ID from various platform URLs
 */
export function extractVideoId(url: string): string | null {
    if (!url) return null;
    
    const platform = detectPlatform(url);
    
    try {
        const urlObj = new URL(url);
        
        if (platform === "tiktok") {
            // TikTok URLs: https://www.tiktok.com/@username/video/1234567890
            // or: https://vm.tiktok.com/XXXXX
            const match = url.match(/video\/(\d+)/);
            if (match) return match[1];
            
            // Short URL - return the path
            if (urlObj.hostname.includes("vm.tiktok.com")) {
                return urlObj.pathname.replace("/", "");
            }
        }
        
        if (platform === "instagram") {
            // Instagram URLs: https://www.instagram.com/reel/XXXXX/
            // or: https://www.instagram.com/p/XXXXX/
            const match = url.match(/\/(reel|p)\/([^/?]+)/);
            if (match) return match[2];
        }
        
        if (platform === "youtube") {
            // YouTube URLs: https://www.youtube.com/watch?v=XXXXX
            // or: https://youtu.be/XXXXX
            if (urlObj.hostname.includes("youtu.be")) {
                return urlObj.pathname.replace("/", "");
            }
            return urlObj.searchParams.get("v");
        }
    } catch {
        return null;
    }
    
    return null;
}

/**
 * Generate a thumbnail URL for a video
 */
export function getThumbnailUrl(url: string): string | null {
    const platform = detectPlatform(url);
    const videoId = extractVideoId(url);
    
    if (!videoId) return null;
    
    if (platform === "youtube") {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    
    // TikTok and Instagram don't have public thumbnail APIs
    return null;
}
