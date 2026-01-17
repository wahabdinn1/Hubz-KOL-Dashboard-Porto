"use client";

import { Skeleton, SkeletonTable, SkeletonCard, SkeletonAvatar } from "@/components/retroui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Page-level loading skeletons using RetroUI components
 */

interface PageLoadingProps {
    className?: string;
}

// Stats cards skeleton (for dashboard/finance)
export function PageLoadingStats({ className }: PageLoadingProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-3 w-20" variant="text" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// Cards grid skeleton (for campaigns, KOLs grid view)
export function PageLoadingCards({ count = 6, className }: PageLoadingProps & { count?: number }) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <SkeletonCard />
                </Card>
            ))}
        </div>
    );
}

// Table skeleton (for invoices, KOLs list view)
export function PageLoadingTable({ rows = 5, className }: PageLoadingProps & { rows?: number }) {
    return (
        <Card className={cn("border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)}>
            <CardContent className="p-4">
                <SkeletonTable rows={rows} />
            </CardContent>
        </Card>
    );
}

// Profile loading (for KOL detail, user profile)
export function PageLoadingProfile({ className }: PageLoadingProps) {
    return (
        <Card className={cn("border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)}>
            <CardContent className="p-6">
                <div className="flex items-start gap-6">
                    <SkeletonAvatar size="lg" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" variant="text" />
                        <Skeleton className="h-4 w-full" variant="text" />
                        <Skeleton className="h-4 w-3/4" variant="text" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Kanban board skeleton (for campaign tasks)
export function PageLoadingKanban({ columns = 4, className }: PageLoadingProps & { columns?: number }) {
    return (
        <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
            {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className="min-w-[280px] flex-shrink-0">
                    <div className="bg-muted/50 rounded-lg border-2 border-black p-4 space-y-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Combined page header + content skeleton
export function PageLoadingFull({ 
    showStats = false, 
    showTable = false, 
    showCards = false,
    className 
}: PageLoadingProps & { 
    showStats?: boolean; 
    showTable?: boolean; 
    showCards?: boolean;
}) {
    return (
        <div className={cn("space-y-6", className)}>
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" variant="text" />
            </div>
            
            {showStats && <PageLoadingStats />}
            {showCards && <PageLoadingCards />}
            {showTable && <PageLoadingTable />}
        </div>
    );
}
