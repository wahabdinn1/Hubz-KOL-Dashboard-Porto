"use client";

"use client";

import { formatCompactNumber } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import {
    calculateER,
    calculateCPM,
    calculateEfficiencyScore,
    formatIDR,
} from "@/lib/analytics";
import { useData } from "@/context/data-context";
import { EditDeliverableDialog } from "@/components/campaigns/edit-deliverable-dialog";
import { KOLProfileDialog } from "@/components/kols/kol-profile-dialog";

export function KOLTable() {
    const { kols, campaign, removeKOLFromCampaignDB } = useData();

    // Join Data: Deliverables + KOL
    // We want to show ALL KOLs? Or just those in Campaign?
    // Dashboard usually implies Campaign Performance.
    // But usage "Add KOL" dialog adds to Inventory.
    // If we only show Campaign Deliverables, newly added KOLs (without deliverables) won't show up.
    // I implemented "addCampaignDeliverable" with 0 stats in Context. So they SHOULD show up.

    const data = campaign.deliverables.map((del) => {
        const kol = kols.find((k) => k.id === del.kolId);
        if (!kol) return null;
        const er = calculateER(del.totalEngagements, del.totalViews);

        // Calculate Cost based on Campaign Platform
        const rate = campaign.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
        const realCost = rate * del.videosCount;

        const cpm = calculateCPM(realCost, del.totalViews);
        const efficiency = calculateEfficiencyScore(del.totalViews, realCost);

        let tier = "Nano-Tier";
        if (kol.followers >= 1000000) tier = "Mega-Tier";
        else if (kol.followers >= 100000) tier = "Macro-Tier";
        else if (kol.followers >= 10000) tier = "Micro-Tier";

        return {
            kol,
            del,
            cost: realCost,
            er,
            cpm,
            efficiency,
            tier,
        };
    }).filter((item) => item !== null);

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        const sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let aValue: any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let bValue: any;

                switch (sortConfig.key) {
                    case 'name':
                        aValue = a?.kol.name;
                        bValue = b?.kol.name;
                        break;
                    case 'category':
                        aValue = a?.kol.category;
                        bValue = b?.kol.category;
                        break;
                    case 'videos':
                        aValue = a?.del.videosCount;
                        bValue = b?.del.videosCount;
                        break;
                    case 'views':
                        aValue = a?.del.totalViews;
                        bValue = b?.del.totalViews;
                        break;
                    case 'rate':
                        aValue = campaign.platform === 'Instagram' ? (a?.kol.rateCardReels || 0) : (a?.kol.rateCardTiktok || 0);
                        bValue = campaign.platform === 'Instagram' ? (b?.kol.rateCardReels || 0) : (b?.kol.rateCardTiktok || 0);
                        break;
                    case 'er':
                        aValue = a?.er;
                        bValue = b?.er;
                        break;
                    case 'cpm':
                        aValue = a?.cpm;
                        bValue = b?.cpm;
                        break;
                    case 'efficiency':
                        aValue = a?.efficiency;
                        bValue = b?.efficiency;
                        break;
                    case 'status':
                        aValue = a?.del.status;
                        bValue = b?.del.status;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig, campaign.platform]);

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('name')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                Name & Tier <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('category')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                Category <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-center">
                             <Button variant="ghost" onClick={() => handleSort('videos')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                Videos <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('views')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                Total Views <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        {campaign.platform === 'Instagram' ? (
                            <TableHead>
                                 <Button variant="ghost" onClick={() => handleSort('rate')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                    Rate Reels <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                        ) : (
                            <TableHead>
                                 <Button variant="ghost" onClick={() => handleSort('rate')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                    Rate TikTok <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                        )}
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('er')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                ER <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('cpm')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                CPM <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('efficiency')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                Efficiency <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead>
                             <Button variant="ghost" onClick={() => handleSort('status')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                                Status <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedData.map((item) => (
                        <TableRow key={item?.kol.id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col gap-1">
                                    <KOLProfileDialog kol={item!.kol}>
                                        <span className="font-bold">{item?.kol.name}</span>
                                    </KOLProfileDialog>
                                    <TierBadge tier={item?.tier || "Nano-Tier"} className="w-fit" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="border-black">
                                    {item?.kol.category}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">{item?.del.videosCount}</TableCell>
                            <TableCell>{formatCompactNumber(item?.del.totalViews || 0)}</TableCell>
                            {campaign.platform === 'Instagram' ? (
                                <TableCell>{formatIDR(item?.kol.rateCardReels || 0)}</TableCell>
                            ) : (
                                <TableCell>{formatIDR(item?.kol.rateCardTiktok || 0)}</TableCell>
                            )}
                            <TableCell>{item?.er.toFixed(1)}%</TableCell>
                            <TableCell>{formatIDR(item?.cpm || 0)}</TableCell>
                            <TableCell>{item?.efficiency.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`
                                        border-2 border-black font-bold capitalize
                                        ${item?.del.status === 'completed' ? 'bg-green-300 text-black' :
                                            item?.del.status === 'posted' ? 'bg-blue-300 text-black' :
                                                item?.del.status === 'content_creation' ? 'bg-purple-300 text-black' :
                                                    item?.del.status === 'negotiating' ? 'bg-yellow-300 text-black' :
                                                        'bg-white text-black'}
                                    `}
                                >
                                    {item?.del.status?.replace('_', ' ') || 'To Contact'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-2">
                                {item?.del.contentLink && (
                                    <a
                                        href={item.del.contentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                        title="View Content"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                    </a>
                                )}
                                <EditDeliverableDialog
                                    campaignId={campaign.id}
                                    kolId={item!.kol.id}
                                    kolName={item!.kol.name}
                                    initialMetrics={{
                                        videosCount: item!.del.videosCount,
                                        totalViews: item!.del.totalViews,
                                        totalEngagements: item!.del.totalEngagements,
                                        salesGenerated: item!.del.salesGenerated,
                                        contentLink: item!.del.contentLink
                                    }}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeKOLFromCampaignDB(campaign.id, item!.kol.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                No KOLs in this campaign. Add one to get started.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
