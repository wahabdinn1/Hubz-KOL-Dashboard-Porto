"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Campaign } from "@/lib/static-data";
import { formatIDR } from "@/lib/analytics";
import { Progress } from "@/components/retroui/Progress";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTableRowSelection, DataTableRowCheckbox } from "@/components/ui/data-table-row-selection";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Copy, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useData } from "@/context/data-context";
import { DeleteCampaignDialog } from "./delete-campaign-dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface CampaignWithMetrics extends Campaign {
    totalSpend: number;
    totalRevenue: number;
    roi: number;
    completionPercent: number;
}

export const columns: ColumnDef<CampaignWithMetrics>[] = [
    {
        id: "select",
        header: ({ table }) => <DataTableRowSelection table={table} />,
        cell: ({ row }) => (
            <DataTableRowCheckbox 
                checked={row.getIsSelected()} 
                onCheckedChange={(value) => row.toggleSelected(!!value)} 
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "platform",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Platform" />
        ),
        cell: ({ row }) => {
            const platform = row.getValue("platform") as string;
            return (
                <div className="flex items-center">
                     <span className={`inline-flex items-center justify-center rounded-full w-8 h-8 border ${platform === 'Instagram'
                        ? 'bg-pink-50 text-pink-700 border-pink-200'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }`}>
                        {platform === 'Instagram' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                        )}
                    </span>
                    <span className="ml-2 capitalize">{platform}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Campaign Name" />
        ),
        cell: ({ row }) => {
            return (
                <Link 
                    href={`/campaigns/${row.original.id}`}
                    className="font-medium hover:underline text-blue-600 dark:text-blue-400 block truncate max-w-[200px]"
                    title={row.getValue("name")}
                >
                    {row.getValue("name")}
                </Link>
            )
        }
    },
    {
        accessorKey: "objective",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Objective" />
        ),
        cell: ({ row }) => {
            const objective = row.getValue("objective") as string;
             return (
                <Badge variant="outline" className={`${objective === 'CONVERSION'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                    {objective}
                </Badge>
            );
        },
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Start Date" />
        ),
        cell: ({ row }) => row.getValue("startDate") || "-",
    },
    {
        accessorKey: "endDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="End Date" />
        ),
        cell: ({ row }) => row.getValue("endDate") || "-",
    },
    {
        accessorKey: "budget",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Budget" />
        ),
        cell: ({ row }) => formatIDR(row.getValue("budget")),
    },
    {
        accessorKey: "totalSpend",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Spend" />
        ),
        cell: ({ row }) => {
            const spend = row.getValue("totalSpend") as number;
            const budget = row.original.budget;
            const percentage = budget > 0 ? (spend / budget) * 100 : 0;
            
            return (
                <div>
                    <div className="text-sm">{formatIDR(spend)}</div>
                    <div className="text-xs text-muted-foreground">{Math.round(percentage)}% Used</div>
                </div>
            );
        }
    },
    {
        accessorKey: "totalRevenue",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Revenue" />
        ),
        cell: ({ row }) => formatIDR(row.getValue("totalRevenue")),
    },
    {
        accessorKey: "completionPercent",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Progress" />
        ),
        cell: ({ row }) => {
            const progress = row.getValue("completionPercent") as number;
            return (
                <div className="flex items-center gap-2 min-w-[80px]">
                    <Progress value={progress} className="h-2 w-[60px]" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
            )
        }
    },
    {
        accessorKey: "roi",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ROI" />
        ),
        cell: ({ row }) => {
            const roi = row.getValue("roi") as number;
            return (
                <span className={roi > 0 ? "text-green-600 font-medium" : "text-slate-500"}>
                    {roi.toFixed(1)}%
                </span>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell campaign={row.original} />,
    },
];

// Separate component for actions to use hooks
function ActionsCell({ campaign }: { campaign: CampaignWithMetrics }) {
    const { duplicateCampaign } = useData();
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(campaign.id)}
                >
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => duplicateCampaign(campaign.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                      <div className="w-full cursor-pointer">
                         <DeleteCampaignDialog
                            campaign={campaign}
                            trigger={
                                <div className="flex items-center w-full text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </div>
                            }
                        />
                      </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
