"use client";

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
import { CampaignGantt } from "@/components/campaigns/campaign-gantt";
import { useState, useMemo, useCallback } from "react";
import { Copy, MoreHorizontal, Trash2, ArrowUpDown } from "lucide-react";
import { Campaign } from "@/lib/static-data";
import { useRouter } from "next/navigation";
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
import { EmptyState, EmptyStateIcons } from "@/components/retroui/EmptyState";
import { TablePagination } from "@/components/shared/table-pagination";
import { DataView } from "@/components/shared/data-view";

function CampaignsListContent() {
  const { campaigns, kols, deleteCampaigns, duplicateCampaign, loading } = useData();

  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
  const getCampaignMetrics = useCallback((campaign: Campaign) => {
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
  }, [kols]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCampaigns = useMemo(() => {
    const sortableItems = [...campaigns];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const metricsA = getCampaignMetrics(a);
        const metricsB = getCampaignMetrics(b);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aValue: any = a[sortConfig.key as keyof typeof a];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let bValue: any = b[sortConfig.key as keyof typeof b];

        // Handle computed metrics
        if (sortConfig.key === 'totalSpend') {
            aValue = metricsA.totalSpend;
            bValue = metricsB.totalSpend;
        } else if (sortConfig.key === 'totalRevenue') {
            aValue = metricsA.totalRevenue;
            bValue = metricsB.totalRevenue;
        } else if (sortConfig.key === 'completionPercent') {
            aValue = metricsA.completionPercent;
            bValue = metricsB.completionPercent;
        } else if (sortConfig.key === 'roi') {
            aValue = metricsA.roi;
            bValue = metricsB.roi;
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
  }, [campaigns, sortConfig, getCampaignMetrics]);

  // Paginated data
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedCampaigns.slice(startIndex, startIndex + pageSize);
  }, [sortedCampaigns, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const actions = (
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
  );

  const mobileView = (
    <>
        {paginatedCampaigns.map((campaign) => {
            const metrics = getCampaignMetrics(campaign);
            return (
            <div 
                key={campaign.id}
                className="p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
                <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center rounded-full w-8 h-8 border ${campaign.platform === 'Instagram'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                    }`}>
                    {campaign.platform === 'Instagram' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                    )}
                    </span>
                    <span className="font-medium truncate max-w-[180px]">{campaign.name}</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${campaign.objective === 'CONVERSION'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                    {campaign.objective || 'AWARENESS'}
                </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Budget: {formatIDR(campaign.budget)}</div>
                <div>ROI: {metrics.roi >= 0 ? '+' : ''}{metrics.roi.toFixed(0)}%</div>
                <div>Start: {campaign.startDate || '-'}</div>
                <div>Progress: {metrics.completionPercent.toFixed(0)}%</div>
                </div>
            </div>
            );
        })}
    </>
  );

  const desktopView = (
    <Table className="table-fixed w-full min-w-[700px]">
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
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('platform')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                    Platform <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                    Campaign Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('objective')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                    Objective <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('startDate')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                    Start Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('endDate')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                    End Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>
                <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => handleSort('budget')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                        Budget <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Total allocated campaign budget</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </TableHead>
            <TableHead>
                <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" onClick={() => handleSort('totalSpend')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                        Total Spend <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Sum of all KOL rates × videos</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </TableHead>
            <TableHead>
                <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => handleSort('totalRevenue')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                        Revenue <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Total sales generated from campaign</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </TableHead>
            <TableHead>
                <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => handleSort('completionPercent')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                        Progress <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Campaign completion based on deliverable statuses</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </TableHead>
            <TableHead>
                <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={() => handleSort('roi')} className="hover:bg-transparent px-0 font-semibold text-muted-foreground">
                        ROI <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Return on Investment: (Revenue - Spend) / Spend</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </TableHead>
            <TableHead className="text-right">Action</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {paginatedCampaigns.map((campaign) => {
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
                    <TableCell className="w-[60px]">
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <span className={`inline-flex items-center justify-center rounded-full w-8 h-8 border ${campaign.platform === 'Instagram'
                            ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                            }`}>
                            {campaign.platform === 'Instagram' ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                            )}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent><p className="text-xs">{campaign.platform || 'TikTok'}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px]">
                    <span className="block truncate" title={campaign.name}>
                        {campaign.name}
                    </span>
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
            })}
        </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
        <DataView
            pageTitle="All Campaigns"
            pageDescription="Overview of all your marketing initiatives."
            pageActions={actions}
            cardTitle="Active Campaigns"
            cardDescription="Click on a campaign to view detailed performance metrics."
            isLoading={loading}
            isEmpty={!loading && campaigns.length === 0}
            emptyState={
                <div className="py-12">
                    <EmptyState
                    title="No campaigns yet"
                    description="Create your first campaign to start tracking influencer collaborations."
                    icon={EmptyStateIcons.folder}
                    action={<CreateCampaignDialog />}
                    />
                </div>
            }
            desktopView={desktopView}
            mobileView={mobileView}
            pagination={
                <TablePagination
                    currentPage={currentPage}
                    totalItems={sortedCampaigns.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            }
        />

      {/* Campaign Timeline */}
      {!loading && campaigns.length > 0 && (
          <CampaignGantt campaigns={campaigns} className="mt-8" />
      )}
    </div>
  );
}

// Wrap with DashboardShell AND DataProvider
export default function CampaignsListPage() {
  return (
    <CampaignsListContent />
  );
}
