"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/retroui/Button";
import { Skeleton } from "@/components/retroui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    TrendingUp, 
    User, 
    Video, 
    Megaphone,
    AlertCircle,
    RefreshCw,
    Settings
} from "lucide-react";
import { EmptyState } from "@/components/retroui/EmptyState";

type TrendingType = 'creator' | 'video' | 'campaign';

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
                        Discover trending creators, videos, and campaigns on TikTok.
                    </p>
                </div>
                <Button onClick={handleFetch} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Fetching...' : 'Refresh'}
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TrendingType)}>
                <TabsList className="grid w-full grid-cols-3 border-2 border-black">
                    <TabsTrigger value="video" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Video className="h-4 w-4" />
                        Videos
                    </TabsTrigger>
                    <TabsTrigger value="creator" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <User className="h-4 w-4" />
                        Creators
                    </TabsTrigger>
                    <TabsTrigger value="campaign" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Megaphone className="h-4 w-4" />
                        Campaigns
                    </TabsTrigger>
                </TabsList>

                {/* Content */}
                <div className="mt-6">
                    {/* Error State */}
                    {error && (
                        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20">
                            <CardContent className="p-6 flex items-center gap-3 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-5 w-5" />
                                <p>{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    {/* Configuration Required Message */}
                    {message && !loading && data.length === 0 && (
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-600">
                                    <Settings className="h-5 w-5" />
                                    Configuration Required
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{message}</p>
                                <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-black">
                                    <p className="text-sm font-mono">
                                        # Add to your .env file:<br />
                                        TIKTOK_SESSION_ID=your_session_cookie_here
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-semibold mb-2">How to get your TikTok session cookie:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Log in to TikTok in your browser</li>
                                        <li>Open Developer Tools (F12)</li>
                                        <li>Go to Application {'->'} Cookies {'->'} tiktok.com</li>
                                        <li>Find and copy the &quot;sessionid&quot; value</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State (No Results) */}
                    {!loading && !message && data.length === 0 && !error && (
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
                    )}

                    {/* Results Grid */}
                    {!loading && data.length > 0 && (
                        <TabsContent value={activeTab} className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Placeholder for when we have real data */}
                                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <CardContent className="p-4">
                                        <p className="text-center text-muted-foreground py-8">
                                            Trending content will appear here
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
