"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
    calculateER,
    calculateCPM,
    calculateEfficiencyScore,
    formatIDR,
} from "@/lib/analytics";
import { useData } from "@/context/data-context";
import { EditDeliverableDialog } from "@/components/edit-deliverable-dialog";

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

        let tier = "Mid-Tier";
        if (kol.followers > 1000000) tier = "Macro";
        else if (kol.followers < 100000) tier = "Micro";

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

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name & Tier</TableHead>
                        <TableHead>Total Views</TableHead>
                        <TableHead>Rate TikTok</TableHead>
                        <TableHead>Rate Reels</TableHead>
                        <TableHead>ER</TableHead>
                        <TableHead>CPM</TableHead>
                        <TableHead>Efficiency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item?.kol.id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col gap-1">
                                    <span>{item?.kol.name}</span>
                                    <Badge variant={item?.tier === "Macro" ? "default" : "secondary"} className="w-fit">
                                        {item?.tier}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>{item?.del.totalViews.toLocaleString()}</TableCell>
                            <TableCell>{formatIDR(item?.kol.rateCardTiktok || 0)}</TableCell>
                            <TableCell>{formatIDR(item?.kol.rateCardReels || 0)}</TableCell>
                            <TableCell>{item?.er.toFixed(1)}%</TableCell>
                            <TableCell>{formatIDR(item?.cpm || 0)}</TableCell>
                            <TableCell>{item?.efficiency.toFixed(2)}</TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-2">
                                <EditDeliverableDialog
                                    campaignId={campaign.id}
                                    kolId={item!.kol.id}
                                    kolName={item!.kol.name}
                                    initialMetrics={{
                                        videosCount: item!.del.videosCount,
                                        totalViews: item!.del.totalViews,
                                        totalEngagements: item!.del.totalEngagements,
                                        salesGenerated: item!.del.salesGenerated
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
                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                No KOLs in this campaign. Add one to get started.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
