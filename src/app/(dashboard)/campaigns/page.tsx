"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatIDR, calculateROI } from "@/lib/analytics";
import { Progress } from "@/components/retroui/Progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog";
import { DeleteCampaignDialog } from "@/components/campaigns/delete-campaign-dialog";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { Campaign } from "@/lib/static-data";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CampaignsListContent() {
  const { campaigns, kols, deleteCampaigns, duplicateCampaign } = useData();

  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Batch Select Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(campaigns.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} campaigns? This action cannot be undone.`)) return;
    await deleteCampaigns(selectedIds);
    setSelectedIds([]);
  }

  // Helper to calculate metrics for a single campaign row
  const getCampaignMetrics = (campaign: Campaign) => {
    let totalSpend = 0;
    let totalRevenue = 0;

    campaign.deliverables.forEach((del) => {
      const kol = kols.find((k) => k.id === del.kolId);
      if (!kol) return;
      const rate = campaign.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
      totalSpend += rate * del.videosCount;
      totalRevenue += del.salesGenerated;
    });

    const roi = calculateROI(totalRevenue, totalSpend);

    // Calculate completion % based on deliverable statuses
    const completedCount = campaign.deliverables.filter(d => d.status === 'completed' || d.status === 'posted').length;
    const completionPercent = campaign.deliverables.length > 0
      ? Math.round((completedCount / campaign.deliverables.length) * 100)
      : 0;

    return { totalSpend, totalRevenue, roi, completionPercent };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            All Campaigns
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of all your marketing initiatives.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="animate-in zoom-in"
            >
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <CreateCampaignDialog />
        </div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Click on a campaign to view detailed performance metrics.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    className="translate-y-[2px]"
                    checked={selectedIds.length === campaigns.length && campaigns.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">Budget</TooltipTrigger>
                      <TooltipContent><p className="text-xs">Total allocated campaign budget</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">Total Spend</TooltipTrigger>
                      <TooltipContent><p className="text-xs">Sum of all KOL rates × videos</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">Revenue</TooltipTrigger>
                      <TooltipContent><p className="text-xs">Total sales generated from campaign</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">Progress</TooltipTrigger>
                      <TooltipContent><p className="text-xs">Campaign completion based on deliverable statuses</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-help">ROI</TooltipTrigger>
                      <TooltipContent><p className="text-xs">Return on Investment: (Revenue - Spend) / Spend</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-24 text-muted-foreground">
                    No campaigns found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => {
                  const metrics = getCampaignMetrics(campaign);
                  const isSelected = selectedIds.includes(campaign.id);
                  return (
                    <TableRow
                      key={campaign.id}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors group ${isSelected ? 'bg-muted' : ''}`}
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="translate-y-[2px]"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(campaign.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium border ${campaign.platform === 'Instagram'
                          ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                          }`}>
                          {campaign.platform === 'Instagram' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                          )}
                          {campaign.platform || 'TikTok'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${campaign.objective === 'CONVERSION'
                          ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-400/20'
                          : 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/20'
                          }`}>
                          {campaign.objective || 'AWARENESS'}
                        </span>
                      </TableCell>
                      <TableCell>{campaign.startDate || "-"}</TableCell>
                      <TableCell>{campaign.endDate || "-"}</TableCell>
                      <TableCell>{formatIDR(campaign.budget)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatIDR(metrics.totalSpend)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((metrics.totalSpend / campaign.budget) * 100)}% Used
                        </div>
                      </TableCell>
                      <TableCell>{formatIDR(metrics.totalRevenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={metrics.completionPercent} className="h-2 w-[60px]" />
                          <span className="text-xs text-muted-foreground">{metrics.completionPercent}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={metrics.roi > 0 ? "text-green-600 font-medium" : "text-slate-500"}>
                          {metrics.roi.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateCampaign(campaign.id);
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <DeleteCampaignDialog
                                campaign={campaign}
                                trigger={
                                  <div className="flex items-center w-full text-red-600 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span className="flex-1">Delete</span>
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap with DashboardShell AND DataProvider
export default function CampaignsListPage() {
  return (
    <CampaignsListContent />
  );
}
