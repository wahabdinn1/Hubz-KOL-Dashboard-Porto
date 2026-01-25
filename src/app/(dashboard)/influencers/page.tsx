"use client";

import { useData } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { AddKOLDialog } from "@/components/kols/add-kol-dialog";
import { exportToCSV, KOL_EXPORT_COLUMNS } from "@/lib/export-utils";
import { CompareToolDialog } from "@/components/campaigns/compare-tool-dialog";
import { BulkImportDialog } from "@/components/kols/bulk-import-dialog";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Select } from "@/components/retroui/Select";
import { useState, useMemo } from "react";
import { EmptyState, EmptyStateIcons } from "@/components/retroui/EmptyState";
import { DataView } from "@/components/shared/data-view";
import { KOL } from "@/types";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    RowSelectionState,
    Row,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
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

function InfluencersContent() {
    const { kols, deleteKOLs, loading } = useData();
    const router = useRouter();

    // TanStack Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [globalFilter, setGlobalFilter] = useState("");

    // Filter States
    const [filterTier, setFilterTier] = useState<string | null>(null);
    const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

    // Calculate Status Metrics


    // Filtered Data
    const filteredKols = useMemo(() => {
        return kols.filter(kol => {
            // Tier Filter
            if (filterTier) {
                const tier = getTier(kol.followers || 0);
                if (tier !== filterTier) return false;
            }

            // Platform Filter
            if (filterPlatform) {
                if (filterPlatform === "TikTok" && !kol.tiktokUsername) return false;
                if (filterPlatform === "Instagram" && !kol.instagramUsername) return false;
            }

            return true;
        });
    }, [kols, filterTier, filterPlatform]);

    // Column Definitions
    const columns: ColumnDef<KOL>[] = useMemo(() => [
        // Selection Column
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
        // Socials Column
        {
            id: "socials",
            header: "Socials",
            cell: ({ row }) => {
                const kol = row.original;
                return (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                );
            },
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
    ], []);

    // Custom filter function for multi-field search
    // Custom filter function for multi-field search
    const globalFilterFn = (row: Row<KOL>, columnId: string, filterValue: string) => {
        const search = filterValue.toLowerCase();
        const kol = row.original;
        
        return (
            (kol.name || "").toLowerCase().includes(search) ||
            (kol.tiktokUsername || "").toLowerCase().includes(search) ||
            (kol.instagramUsername || "").toLowerCase().includes(search)
        );
    };

    // TanStack Table Instance
    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: filteredKols,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: globalFilterFn,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    // Get selected KOL IDs
    const selectedIds = Object.keys(rowSelection).map(idx => filteredKols[parseInt(idx)]?.id).filter(Boolean);

    // Bulk delete handler
    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} influencers? This action cannot be undone.`)) return;
        await deleteKOLs(selectedIds);
        setRowSelection({});
    };

    // Mobile Card View
    const mobileView = (
        <div className="space-y-4 p-4">
            {filteredKols.length === 0 ? (
                <EmptyState
                    icon={EmptyStateIcons.users}
                    title="No influencers yet"
                    description="Add your first influencer to get started"
                    action={<AddKOLDialog enableAutoLink={false} />}
                />
            ) : (
                filteredKols.slice(0, 20).map((kol) => (
                    <div
                        key={kol.id}
                        className="p-4 border-2 border-black rounded-lg bg-white dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                        onClick={() => router.push(`/influencers/${kol.id}`)}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-black">
                                <AvatarImage src={kol.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.id}`} />
                                <AvatarFallback>{kol.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="font-bold">{kol.tiktokUsername || kol.name}</div>
                                <div className="text-sm text-muted-foreground">{getTier(kol.followers || 0)}</div>
                            </div>
                            <Badge className={`${getCollaborationBadgeClass(kol.collaborationType || 'PAID')} font-medium`}>
                                {kol.collaborationType || 'PAID'}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div>TikTok: {formatCompactNumber(kol.tiktokFollowers || 0)}</div>
                            <div>IG: {formatCompactNumber(kol.instagramFollowers || 0)}</div>
                            <div>Rate TT: {formatIDR(kol.rateCardTiktok || 0)}</div>
                            <div>Rate IG: {formatIDR(kol.rateCardReels || 0)}</div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    // Desktop Table View with TanStack Table
    const desktopView = (
        <div className="space-y-4">
            {/* Search - Positioned above table */}
            <div className="flex items-center justify-between pb-4">
                 <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search influencers..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border-2 border-slate-200 dark:border-slate-800 overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => router.push(`/influencers/${row.original.id}`)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No influencers found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-center px-2 gap-8 py-4">
                <div className="flex items-center text-sm text-slate-500 font-medium">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredKols.length)} of {filteredKols.length}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center justify-center text-sm font-medium min-w-[50px]">
                        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                    </div>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <Select.Trigger className="h-8 w-[50px] min-w-[50px] px-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-slate-950 rounded-md">
                            <Select.Value placeholder={table.getState().pagination.pageSize} />
                        </Select.Trigger>
                        <Select.Content side="top" className="rounded-md border-2 border-black shadow-none min-w-[100px]">
                            {[10, 20, 50, 100].map((pageSize) => (
                                <Select.Item key={pageSize} value={`${pageSize}`} className="rounded-sm my-1 cursor-pointer justify-center px-1">
                                    {pageSize}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select>
                    <p className="text-sm font-medium text-slate-500">per page</p>
                </div>
            </div>
        </div>
    );

    return (
        <DataView
            pageTitle="Influencer Directory"
            pageDescription="Manage your roster of Key Opinion Leaders."
            pageActions={<AddKOLDialog enableAutoLink={false} />}
            cardTitle="All Influencers"
            cardActions={
                <div className="flex flex-wrap items-center gap-3">
                    {/* Bulk Delete Button - Appears left of Export */}
                    {selectedIds.length > 0 && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleBulkDelete}
                            className="h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
                        >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete ({selectedIds.length})
                        </Button>
                    )}

                     <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => exportToCSV(filteredKols, `influencers-${new Date().toISOString().slice(0, 10)}`, KOL_EXPORT_COLUMNS)}
                    >
                        <Download className="h-3 w-3 mr-2" />
                        Export CSV
                    </Button>
                    <CompareToolDialog />
                    <BulkImportDialog />
                    
                    {/* Filters separated with extra gap */}
                    <div className="w-[150px] ml-2">
                        <Select
                            value={filterTier || "all"}
                            onValueChange={(val: string) => setFilterTier(val === "all" ? null : val)}
                        >
                            <Select.Trigger className="w-full h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all bg-white dark:bg-slate-950 rounded-md">
                                <Select.Value placeholder="All Tiers" />
                            </Select.Trigger>
                            <Select.Content className="rounded-md border-2 border-black shadow-none">
                                <Select.Item value="all" className="rounded-sm my-1 cursor-pointer">All Tiers</Select.Item>
                                <Select.Item value="Mega-Tier" className="rounded-sm my-1 cursor-pointer">Mega-Tier</Select.Item>
                                <Select.Item value="Macro-Tier" className="rounded-sm my-1 cursor-pointer">Macro-Tier</Select.Item>
                                <Select.Item value="Micro-Tier" className="rounded-sm my-1 cursor-pointer">Micro-Tier</Select.Item>
                                <Select.Item value="Nano-Tier" className="rounded-sm my-1 cursor-pointer">Nano-Tier</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                    <div className="w-[150px]">
                        <Select
                            value={filterPlatform || "all"}
                            onValueChange={(val: string) => setFilterPlatform(val === "all" ? null : val)}
                        >
                            <Select.Trigger className="w-full h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all bg-white dark:bg-slate-950 rounded-md">
                                <Select.Value placeholder="All Platforms" />
                            </Select.Trigger>
                            <Select.Content className="rounded-md border-2 border-black shadow-none">
                                <Select.Item value="all" className="rounded-sm my-1 cursor-pointer">All Platforms</Select.Item>
                                <Select.Item value="TikTok" className="rounded-sm my-1 cursor-pointer">TikTok</Select.Item>
                                <Select.Item value="Instagram" className="rounded-sm my-1 cursor-pointer">Instagram</Select.Item>
                            </Select.Content>
                        </Select>
                    </div>
                </div>
            }
            mobileView={mobileView}
            desktopView={desktopView}
            isLoading={loading}
        />
    );
}

export default function InfluencersPage() {
    return (
        <InfluencersContent />
    );
}
