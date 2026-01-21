"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/retroui/Button";
import { Skeleton } from "@/components/retroui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Search, User, Heart, Video, Grid3X3, Users, MapPin, ExternalLink, 
    BadgeCheck, AlertCircle, UserPlus, MessageCircle, Play, Lock, 
    Loader2, Check, Instagram
} from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useData } from "@/context/data-context";
import { useRouter } from "next/navigation";

// Helper to proxy external images through our API to bypass CORS/referrer restrictions
const proxyImage = (url: string) => `/api/image-proxy?url=${encodeURIComponent(url)}`;

// TikTok SVG icon component
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

interface TikTokUser {
    username: string;
    nickname: string;
    avatar: string;
    signature: string;
    verified: boolean;
    followers: number;
    following: number;
    hearts: number;
    videos: number;
    region: string;
}

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

type Platform = "tiktok" | "instagram";

export default function ProfileLookupPage() {
    const { addKOL, categories } = useData();
    const router = useRouter();
    
    const [platform, setPlatform] = useState<Platform>("tiktok");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingKOL, setAddingKOL] = useState(false);
    const [kolAdded, setKolAdded] = useState(false);
    
    // TikTok data
    const [tiktokData, setTiktokData] = useState<TikTokUser | null>(null);
    
    // Instagram data
    const [instagramData, setInstagramData] = useState<InstagramProfile | null>(null);
    const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

    const resetResults = () => {
        setTiktokData(null);
        setInstagramData(null);
        setInstagramPosts([]);
        setError(null);
        setKolAdded(false);
    };

    const handlePlatformChange = (newPlatform: Platform) => {
        setPlatform(newPlatform);
        resetResults();
        setUsername("");
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        resetResults();

        try {
            if (platform === "tiktok") {
                const response = await fetch(`/api/tiktok/stalk?username=${encodeURIComponent(username)}`);
                const data = await response.json();
                if (data.status === 'success') {
                    setTiktokData(data.data);
                } else {
                    setError(data.error || 'Failed to fetch TikTok profile');
                }
            } else {
                // Instagram
                const profileResponse = await fetch(`/api/instagram/profile?username=${encodeURIComponent(username.replace('@', ''))}`);
                const profileResult = await profileResponse.json();

                if (profileResult.status === 'success') {
                    setInstagramData(profileResult.data);
                    
                    // If not private, fetch posts
                    if (!profileResult.data.is_private) {
                        setLoadingPosts(true);
                        const postsResponse = await fetch(`/api/instagram/posts?username=${encodeURIComponent(username.replace('@', ''))}&limit=12`);
                        const postsResult = await postsResponse.json();
                        if (postsResult.status === 'success') {
                            setInstagramPosts(postsResult.data);
                        }
                        setLoadingPosts(false);
                    }
                } else {
                    setError(profileResult.error || profileResult.message || 'Failed to fetch Instagram profile');
                }
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAsKOL = async () => {
        setAddingKOL(true);
        try {
            let newKOL;
            
            if (platform === "tiktok" && tiktokData) {
                newKOL = {
                    id: `kol-${Date.now()}`,
                    name: tiktokData.nickname || tiktokData.username,
                    category: 'General',
                    categoryId: categories[0]?.id || '',
                    followers: tiktokData.followers,
                    avgViews: 0,
                    type: tiktokData.followers > 1000000 ? 'Mega' as const : tiktokData.followers > 100000 ? 'Macro' as const : tiktokData.followers > 10000 ? 'Micro' as const : 'Nano' as const,
                    tiktokUsername: tiktokData.username,
                    tiktokProfileLink: `https://www.tiktok.com/@${tiktokData.username}`,
                    tiktokFollowers: tiktokData.followers,
                    instagramUsername: '',
                    instagramProfileLink: '',
                    instagramFollowers: 0,
                    rateCardTiktok: 0,
                    rateCardReels: 0,
                    rateCardPdfLink: '',
                    avatar: tiktokData.avatar,
                };
            } else if (platform === "instagram" && instagramData) {
                newKOL = {
                    id: `kol-${Date.now()}`,
                    name: instagramData.full_name || instagramData.username,
                    category: 'General',
                    categoryId: categories[0]?.id || '',
                    followers: instagramData.followers,
                    avgViews: 0,
                    type: instagramData.followers > 1000000 ? 'Mega' as const : instagramData.followers > 100000 ? 'Macro' as const : instagramData.followers > 10000 ? 'Micro' as const : 'Nano' as const,
                    tiktokUsername: '',
                    tiktokProfileLink: '',
                    tiktokFollowers: 0,
                    instagramUsername: instagramData.username,
                    instagramProfileLink: `https://www.instagram.com/${instagramData.username}/`,
                    instagramFollowers: instagramData.followers,
                    rateCardTiktok: 0,
                    rateCardReels: 0,
                    rateCardPdfLink: '',
                    avatar: instagramData.profile_pic_url ? proxyImage(instagramData.profile_pic_url) : '',
                };
            }

            if (newKOL) {
                await addKOL(newKOL, false);
                setKolAdded(true);
                setTimeout(() => router.push('/influencers'), 1500);
            }
        } catch (error) {
            console.error('Failed to add KOL:', error);
        } finally {
            setAddingKOL(false);
        }
    };

    const hasResults = tiktokData || instagramData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Search className="h-8 w-8" />
                    Profile Lookup
                </h1>
                <p className="text-muted-foreground mt-1">
                    Search for influencer profiles on TikTok or Instagram
                </p>
            </div>

            {/* Platform Tabs + Search */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Profile
                    </CardTitle>
                    <CardDescription>Select a platform and enter a username</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Platform Tabs */}
                    <Tabs value={platform} onValueChange={(v) => handlePlatformChange(v as Platform)}>
                        <TabsList className="grid w-full grid-cols-2 border-2 border-black">
                            <TabsTrigger value="tiktok" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                                <TikTokIcon className="h-4 w-4" />
                                TikTok
                            </TabsTrigger>
                            <TabsTrigger value="instagram" className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white">
                                <Instagram className="h-4 w-4" />
                                Instagram
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="username" className="sr-only">{platform === "tiktok" ? "TikTok" : "Instagram"} Username</Label>
                            <Input
                                id="username"
                                placeholder={`@username or username`}
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

            {/* TikTok Results */}
            {tiktokData && (
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <Avatar className="h-24 w-24 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <AvatarImage src={tiktokData.avatar} alt={tiktokData.nickname} />
                                <AvatarFallback className="text-2xl font-bold">
                                    {tiktokData.nickname?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold">{tiktokData.nickname}</h2>
                                        {tiktokData.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                    </div>
                                    <p className="text-muted-foreground">@{tiktokData.username}</p>
                                    {tiktokData.region && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" /> {tiktokData.region}
                                        </p>
                                    )}
                                </div>

                                {tiktokData.signature && (
                                    <p className="text-sm border-l-2 border-primary pl-3 py-1 bg-muted/50 rounded-r">
                                        {tiktokData.signature}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                                        <p className="text-xl font-bold">{formatCompactNumber(tiktokData.followers)}</p>
                                        <p className="text-xs text-muted-foreground">Followers</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <User className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                        <p className="text-xl font-bold">{formatCompactNumber(tiktokData.following)}</p>
                                        <p className="text-xs text-muted-foreground">Following</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                                        <p className="text-xl font-bold">{formatCompactNumber(tiktokData.hearts)}</p>
                                        <p className="text-xs text-muted-foreground">Likes</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <Video className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                        <p className="text-xl font-bold">{formatCompactNumber(tiktokData.videos)}</p>
                                        <p className="text-xs text-muted-foreground">Videos</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Link href={`https://www.tiktok.com/@${tiktokData.username}`} target="_blank">
                                        <Button variant="outline" size="sm">
                                            <TikTokIcon className="h-4 w-4 mr-1" />
                                            View on TikTok
                                        </Button>
                                    </Link>
                                    <Button size="sm" onClick={handleAddAsKOL} disabled={addingKOL || kolAdded}>
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
            )}

            {/* Instagram Results */}
            {instagramData && (
                <>
                    <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="h-24 w-24 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-muted flex items-center justify-center">
                                    {instagramData.profile_pic_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={proxyImage(instagramData.profile_pic_url)} 
                                            alt={instagramData.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold">
                                            {instagramData.full_name?.slice(0, 2).toUpperCase() || instagramData.username?.slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold">{instagramData.full_name || instagramData.username}</h2>
                                            {instagramData.is_verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                                            {instagramData.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                        <p className="text-muted-foreground">@{instagramData.username}</p>
                                        {instagramData.is_business && instagramData.business_category && (
                                            <p className="text-sm text-muted-foreground mt-1">{instagramData.business_category}</p>
                                        )}
                                    </div>

                                    {instagramData.bio && (
                                        <p className="text-sm border-l-2 border-primary pl-3 py-1 bg-muted/50 rounded-r whitespace-pre-wrap">
                                            {instagramData.bio}
                                        </p>
                                    )}

                                    {instagramData.external_url && (
                                        <a 
                                            href={instagramData.external_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {instagramData.external_url.replace(/^https?:\/\//, '')}
                                        </a>
                                    )}

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                                            <p className="text-xl font-bold">{formatCompactNumber(instagramData.followers)}</p>
                                            <p className="text-xs text-muted-foreground">Followers</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                            <User className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                            <p className="text-xl font-bold">{formatCompactNumber(instagramData.following)}</p>
                                            <p className="text-xs text-muted-foreground">Following</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                            <Grid3X3 className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                            <p className="text-xl font-bold">{formatCompactNumber(instagramData.posts_count)}</p>
                                            <p className="text-xs text-muted-foreground">Posts</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Link href={`https://www.instagram.com/${instagramData.username}`} target="_blank">
                                            <Button variant="outline" size="sm">
                                                <Instagram className="h-4 w-4 mr-1" />
                                                View on Instagram
                                            </Button>
                                        </Link>
                                        <Button size="sm" onClick={handleAddAsKOL} disabled={addingKOL || kolAdded}>
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
                    {instagramData.is_private && (
                        <Card className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                            <CardContent className="p-6 flex items-center gap-3 text-yellow-700 dark:text-yellow-400">
                                <Lock className="h-5 w-5" />
                                <p>This is a private account. Posts are not accessible without following.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Posts Grid */}
                    {!instagramData.is_private && (
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
                                ) : instagramPosts.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {instagramPosts.map((post) => (
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

            {/* Empty state when no search yet */}
            {!loading && !hasResults && !error && (
                <Card className="border-2 border-dashed border-muted-foreground/25">
                    <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground">No profile loaded</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Enter a {platform === "tiktok" ? "TikTok" : "Instagram"} username above to get started
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
