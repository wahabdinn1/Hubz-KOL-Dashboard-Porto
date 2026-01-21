"use client";

import { useData } from "@/context/data-context";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/utils";
import { AddKOLDialog } from "@/components/kols/add-kol-dialog";
import { EditKOLDialog } from "@/components/kols/edit-kol-dialog";
import { DeleteKOLDialog } from "@/components/kols/delete-kol-dialog";
import { exportToCSV, KOL_EXPORT_COLUMNS } from "@/lib/export-utils";
import { CompareToolDialog } from "@/components/campaigns/compare-tool-dialog";
import { BulkImportDialog } from "@/components/kols/bulk-import-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useRouter } from "next/navigation";

import { ArrowUpDown, Download } from "lucide-react";
import { Select } from "@/components/retroui/Select";
import { useState, useMemo } from "react";
import { EmptyState, EmptyStateIcons } from "@/components/retroui/EmptyState";
import { TablePagination } from "@/components/shared/table-pagination";
import { DataView } from "@/components/shared/data-view";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function InfluencersContent() {
    const { kols, campaigns, deleteKOLs, loading } = useData();
    const router = useRouter();
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filterTier, setFilterTier] = useState<string | null>(null);
    const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
    const [filterFollowers, setFilterFollowers] = useState<string | null>(null);

    // Bulk Actions State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Calculate Status Metrics
    const statusMetrics = useMemo(() => {
        const counts: Record<string, number> = {
            'TO_CONTACT': 0, 'NEGOTIATING': 0, 'IN_PROGRESS': 0,
            'SUBMITTED': 0, 'POSTED': 0, 'COMPLETED': 0
        };

        campaigns.forEach(c => {
            c.deliverables.forEach(d => {
                if (d.status && counts[d.status] !== undefined) {
                    counts[d.status]++;
                } else {
                    counts['TO_CONTACT']++;
                }
            });
        });
        return counts;
    }, [campaigns]);


    const filteredKols = kols.filter(kol => {
        // 1. Tier Filter
        if (filterTier) {
            let calculatedTier = "Nano-Tier";
            if ((kol.followers || 0) >= 1000000) calculatedTier = "Mega-Tier";
            else if ((kol.followers || 0) >= 100000) calculatedTier = "Macro-Tier";
            else if ((kol.followers || 0) >= 10000) calculatedTier = "Micro-Tier";

            if (calculatedTier !== filterTier) return false;
        }

        // 2. Platform Filter
        if (filterPlatform) {
            if (filterPlatform === 'TikTok' && !kol.tiktokUsername) return false;
            if (filterPlatform === 'Instagram' && !kol.instagramUsername) return false;
        }

        // 3. Followers Filter
        if (filterFollowers) {
            const count = kol.followers || 0;
            if (filterFollowers === '< 10k' && count >= 10000) return false;
            if (filterFollowers === '10k - 100k' && (count < 10000 || count >= 100000)) return false;
            if (filterFollowers === '100k - 1M' && (count < 100000 || count >= 1000000)) return false;
            if (filterFollowers === '1M+' && count < 1000000) return false;
        }

        return true;
    });

    const sortedKols = [...filteredKols].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: string | number = (a as unknown as Record<string, string | number>)[key] ?? 0;
        let bValue: string | number = (b as unknown as Record<string, string | number>)[key] ?? 0;

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

    // Paginated data
    const paginatedKols = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedKols.slice(startIndex, startIndex + pageSize);
    }, [sortedKols, currentPage, pageSize]);

    // Reset page when filters change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Bulk Delete Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredKols.map(k => k.id));
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} influencers? This action cannot be undone.`)) return;

        await deleteKOLs(selectedIds);
        setSelectedIds([]);
    }

    const filters = (
        <>
            {/* Pipeline Snapshot - scrollable on mobile */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
                <div className="grid grid-cols-6 gap-2 mb-4 min-w-[500px]">
                    {Object.entries(statusMetrics).map(([status, count]) => {
                        const statusDescriptions: Record<string, string> = {
                            'TO_CONTACT': 'KOLs not yet reached out to',
                            'NEGOTIATING': 'In discussion about rates/terms',
                            'IN_PROGRESS': 'Content creation underway',
                            'SUBMITTED': 'Content submitted for review',
                            'POSTED': 'Content published live',
                            'COMPLETED': 'Campaign deliverables finished'
                        };
                        return (
                            <TooltipProvider key={status} delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="bg-muted/30 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-3 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-help">
                                            <span className="text-2xl font-bold">{count}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                                {status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">{statusDescriptions[status] || status}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </div>
            </div>
        </>
    );

    const cardActions = (
        <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="h-8 text-xs animate-in zoom-in"
                >
                    Delete ({selectedIds.length})
                </Button>
            )}

            {/* Export Button */}
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportToCSV(sortedKols, `influencers-${new Date().toISOString().slice(0, 10)}`, KOL_EXPORT_COLUMNS)}
                            className="h-8 text-xs"
                        >
                            <Download className="h-3 w-3 mr-1" />
                            Export CSV
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Download all influencer data as spreadsheet</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* Compare Tool */}
            <CompareToolDialog />

            {/* Bulk Import */}
            <BulkImportDialog />

            {/* Tier Filter */}
            <Select
                value={filterTier || "all"}
                onValueChange={(val) => setFilterTier(val === "all" ? null : val)}
            >
                <Select.Trigger className="w-[140px] h-8 bg-background">
                    <Select.Value placeholder="All Tiers" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="all">All Tiers</Select.Item>
                    {['Nano-Tier', 'Micro-Tier', 'Macro-Tier', 'Mega-Tier'].map((tier) => (
                        <Select.Item key={tier} value={tier}>
                            {tier}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select>

            {/* Platform Filter */}
            <Select
                value={filterPlatform || "all"}
                onValueChange={(val) => setFilterPlatform(val === "all" ? null : val)}
            >
                <Select.Trigger className="w-[150px] h-8 bg-background">
                    <Select.Value placeholder="Any Platform" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="all">Any Platform</Select.Item>
                    <Select.Item value="TikTok">TikTok</Select.Item>
                    <Select.Item value="Instagram">Instagram</Select.Item>
                </Select.Content>
            </Select>

            {/* Followers Filter */}
            <Select
                value={filterFollowers || "all"}
                onValueChange={(val) => setFilterFollowers(val === "all" ? null : val)}
            >
                <Select.Trigger className="w-[160px] h-8 bg-background">
                    <Select.Value placeholder="Any Followers" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Item value="all">Any Range</Select.Item>
                    <Select.Item value="< 10k">&lt; 10k</Select.Item>
                    <Select.Item value="10k - 100k">10k - 100k</Select.Item>
                    <Select.Item value="100k - 1M">100k - 1M</Select.Item>
                    <Select.Item value="1M+">1M+</Select.Item>
                </Select.Content>
            </Select>

            {/* Reset Button */}
            {(filterTier || filterPlatform || filterFollowers) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setFilterTier(null);
                        setFilterPlatform(null);
                        setFilterFollowers(null);
                    }}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                >
                    Reset
                </Button>
            )}
        </div>
    );

    const mobileView = (
        <>
            {paginatedKols.map((kol) => (
                <div 
                    key={kol.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/influencers/${kol.id}`)}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10 border-2 border-black">
                            <AvatarImage src={kol.avatar} alt={kol.name} />
                            <AvatarFallback>{kol.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{kol.name}</p>
                            <p className="text-sm text-muted-foreground truncate">@{kol.tiktokUsername || kol.instagramUsername}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">{kol.category}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Followers: {formatCompactNumber(kol.followers || 0)}</div>
                        <div>Type: {kol.type}</div>
                        <div>TikTok: {formatIDR(kol.rateCardTiktok || 0)}</div>
                        <div>Reels: {formatIDR(kol.rateCardReels || 0)}</div>
                    </div>
                </div>
            ))}
        </>
    );

    const desktopView = (
        <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                    <TableHead className="w-[40px]">
                        <input
                            type="checkbox"
                            className="translate-y-[2px]"
                            checked={selectedIds.length === filteredKols.length && filteredKols.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                    </TableHead>
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
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger className="cursor-pointer">Campaigns <ArrowUpDown className="inline ml-1 h-3 w-3" /></TooltipTrigger>
                                <TooltipContent><p className="text-xs">Number of campaigns this KOL is part of</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('rateCardTiktok')}>
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger className="cursor-pointer">Rate TikTok <ArrowUpDown className="inline ml-1 h-3 w-3" /></TooltipTrigger>
                                <TooltipContent><p className="text-xs">Cost per TikTok video (IDR)</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-black dark:hover:text-white" onClick={() => requestSort('rateCardReels')}>
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger className="cursor-pointer">Rate Reels <ArrowUpDown className="inline ml-1 h-3 w-3" /></TooltipTrigger>
                                <TooltipContent><p className="text-xs">Cost per Instagram Reels (IDR)</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedKols.map((kol) => {
                    // Find campaigns this KOL is part of
                    const memberCampaigns = campaigns.filter(c =>
                        c.deliverables.some(d => d.kolId === kol.id)
                    );
                    const isSelected = selectedIds.includes(kol.id);

                    return (
                        <TableRow
                            key={kol.id}
                            className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-muted' : ''}`}
                            onClick={() => router.push(`/influencers/${kol.id}`)}
                        >
                            <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="translate-y-[2px]"
                                    checked={isSelected}
                                    onChange={(e) => handleSelectRow(kol.id, e.target.checked)}
                                />
                            </TableCell>
                            <TableCell className="font-medium">

                                <div className="flex items-center gap-3">
                                    <Avatar key={kol.avatar} className="h-10 w-10 border border-black shadow-sm">
                                        <AvatarImage src={kol.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.id}`} />
                                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                                            {kol.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{kol.tiktokUsername || kol.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(kol.followers || 0) >= 1000000 ? "Mega-Tier" :
                                                (kol.followers || 0) >= 100000 ? "Macro-Tier" :
                                                    (kol.followers || 0) >= 10000 ? "Micro-Tier" : "Nano-Tier"}
                                        </span>
                                    </div>
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
                                    <span>{formatCompactNumber(kol.followers || 0)}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-xs">
                                    <span>{formatCompactNumber(kol.instagramFollowers || 0)}</span>
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
    );

    return (
        <DataView
            pageTitle="Influencer Directory"
            pageDescription="Manage your roster of Key Opinion Leaders."
            pageActions={<AddKOLDialog enableAutoLink={false} />}
            filters={filters}
            cardTitle="All Influencers"
            cardActions={cardActions}
            isLoading={loading}
            isEmpty={!loading && kols.length === 0}
            emptyState={
                 <div className="py-12">
                    <EmptyState
                        title="No influencers yet"
                        description="Start building your influencer roster by adding your first Key Opinion Leader."
                        icon={EmptyStateIcons.users}
                        action={<AddKOLDialog enableAutoLink={false} />}
                    />
                </div>
            }
            desktopView={desktopView}
            mobileView={mobileView}
            pagination={
                <TablePagination
                    currentPage={currentPage}
                    totalItems={sortedKols.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            }
        />
    );
}

export default function InfluencersPage() {
    return (
        <InfluencersContent />
    );
}
