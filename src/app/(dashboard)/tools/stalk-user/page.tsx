"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/retroui/Button";
import { Skeleton } from "@/components/retroui/Skeleton";
import { Search, User, Heart, Video, Users, MapPin, BadgeCheck, AlertCircle, UserPlus } from "lucide-react";
import { formatCompactNumber } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

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

export default function StalkUserPage() {
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<TikTokUser | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setError(null);
        setUserData(null);

        try {
            const response = await fetch(`/api/tiktok/stalk?username=${encodeURIComponent(username)}`);
            const data = await response.json();

            if (data.status === 'success') {
                setUserData(data.data);
            } else {
                setError(data.error || 'Failed to fetch user profile');
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Stalk TikTok User</h1>
                <p className="text-muted-foreground mt-1">
                    Fetch TikTok profile information including followers, videos, and bio.
                </p>
            </div>

            {/* Search Form */}
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Profile
                    </CardTitle>
                    <CardDescription>Enter a TikTok username to fetch their profile</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="username" className="sr-only">TikTok Username</Label>
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
            {userData && (
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {/* Avatar */}
                            <Avatar className="h-24 w-24 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <AvatarImage src={userData.avatar} alt={userData.nickname} />
                                <AvatarFallback className="text-2xl font-bold">
                                    {userData.nickname?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-bold">{userData.nickname}</h2>
                                        {userData.verified && (
                                            <BadgeCheck className="h-5 w-5 text-blue-500" />
                                        )}
                                    </div>
                                    <p className="text-muted-foreground">@{userData.username}</p>
                                    {userData.region && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" /> {userData.region}
                                        </p>
                                    )}
                                </div>

                                {userData.signature && (
                                    <p className="text-sm border-l-2 border-primary pl-3 py-1 bg-muted/50 rounded-r">
                                        {userData.signature}
                                    </p>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                                        <p className="text-xl font-bold">{formatCompactNumber(userData.followers)}</p>
                                        <p className="text-xs text-muted-foreground">Followers</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <User className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                        <p className="text-xl font-bold">{formatCompactNumber(userData.following)}</p>
                                        <p className="text-xs text-muted-foreground">Following</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <Heart className="h-5 w-5 mx-auto mb-1 text-red-500" />
                                        <p className="text-xl font-bold">{formatCompactNumber(userData.hearts)}</p>
                                        <p className="text-xs text-muted-foreground">Likes</p>
                                    </div>
                                    <div className="text-center p-3 bg-muted/50 rounded-lg border-2 border-black">
                                        <Video className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                        <p className="text-xl font-bold">{formatCompactNumber(userData.videos)}</p>
                                        <p className="text-xs text-muted-foreground">Videos</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <Link href={`https://www.tiktok.com/@${userData.username}`} target="_blank">
                                        <Button variant="outline" size="sm">
                                            View on TikTok
                                        </Button>
                                    </Link>
                                    <Link href={`/influencers?prefill=${userData.username}&followers=${userData.followers}`}>
                                        <Button size="sm">
                                            <UserPlus className="h-4 w-4 mr-1" />
                                            Add as KOL
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
