"use client";

import { ColumnDef } from "@tanstack/react-table";
import { KOL } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatIDR, getCollaborationBadgeClass } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/utils";
import { EditKOLDialog } from "@/components/kols/edit-kol-dialog";
import { DeleteKOLDialog } from "@/components/kols/delete-kol-dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Helper function to calculate tier
function getTier(followers: number): string {
    if (followers >= 1000000) return "Mega-Tier";
    if (followers >= 100000) return "Macro-Tier";
    if (followers >= 10000) return "Micro-Tier";
    return "Nano-Tier";
}

export const influencerColumns: ColumnDef<KOL>[] = [
    // Selection Column
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                onClick={(e) => e.stopPropagation()}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    // Name Column with Avatar
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
            const kol = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-black shadow-sm">
                        <AvatarImage src={kol.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.id}`} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                            {kol.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold">{kol.tiktokUsername || kol.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {getTier(kol.followers || 0)}
                        </span>
                    </div>
                </div>
            );
        },
    },
    // Username Column
    {
        accessorKey: "tiktokUsername",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="TikTok Username" />
        ),
        cell: ({ row }) => (
            <span className="font-mono text-sm">@{row.getValue("tiktokUsername") || "-"}</span>
        ),
    },
    // Category Column
    {
        accessorKey: "category",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category" />
        ),
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("category") || "General"}</Badge>
        ),
    },
    // TikTok Followers
    {
        accessorKey: "tiktokFollowers",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="TikTok" />
        ),
        cell: ({ row }) => (
            <span>{formatCompactNumber(row.getValue("tiktokFollowers") || 0)}</span>
        ),
    },
    // Instagram Followers
    {
        accessorKey: "instagramFollowers",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Instagram" />
        ),
        cell: ({ row }) => (
            <span>{formatCompactNumber(row.getValue("instagramFollowers") || 0)}</span>
        ),
    },
    // Rate Card TikTok
    {
        accessorKey: "rateCardTiktok",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rate TikTok" />
        ),
        cell: ({ row }) => (
            <span>{formatIDR(row.getValue("rateCardTiktok") || 0)}</span>
        ),
    },
    // Rate Card Reels
    {
        accessorKey: "rateCardReels",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rate Reels" />
        ),
        cell: ({ row }) => (
            <span>{formatIDR(row.getValue("rateCardReels") || 0)}</span>
        ),
    },
    // Collaboration Type
    {
        accessorKey: "collaborationType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("collaborationType") as string || "PAID";
            return (
                <Badge className={`${getCollaborationBadgeClass(type as 'PAID' | 'AFFILIATE')} font-medium`}>
                    {type}
                </Badge>
            );
        },
    },
    // Actions Column
    {
        id: "actions",
        cell: ({ row }) => {
            const kol = row.original;
            return (
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <EditKOLDialog kol={kol} />
                    <DeleteKOLDialog kol={kol} />
                </div>
            );
        },
    },
];
