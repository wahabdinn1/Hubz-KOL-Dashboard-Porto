"use client";

import { useData } from "@/context/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/analytics";
import { AddKOLDialog } from "@/components/add-kol-dialog";
import { EditKOLDialog } from "@/components/edit-kol-dialog";
import { DeleteKOLDialog } from "@/components/delete-kol-dialog";

import { useRouter } from "next/navigation";

import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

function InfluencersContent() {
    const { kols, campaigns } = useData();
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const sortedKols = [...kols].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        // Helper to get total reach
        const getReach = (k: typeof a) => (k.tiktokFollowers || 0) + (k.instagramFollowers || 0) || k.followers;

        let aValue: any = a[key as keyof typeof a];
        let bValue: any = b[key as keyof typeof b];

        if (key === 'tiktokFollowers') {
            aValue = a.tiktokFollowers || 0;
            bValue = b.tiktokFollowers || 0;
        } else if (key === 'instagramFollowers') {
            aValue = a.instagramFollowers || 0;
            bValue = b.instagramFollowers || 0;
        } else if (key === 'campaigns') {
            const aCount = campaigns.filter(c => c.deliverables.some(d => d.kolId === a.id)).length;
            const bCount = campaigns.filter(c => c.deliverables.some(d => d.kolId === b.id)).length;
            aValue = aCount;
            bValue = bCount;
        } else if (key === 'tiktokUsername') {
            aValue = (a.tiktokUsername || a.name).toLowerCase();
            bValue = (b.tiktokUsername || b.name).toLowerCase();
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Influencer Directory</h1>
                    <p className="text-muted-foreground">Manage your roster of Key Opinion Leaders.</p>
                </div>
                <AddKOLDialog enableAutoLink={false} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Influencers</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('tiktokUsername')}>
                                    TikTok Username <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead>Socials</TableHead>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('category')}>
                                    Category <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('tiktokFollowers')}>
                                    TikTok <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('instagramFollowers')}>
                                    Instagram <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('campaigns')}>
                                    Campaigns <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('rateCardTiktok')}>
                                    Rate TikTok <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('rateCardReels')}>
                                    Rate Reels <ArrowUpDown className="inline ml-1 h-3 w-3" />
                                </TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedKols.map((kol) => {
                                // Find campaigns this KOL is part of
                                const memberCampaigns = campaigns.filter(c =>
                                    c.deliverables.some(d => d.kolId === kol.id)
                                );

                                return (
                                    <TableRow
                                        key={kol.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.push(`/influencers/${kol.id}`)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{kol.tiktokUsername || kol.name}</span>
                                                <span className="text-xs text-muted-foreground">{kol.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                {kol.tiktokUsername && (
                                                    <a href={kol.tiktokProfileLink || "#"} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white hover:text-pink-500" title={`TikTok: ${kol.tiktokUsername}`}>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                                    </a>
                                                )}
                                                {kol.instagramUsername && (
                                                    <a href={kol.instagramProfileLink || "#"} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800" title={`IG: ${kol.instagramUsername}`}>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{kol.category}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span>{kol.tiktokFollowers ? (kol.tiktokFollowers >= 1000 ? `${(kol.tiktokFollowers / 1000).toFixed(1)}k` : kol.tiktokFollowers) : '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span>{kol.instagramFollowers ? (kol.instagramFollowers >= 1000 ? `${(kol.instagramFollowers / 1000).toFixed(1)}k` : kol.instagramFollowers) : '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-sm">{memberCampaigns.length} Campaigns</span>
                                                <div className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                                                    {memberCampaigns.map(c => c.name).join(", ")}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatIDR(kol.rateCardTiktok || 0)}</TableCell>
                                        <TableCell>{formatIDR(kol.rateCardReels || 0)}</TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center">
                                                <EditKOLDialog kol={kol} />
                                                <DeleteKOLDialog kol={kol} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default function InfluencersPage() {
    return (
        <InfluencersContent />
    );
}
