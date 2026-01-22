"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Play, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function SearchFeedPage() {
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [posts, setPosts] = useState<any[]>([]);

    const [cursor, setCursor] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setLoading(true);
        setPosts([]);
        setCursor(0);
        setHasMore(false);

        try {
            const response = await fetch("/api/tiktok/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    keyword: keyword.trim(),
                    cursor: 0
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setPosts(data.data);
                setCursor(data.cursor);
                setHasMore(data.hasMore);
                toast.success(`Found ${data.data.length} results for "${keyword}"`);
            } else {
                console.error("Search Feed Error:", data);
                toast.error(data.message || "Failed to fetch results.");
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("An error occurred while searching");
        } finally {
            setLoading(false);
        }
    };

    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;
        setLoading(true);

        try {
            const response = await fetch("/api/tiktok/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    keyword: keyword.trim(),
                    cursor: cursor
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setPosts(prev => [...prev, ...data.data]);
                setCursor(data.cursor);
                setHasMore(data.hasMore);
            } else {
                toast.error(data.message || "Failed to load more results.");
            }
        } catch (error) {
            console.error("Load more error:", error);
            toast.error("An error occurred while loading more results");
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading, keyword, cursor]);

    // Infinite scroll with IntersectionObserver
    const sentinelRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && posts.length > 0) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, loadMore, posts.length]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Hashtag Search</h1>
                <p className="text-muted-foreground">
                    Discover videos by searching for keywords, hashtags, or topics.
                </p>
            </div>

            {/* Search Input */}
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter keyword or hashtag (e.g. #fyp, funny cats)"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading && posts.length === 0 ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Search className="h-4 w-4 mr-2" />
                            )}
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Results Grid */}
            {posts.length > 0 && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {posts.map((post: any, index: number) => (
                            <Card key={`${post.id}-${index}`} className="overflow-hidden group hover:shadow-lg transition-all border-muted">
                                <div className="aspect-[9/16] relative bg-black">
                                    {post.cover ? (
                                         /* eslint-disable-next-line @next/next/no-img-element */
                                        <img 
                                            src={post.cover} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/20">
                                            <Play className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                                    
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            {post.author.avatar && (
                                                 /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={post.author.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-white/50" />
                                            )}
                                            <span className="text-xs font-semibold truncate text-white/90">@{post.author.username}</span>
                                        </div>
                                        <p className="line-clamp-2 text-sm font-medium mb-2">{post.title}</p>
                                        <div className="flex items-center justify-between text-xs text-white/80">
                                            <div className="flex items-center gap-1">
                                                <Play className="h-3 w-3" />
                                                <span>{post.stats.plays.toLocaleString()}</span>
                                            </div>
                                             <div className="flex items-center gap-1">
                                                <Heart className="h-3 w-3" />
                                                <span>{post.stats.likes.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <a 
                                        href={post.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                                <CardContent className="p-3 gap-2 flex justify-between text-xs text-muted-foreground bg-muted/5">
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="h-3 w-3" />
                                        {post.stats.comments.toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Share2 className="h-3 w-3" />
                                        {post.stats.shares.toLocaleString()}
                                    </div>
                                    <div className="truncate max-w-[100px]" title={post.subtitle}>
                                        {post.subtitle}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Infinite Scroll Sentinel */}
                    <div ref={sentinelRef} className="flex justify-center py-8">
                        {loading && posts.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading more...</span>
                            </div>
                        )}
                        {!hasMore && posts.length > 0 && (
                            <p className="text-sm text-muted-foreground">No more results</p>
                        )}
                    </div>
                </div>
            )}

            {!loading && posts.length === 0 && keyword && (
                <div className="text-center py-12 text-muted-foreground">
                    No results found.
                </div>
            )}
        </div>
    );
}
