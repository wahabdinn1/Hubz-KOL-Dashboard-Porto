"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/retroui/Skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, User } from "lucide-react";
import { Button } from "@/components/retroui/Button";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/tiktok/creator/profile");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch profile");
                }
                
                if (data.code !== 0) {
                     throw new Error(data.message || "TikTok API Error");
                }

                setProfile(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Creator Profile</h1>
                <Card className="border-2 border-black shadow-hard">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Creator Profile</h1>
                <Alert variant="destructive" className="border-2 border-black bg-red-100">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <p className="mb-2">Ensure you have connected your TikTok Shop account in Settings.</p>
                    <Button onClick={() => window.location.href = "/settings"}>Go to Settings</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Creator Profile</h1>
            
            <Card className="border-2 border-black shadow-hard">
                <CardHeader className="flex flex-row items-center gap-6">
                    {profile.avatar_url ? (
                        <img 
                            src={profile.avatar_url} 
                            alt={profile.nickname} 
                            className="h-24 w-24 rounded-full border-2 border-black object-cover"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center">
                            <User className="h-10 w-10 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold">{profile.nickname}</h2>
                        <p className="text-muted-foreground">{profile.username || "No username"}</p>
                        <div className="flex gap-2 mt-2">
                             <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-bold">
                                {profile.region || "ID"}
                             </span>
                             <span className="bg-yellow-400 text-black border border-black text-xs px-2 py-1 rounded-full font-bold">
                                {profile.role_type || "CREATOR"}
                             </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border-2 border-black rounded-lg bg-white shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-500 mb-1">Creator ID</h3>
                            <p className="font-mono text-lg">{profile.creator_id}</p>
                        </div>
                        {/* Add more fields as available in response */}
                    </div>
                    
                    <div className="mt-6">
                         <h3 className="font-bold mb-2">JSON Dump (Debug)</h3>
                         <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs max-h-60 border border-black">
                             {JSON.stringify(profile, null, 2)}
                         </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
