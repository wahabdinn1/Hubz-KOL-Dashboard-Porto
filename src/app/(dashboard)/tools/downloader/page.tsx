"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/retroui/Button";
import { Skeleton } from "@/components/retroui/Skeleton";
import { 
    Download, 
    Play, 
    Music, 
    Eye, 
    Heart, 
    MessageCircle, 
    Share2, 
    Bookmark,
    AlertCircle,
    User,
    ExternalLink 
} from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VideoInfo {
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

export default function VideoInfoDownloaderPage() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoData, setVideoData] = useState<VideoInfo | null>(null);

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setLoading(true);
        setError(null);
        setVideoData(null);

        try {
            const response = await fetch(`/api/tiktok/download?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.status === 'success') {
                setVideoData(data.data);
            } else {
                setError(data.error || 'Failed to fetch video info');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (downloadUrl: string, type: string) => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `tiktok_${videoData?.id}_${type}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Video Info / Downloader</h1>
                <p className="text-muted-foreground mt-1">
                    Fetch TikTok video information and download without watermark.
                </p>
            </div>

            {/* Search Form */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Fetch Video
                    </CardTitle>
                    <CardDescription>Paste a TikTok video URL to get info and download links</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFetch} className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="url" className="sr-only">TikTok Video URL</Label>
                            <Input
                                id="url"
                                placeholder="https://www.tiktok.com/@username/video/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="h-11 border-2 border-black"
                            />
                        </div>
                        <Button type="submit" disabled={loading || !url.trim()}>
                            {loading ? "Fetching..." : "Fetch Info"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Skeleton className="aspect-[9/16] w-full max-w-[300px] rounded-lg" />
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="p-6 flex items-center gap-3 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Video Info Result */}
            {videoData && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Video Preview */}
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Play className="h-4 w-4" /> Video Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-[9/16] w-full max-w-[300px] mx-auto bg-black rounded-lg overflow-hidden border-2 border-black">
                                {videoData.video?.cover ? (
                                    <Image 
                                        src={videoData.video.cover} 
                                        alt="Video thumbnail"
                                        width={300}
                                        height={533}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <Play className="h-12 w-12" />
                                    </div>
                                )}
                                {videoData.isADS && (
                                    <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                        AD
                                    </span>
                                )}
                            </div>

                            {/* Download Buttons */}
                            <div className="mt-4 space-y-2">
                                {videoData.video?.noWatermark && (
                                    <Button 
                                        className="w-full"
                                        onClick={() => handleDownload(videoData.video.noWatermark, 'no_watermark.mp4')}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download HD (No Watermark)
                                    </Button>
                                )}
                                {videoData.video?.watermark && (
                                    <Button 
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleDownload(videoData.video.watermark, 'watermark.mp4')}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download (With Watermark)
                                    </Button>
                                )}
                                {videoData.music?.playUrl && (
                                    <Button 
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => handleDownload(videoData.music.playUrl, 'audio.mp3')}
                                    >
                                        <Music className="h-4 w-4 mr-2" />
                                        Download Audio Only
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Video Details */}
                    <div className="space-y-4">
                        {/* Author Info */}
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-4 w-4" /> Author
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-black">
                                        <AvatarImage src={videoData.author?.avatar} />
                                        <AvatarFallback>
                                            {videoData.author?.nickname?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{videoData.author?.nickname}</p>
                                        <p className="text-sm text-muted-foreground">@{videoData.author?.username}</p>
                                    </div>
                                    <a 
                                        href={`https://www.tiktok.com/@${videoData.author?.username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button variant="outline" size="sm">
                                            <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        {videoData.description && (
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">{videoData.description}</p>
                                    {videoData.hashtag && videoData.hashtag.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {videoData.hashtag.slice(0, 10).map((tag, i) => (
                                                <span 
                                                    key={i} 
                                                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Statistics */}
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-2 bg-muted/50 rounded border">
                                        <Eye className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                                        <p className="font-bold">{formatCompactNumber(videoData.statistics?.playCount || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Views</p>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded border">
                                        <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                                        <p className="font-bold">{formatCompactNumber(videoData.statistics?.likeCount || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Likes</p>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded border">
                                        <MessageCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
                                        <p className="font-bold">{formatCompactNumber(videoData.statistics?.commentCount || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Comments</p>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded border">
                                        <Share2 className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                                        <p className="font-bold">{formatCompactNumber(videoData.statistics?.shareCount || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Shares</p>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded border">
                                        <Bookmark className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                                        <p className="font-bold">{formatCompactNumber(videoData.statistics?.collectCount || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Saved</p>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded border">
                                        <Download className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                                        <p className="font-bold">{formatCompactNumber(videoData.statistics?.downloadCount || 0)}</p>
                                        <p className="text-xs text-muted-foreground">Downloads</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Music Info */}
                        {videoData.music && (
                            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Music className="h-4 w-4" /> Music
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        {videoData.music.cover && (
                                            <Image 
                                                src={videoData.music.cover} 
                                                alt="Music cover"
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 rounded border-2 border-black object-cover"
                                                unoptimized
                                            />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{videoData.music.title}</p>
                                            <p className="text-xs text-muted-foreground">{videoData.music.author}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
