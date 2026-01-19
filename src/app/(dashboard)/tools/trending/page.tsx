"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/retroui/Button";
import { Skeleton } from "@/components/retroui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    TrendingUp, 
    User, 
    Video, 
    AlertCircle,
    RefreshCw,
    Settings
} from "lucide-react";
import { EmptyState } from "@/components/retroui/EmptyState";

type TrendingType = 'creator' | 'video';

export default function TrendingPage() {
    const [activeTab, setActiveTab] = useState<TrendingType>('video');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<unknown[]>([]);
    const [message, setMessage] = useState<string | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        setData([]);
        setMessage(null);

        try {
            const response = await fetch(`/api/tiktok/trending?type=${activeTab}`);
            const result = await response.json();

            if (result.status === 'success') {
                setData(result.data || []);
                setMessage(result.message || null);
                // Capture debug info
                if (result.debug) {
                    (window as any).lastDebug = result.debug;
                }
            } else {
                setError(result.error || 'Failed to fetch trending content');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        TikTok Trending
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Discover trending creators and videos on TikTok.
                    </p>
                </div>
                <Button onClick={handleFetch} disabled={loading} variant="outline" className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Fetching...' : 'Refresh'}
                </Button>
                <Button variant="outline" className="gap-2" asChild>
                     <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        Configure Access
                     </Link>
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TrendingType)}>
                <TabsList className="grid w-full grid-cols-2 lg:w-[300px] border-2 border-black">
                    <TabsTrigger value="video" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Video className="h-4 w-4" />
                        Videos
                    </TabsTrigger>
                    <TabsTrigger value="creator" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <User className="h-4 w-4" />
                        Creators
                    </TabsTrigger>
                </TabsList>

                {/* Content */}
                <div className="mt-6">
                    {/* Error State */}
                    {error && (
                        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 mb-6">
                            <CardContent className="p-6 flex items-center gap-3 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Configuration Required Message */}
                    {message && !loading && (
                        <Card className="border-l-4 border-yellow-500 mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-700">
                                    <AlertCircle className="h-5 w-5" />
                                    Configuration Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{message}</p>
                                <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-black space-y-2">
                                    <p className="text-sm">
                                        <strong>Option 1 (Recommended):</strong> Go to <Link href="/settings" className="underline hover:text-primary">Settings</Link> and enter your TikTok Session Cookie.
                                    </p>
                                    <p className="text-sm font-mono pt-2 border-t border-slate-300 dark:border-slate-700">
                                        # Option 2: Add to .env file<br />
                                        TIKTOK_SESSION_ID=your_session_cookie_here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="border-2 border-black">
                                    <CardContent className="p-4">
                                        <Skeleton className="h-40 w-full mb-3" />
                                        <Skeleton className="h-4 w-3/4 mb-2" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State (No Results) */}
                    {!loading && !message && data.length === 0 && !error && (
                        <div className="space-y-4">
                            <EmptyState
                                title="No trending content yet"
                                description="Click 'Refresh' to fetch the latest trending content from TikTok."
                                icon={<TrendingUp className="h-12 w-12" />}
                                action={
                                    <Button onClick={handleFetch}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Fetch Trending
                                    </Button>
                                }
                            />
                            {/* Debug Info */}
                            {/* @ts-ignore */}
                            {(data as any)?.debug || (window as any).lastDebug && (
                                <Card className="border-2 border-dashed border-slate-300">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Debug Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-auto max-h-40">
                                            {JSON.stringify((window as any).lastDebug, null, 2)}
                                        </pre>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Results Grid */}
                    {!loading && data.length > 0 && (
                        <TabsContent value={activeTab} className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {data.map((item: any) => (
                                    <Card key={item.id} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                                        <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
                                            {/* Use img for simplicity, fallback to generic if missing */}
                                            {item.cover ? (
                                                <img 
                                                    src={item.cover} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover" 
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    {item.type === 'user' ? (
                                                        <User className="h-10 w-10 text-slate-400" />
                                                    ) : (
                                                        <Video className="h-10 w-10 text-slate-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="font-bold text-lg line-clamp-1">{item.title || item.subtitle || 'Untitled'}</h3>
                                                    <p className="text-sm text-muted-foreground font-medium">{item.subtitle}</p>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                                                {item.description}
                                            </p>
                                            
                                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground border-t pt-3 mt-auto">
                                                {item.type === 'user' ? (
                                                    <>
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-foreground">{item.stats?.followers?.toLocaleString() || 0}</span>
                                                            <span>Followers</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-foreground">{item.stats?.likes?.toLocaleString() || 0}</span>
                                                            <span>Likes</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-foreground">{item.stats?.videos?.toLocaleString() || 0}</span>
                                                            <span>Videos</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-foreground">{item.stats?.playCount?.toLocaleString() || item.stats?.plays?.toLocaleString() || 0}</span>
                                                            <span>Views</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-foreground">{item.stats?.digg?.toLocaleString() || item.stats?.likes?.toLocaleString() || 0}</span>
                                                            <span>Likes</span>
                                                        </div>
                                                        <div className="flex flex-col items-center">
                                                            {/* Generic stat if needed */}
                                                            <Link href={item.link || '#'} target="_blank" className="text-blue-600 underline">
                                                                Watch
                                                            </Link>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            
                                            {item.type === 'user' && (
                                                <Button className="w-full mt-4 bg-black text-white hover:bg-slate-800" asChild>
                                                    <Link href={item.link || '#'} target="_blank">
                                                        View Profile
                                                    </Link>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
