"use client";

import { ColumnDef } from "@tanstack/react-table";
import { KOL, CampaignDeliverable } from "@/lib/static-data";
import { formatCompactNumber } from "@/lib/utils";
import {
    formatIDR,
    getCollaborationBadgeClass,
} from "@/lib/analytics";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink } from "lucide-react";
import { KOLProfileDialog } from "@/components/kols/kol-profile-dialog";
import { EditDeliverableDialog } from "@/components/campaigns/edit-deliverable-dialog";
import { useData } from "@/context/data-context";

export interface KOLTableItem {
    kol: KOL;
    del: CampaignDeliverable;
    cost: number;
    er: number;
    cpm: number;
    efficiency: number;
    tier: string;
    displayRate: number;
}

export const columns: ColumnDef<KOLTableItem>[] = [
    {
        id: "name",
        accessorFn: (row) => row.kol.name,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name & Tier" />
        ),
        cell: ({ row }) => {
            const kol = row.original.kol;
            return (
                <div className="flex flex-col gap-1">
                    <KOLProfileDialog kol={kol}>
                        <span className="font-bold cursor-pointer hover:underline">{kol.name}</span>
                    </KOLProfileDialog>
                    <TierBadge tier={row.original.tier} className="w-fit" />
                </div>
            )
        },
    },
    {
        id: "category",
        accessorFn: (row) => row.kol.category,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
            <Badge variant="outline" className="border-black">
                {row.original.kol.category}
            </Badge>
        ),
    },
    {
        id: "videos",
        accessorFn: (row) => row.del.videosCount,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Videos" />
        ),
        cell: ({ row }) => (
            <div className="text-center font-medium">{row.original.del.videosCount}</div>
        ),
    },
    {
        id: "views",
        accessorFn: (row) => row.del.totalViews,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Total Views" />
        ),
        cell: ({ row }) => formatCompactNumber(row.original.del.totalViews),
    },
    {
        id: "rate",
        accessorFn: (row) => row.cost, // Sorting by cost makes sense for "Rate" column in this context (Rate * Videos = Cost, wait. Logic in original was cost = rate * videos? No, original had logic for "realCost". But displayed column was "Rate" (unit rate) or "Cost"?
        // Original: 
        // TableHead: "Rate Reels" or "Rate TikTok"
        // TableCell: formatIDR(item?.kol.rateCardReels || 0) (This is UNIT rate)
        // So I should display UNIT rate.
        // But for sorting? original used "rate" key which sorted by unit rate.
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rate" />
        ),
        cell: ({ row }) => {
            return formatIDR(row.original.displayRate || 0);
        }
    },
    {
        accessorKey: "er",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ER" />
        ),
        cell: ({ row }) => `${row.original.er.toFixed(1)}%`,
    },
    {
        accessorKey: "cpm",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="CPM" />
        ),
        cell: ({ row }) => formatIDR(row.original.cpm),
    },
    {
        accessorKey: "efficiency",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Efficiency" />
        ),
        cell: ({ row }) => row.original.efficiency.toFixed(2),
    },
    {
        id: "status",
        accessorFn: (row) => row.del.status,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.original.del.status;
            return (
                <Badge
                    variant="outline"
                    className={`
                        border-2 border-black font-bold capitalize
                        ${status === 'completed' ? 'bg-green-300 text-black' :
                            status === 'posted' ? 'bg-blue-300 text-black' :
                                status === 'content_creation' ? 'bg-purple-300 text-black' :
                                    status === 'negotiating' ? 'bg-yellow-300 text-black' :
                                        'bg-white text-black'}
                    `}
                >
                    {status?.replace('_', ' ') || 'To Contact'}
                </Badge>
            )
        }
    },
    {
        id: "type",
        accessorFn: (row) => row.del.collaborationType,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
             <Badge className={`${getCollaborationBadgeClass(row.original.del.collaborationType || 'PAID')} font-medium`}>
                {row.original.del.collaborationType || 'PAID'}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell item={row.original} />,
    },
];

function ActionsCell({ item }: { item: KOLTableItem }) {
    const { campaign, removeKOLFromCampaignDB } = useData();
    
    return (
        <div className="flex items-center justify-end gap-2">
            {item.del.contentLink && (
                <a
                    href={item.del.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="View Content"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            )}
            <EditDeliverableDialog
                campaignId={campaign.id}
                kolId={item.kol.id}
                kolName={item.kol.name}
                initialMetrics={{
                    videosCount: item.del.videosCount,
                    totalViews: item.del.totalViews,
                    totalEngagements: item.del.totalEngagements,
                    salesGenerated: item.del.salesGenerated,
                    contentLink: item.del.contentLink,
                    collaborationType: item.del.collaborationType || 'PAID',
                    fixedFee: item.del.fixedFee,
                    commissionRate: item.del.commissionRate
                }}
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => removeKOLFromCampaignDB(campaign.id, item.kol.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
