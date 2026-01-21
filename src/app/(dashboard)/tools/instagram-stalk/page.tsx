"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/retroui/Button";
import { Skeleton } from "@/components/retroui/Skeleton";
import { Search, User, Heart, Grid3X3, Users, ExternalLink, BadgeCheck, AlertCircle, UserPlus, MessageCircle, Play, Lock, Instagram, Loader2, Check } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import Link from "next/link";
import { useData } from "@/context/data-context";
import { useRouter } from "next/navigation";

// Helper to proxy external images through our API to bypass CORS/referrer restrictions
const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`;

interface InstagramProfile {
    username: string;
    full_name: string;
    bio: string;
    biography_hashtags: string[];
    biography_mentions: string[];
    external_url: string | null;
    followers: number;
    following: number;
    posts_count: number;
    profile_pic_url: string;
    is_private: boolean;
    is_verified: boolean;
    is_business: boolean;
    business_category: string | null;
}

interface InstagramPost {
    id: string;
    shortcode: string;
    url: string;
    caption: string | null;
    caption_hashtags: string[];
    likes: number;
    comments: number;
    timestamp: string;
    media_url: string;
    is_video: boolean;
    video_view_count: number | null;
    typename: string;
}

export default function InstagramStalkPage() {
    const { addKOL, categories } = useData();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<InstagramProfile | null>(null);
    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [addingKOL, setAddingKOL] = useState(false);
    const [kolAdded, setKolAdded] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setError(null);
        setProfileData(null);
        setPosts([]);

        try {
            // Fetch profile
            const profileResponse = await fetch(`/api/instagram/profile?username=${encodeURIComponent(username.replace('@', ''))}`);
            const profileResult = await profileResponse.json();

            if (profileResult.status === 'success') {
                setProfileData(profileResult.data);
                
                // If not private, fetch posts
                if (!profileResult.data.is_private) {
                    setLoadingPosts(true);
                    const postsResponse = await fetch(`/api/instagram/posts?username=${encodeURIComponent(username.replace('@', ''))}&limit=12`);
                    const postsResult = await postsResponse.json();
                    
                    if (postsResult.status === 'success') {
                        setPosts(postsResult.data);
                    }
                    setLoadingPosts(false);
                }
            } else {
                setError(profileResult.error || profileResult.message || 'Failed to fetch Instagram profile');
            }
        } catch {
            setError('Network error. Please ensure the Instagram API backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsKOL = async () => {
        if (!profileData) return;
        setAddingKOL(true);
        try {
            const newKOL = {
                id: `kol-${Date.now()}`,
                name: profileData.full_name || profileData.username,
                category: 'General',
                categoryId: categories[0]?.id || '',
                followers: profileData.followers,
                avgViews: 0,
                type: profileData.followers > 1000000 ? 'Mega' as const : profileData.followers > 100000 ? 'Macro' as const : profileData.followers > 10000 ? 'Micro' as const : 'Nano' as const,
                tiktokUsername: '',
                tiktokProfileLink: '',
                tiktokFollowers: 0,
                instagramUsername: profileData.username,
                instagramProfileLink: `https://www.instagram.com/${profileData.username}/`,
                instagramFollowers: profileData.followers,
                rateCardTiktok: 0,
                rateCardReels: 0,
                rateCardPdfLink: '',
                avatar: profileData.profile_pic_url ? proxyImage(profileData.profile_pic_url) : '',
            };
            await addKOL(newKOL, false);
            setKolAdded(true);
            setTimeout(() => router.push('/influencers'), 1500);
        } catch (error) {
            console.error('Failed to add KOL:', error);
        } finally {
            setAddingKOL(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Instagram className="h-8 w-8" />
                    Stalk Instagram User
                </h1>
                <p className="text-muted-foreground mt-1">
                    Fetch Instagram profile information including followers, posts, and bio.
                </p>
            </div>

            {/* Search Form */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Profile
                    </CardTitle>
                    <CardDescription>Enter an Instagram username to fetch their profile</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="username" className="sr-only">Instagram Username</Label>
                            <Input
                                id="username"
                                placeholder="@username or username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-11 border-2 border-black"
                            />
                        </div>
                        <Button type="submit" disabled={loading || !username.trim()}>
                            {loading ? "Searching..." : "Search"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <div className="flex-1 space-y-3">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-full" />
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

            {/* User Profile Result */}
            {profileData && (
                <>
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                {/* Profile Picture - using native img for Instagram CDN */}
                                <div className="h-24 w-24 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-muted flex items-center justify-center">
                                    {profileData.profile_pic_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={proxyImage(profileData.profile_pic_url)} 
                                            alt={profileData.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold">
                                            {profileData.full_name?.slice(0, 2).toUpperCase() || profileData.username?.slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold">{profileData.full_name || profileData.username}</h2>
                                            {profileData.is_verified && (
                                                <BadgeCheck className="h-5 w-5 text-blue-500" />
                                            )}
                                            {profileData.is_private && (
                                                <Lock className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">@{profileData.username}</p>
                                        {profileData.is_business && profileData.business_category && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {profileData.business_category}
                                            </p>
                                        )}
                                    </div>

                                    {profileData.bio && (
                                        <p className="text-sm border-l-2 border-primary pl-3 py-1 bg-muted/50 rounded-r whitespace-pre-wrap">
                                            {profileData.bio}
                                        </p>
                                    )}

                                    {profileData.external_url && (
                                        <a 
                                            href={profileData.external_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {profileData.external_url.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                                            <p className="text-xl font-bold">{formatCompactNumber(profileData.followers)}</p>
                                            <p className="text-xs text-muted-foreground">Followers</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                            <User className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                            <p className="text-xl font-bold">{formatCompactNumber(profileData.following)}</p>
                                            <p className="text-xs text-muted-foreground">Following</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                            <Grid3X3 className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                            <p className="text-xl font-bold">{formatCompactNumber(profileData.posts_count)}</p>
                                            <p className="text-xs text-muted-foreground">Posts</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Link href={`https://www.instagram.com/${profileData.username}`} target="_blank">
                                            <Button variant="outline" size="sm">
                                                <Instagram className="h-4 w-4 mr-1" />
                                                View on Instagram
                                            </Button>
                                        </Link>
                                        <Button 
                                            size="sm" 
                                            onClick={handleAddAsKOL}
                                            disabled={addingKOL || kolAdded}
                                        >
                                            {kolAdded ? (
                                                <><Check className="h-4 w-4 mr-1" /> Added!</>
                                            ) : addingKOL ? (
                                                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding...</>
                                            ) : (
                                                <><UserPlus className="h-4 w-4 mr-1" /> Add as KOL</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Private Account Notice */}
                    {profileData.is_private && (
                        <Card className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                            <CardContent className="p-6 flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
                                <Lock className="h-5 w-5" />
                                <p>This is a private account. Posts are not accessible without following.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Posts Grid */}
                    {!profileData.is_private && (
                        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Grid3X3 className="h-5 w-5" />
                                    Recent Posts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPosts ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <Skeleton key={i} className="aspect-square rounded-lg" />
                                        ))}
                                    </div>
                                ) : posts.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {posts.map((post) => (
                                            <a
                                                key={post.id}
                                                href={post.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={proxyImage(post.media_url)}
                                                    alt={post.caption || 'Instagram post'}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {post.is_video && (
                                                    <div className="absolute top-2 right-2">
                                                        <Play className="h-5 w-5 text-white drop-shadow-lg" />
                                                    </div>
                                                )}
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="h-5 w-5" />
                                                        <span className="font-bold">{formatCompactNumber(post.likes)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MessageCircle className="h-5 w-5" />
                                                        <span className="font-bold">{formatCompactNumber(post.comments)}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No posts found</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
