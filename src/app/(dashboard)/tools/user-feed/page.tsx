"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Play, Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function UserFeedPage() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [posts, setPosts] = useState<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [author, setAuthor] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setPosts([]);
        setAuthor(null);

        try {
            const response = await fetch("/api/tiktok/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: username.trim()
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                setPosts(data.data);
                setAuthor(data.author);
                toast.success(`Found ${data.data.length} posts for @${username}`);
            } else {
                console.error("User Feed Error:", data);
                toast.error(data.message || "Failed to fetch posts. Ensure cookies are valid or try again.");
                if (data.message === "Empty response") {
                     toast("TikTok blocked the request. Try refreshing or updating cookies in Settings.", {
                        description: "This often happens due to aggressive bot protection."
                     });
                }
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("An error occurred while fetching posts");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">User Post</h1>
                <p className="text-muted-foreground">
                    Fetch and browse the latest posts from any TikTok user.
                </p>
            </div>

            {/* Search Input */}
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Enter TikTok username (e.g. tiktok)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Search className="h-4 w-4 mr-2" />
                            )}
                            Fetch Posts
                        </Button>
                    </form>
                </CardContent>
            </Card>


            {/* Author Info */}
            {author && (
                <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border">
                    {author.avatarThumb && (
                         /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                            src={author.avatarThumb} 
                            alt={author.nickname} 
                            className="h-16 w-16 rounded-full border-2 border-primary/20"
                        />
                    )}
                    <div>
                        <h2 className="text-xl font-bold">{author.nickname}</h2>
                        <p className="text-muted-foreground">@{author.username}</p>
                    </div>
                </div>
            )}

            {/* Results Grid */}
            {posts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {posts.map((post: any) => (
                        <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-all border-muted">
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
                                <div>
                                    {post.subtitle}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && posts.length === 0 && username && (
                 <div className="text-center py-12 text-muted-foreground">
                    No posts found or waiting for search.
                </div>
            )}
        </div>
    );
}
