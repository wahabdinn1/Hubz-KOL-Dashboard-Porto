"use client";


import { useData } from "@/context/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatIDR } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/utils";
import { ArrowLeft, Instagram } from "lucide-react";
import Link from "next/link";

import { EditKOLDialog } from "@/components/kols/edit-kol-dialog";
import { KOLPerformanceChart } from "@/components/kols/kol-performance-chart";
import { InvoiceListTable } from "@/components/invoices/invoice-list-table";

// Helper to resolve params in Next.js 15+ (if applicable, but safe for 14 too)
// Actually params is a Promise in newer Next.js versions, but for client components usually it's passed as prop or use useParams.
// However, since this is a page component, params is passed as a prop.
// In Next.js 15, params is async. To be safe, let's use `useParams` from `next/navigation` or just handle it if it's passed.
// Wait, `page.tsx` props: `params` is a promise in Next.js 15.
// Let's use `useParams` hook to be safe and consistent with "use client".

import { useParams } from "next/navigation";

function InfluencerDetailContent() {
    const params = useParams();
    const id = params?.id as string;
    const { kols, campaigns } = useData();

    // We need to wait for data to load? useData usually has initial data.
    const kol = kols.find((k) => k.id === id);

    // If data is loaded but KOL not found, maybe show 404 or loading?
    // Since kols might be empty initially if fetching, we should check if data is loading?
    // For now assuming data is available or empty.

    if (!kol) {
        // Only return notFound if we are sure data is loaded. 
        // But for simplicity in this prototype:
        return (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">Influencer not found or loading...</p>
                <Link href="/influencers">
                    <Button variant="link">Back to list</Button>
                </Link>
            </div>
        );
    }

    // Find associated campaigns
    const history = campaigns.filter(c =>
        c.deliverables.some(d => d.kolId === kol.id)
    );

    // Calculate aggregated stats
    const totalCampaigns = history.length;
    const totalViews = history.reduce((acc, c) => {
        const del = c.deliverables.find(d => d.kolId === kol.id);
        return acc + (del?.totalViews || 0);
    }, 0);
    const totalRevenue = history.reduce((acc, c) => {
        const del = c.deliverables.find(d => d.kolId === kol.id);
        return acc + (del?.salesGenerated || 0);
    }, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/influencers">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{kol.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{kol.category}</Badge>
                            <span>•</span>
                            <span>{kol.type} level</span>
                        </div>
                    </div>
                    <EditKOLDialog kol={kol} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-800 rounded-full w-24 h-24 mx-auto text-3xl font-bold text-slate-500">
                            {kol.name.charAt(0)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center">
                            {/* TikTok Stats */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                <div className="text-xs text-muted-foreground uppercase flex items-center justify-center gap-1">
                                    TikTok Followers
                                </div>
                                <div className="font-bold text-lg">
                                    {formatCompactNumber(kol.tiktokFollowers || 0)}
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex flex-col justify-center">
                                <div className="text-xs text-muted-foreground uppercase">Rate (TikTok)</div>
                                <div className="font-bold text-sm">{formatIDR(kol.rateCardTiktok || 0)}</div>
                            </div>

                            {/* Instagram Stats */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                                <div className="text-xs text-muted-foreground uppercase flex items-center justify-center gap-1">
                                    Instagram Followers
                                </div>
                                <div className="font-bold text-lg">
                                    {formatCompactNumber(kol.instagramFollowers || 0)}
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg flex flex-col justify-center">
                                <div className="text-xs text-muted-foreground uppercase">Rate (Reels)</div>
                                <div className="font-bold text-sm">{formatIDR(kol.rateCardReels || 0)}</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Socials</h4>
                            <div className="flex gap-2">
                                {kol.tiktokUsername && (
                                    <a href={kol.tiktokProfileLink || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 w-full transition-colors border">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                        <span className="truncate">@{kol.tiktokUsername}</span>
                                    </a>
                                )}
                                {kol.instagramUsername && (
                                    <a href={kol.instagramProfileLink || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 w-full transition-colors border">
                                        <Instagram className="h-4 w-4 text-pink-600" />
                                        <span className="truncate">@{kol.instagramUsername}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Aggregated Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-sm font-medium text-muted-foreground">Total Campaigns</div>
                                <div className="text-2xl font-bold">{totalCampaigns}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-sm font-medium text-muted-foreground">Lifetime Views</div>
                                <div className="text-2xl font-bold">{formatCompactNumber(totalViews)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-sm font-medium text-muted-foreground">Lifetime Sales</div>
                                <div className="text-2xl font-bold">{formatIDR(totalRevenue)}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Chart */}
                    <KOLPerformanceChart kolId={kol.id} campaigns={campaigns} />

                    {/* Campaign History List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No campaigns yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {history.map(campaign => {
                                        const del = campaign.deliverables.find(d => d.kolId === kol.id);
                                        return (
                                            <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                <div>
                                                    <Link href={`/campaigns/${campaign.id}`} className="font-medium hover:underline">
                                                        {campaign.name}
                                                    </Link>
                                                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                                                        <Badge variant="secondary" className="text-[10px] h-5">{campaign.platform}</Badge>
                                                        <Badge variant="secondary" className="text-[10px] h-5">{campaign.status}</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <div>{formatCompactNumber(del?.totalViews || 0)} Views</div>
                                                    <div className="text-muted-foreground">{formatIDR(del?.salesGenerated || 0)} Sales</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Linked Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InvoiceListTable kolId={kol.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function InfluencerDetailPage() {
    return (
        <InfluencerDetailContent />
    );
}
