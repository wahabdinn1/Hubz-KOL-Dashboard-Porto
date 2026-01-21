import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DataViewProps {
    pageTitle?: string;
    pageDescription?: string;
    pageActions?: React.ReactNode;
    filters?: React.ReactNode;
    cardTitle?: string;
    cardDescription?: string;
    cardActions?: React.ReactNode;
    desktopView: React.ReactNode;
    mobileView: React.ReactNode;
    pagination?: React.ReactNode;
    isLoading?: boolean;
    isEmpty?: boolean;
    emptyState?: React.ReactNode;
}

export function DataView({
    pageTitle,
    pageDescription,
    pageActions,
    filters,
    cardTitle,
    cardDescription,
    cardActions,
    desktopView,
    mobileView,
    pagination,
    isLoading,
    isEmpty,
    emptyState
}: DataViewProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <div className="h-8 w-48 animate-pulse bg-muted rounded" />
                    <div className="h-8 w-24 animate-pulse bg-muted rounded" />
                </div>
                <Card>
                    <CardHeader>
                        <div className="h-6 w-32 animate-pulse bg-muted rounded mb-2" />
                        <div className="h-4 w-64 animate-pulse bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                             <div className="h-12 w-full animate-pulse bg-muted rounded" />
                             <div className="h-12 w-full animate-pulse bg-muted rounded" />
                             <div className="h-12 w-full animate-pulse bg-muted rounded" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            {(pageTitle || pageActions) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {pageTitle && <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>}
                        {pageDescription && <p className="text-muted-foreground">{pageDescription}</p>}
                    </div>
                    {pageActions && <div className="flex flex-wrap items-center gap-2">{pageActions}</div>}
                </div>
            )}

            {/* Filters */}
            {filters}

            <Card>
                {(cardTitle || cardDescription || cardActions) && (
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                             {cardTitle && <CardTitle className="text-base font-semibold">{cardTitle}</CardTitle>}
                             {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
                        </div>
                        {cardActions && <div className="flex items-center gap-2">{cardActions}</div>}
                    </CardHeader>
                )}
               
                <CardContent className="p-0">
                    {isEmpty && emptyState ? (
                        emptyState
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y border-b border-t">
                                {mobileView}
                            </div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <div className="min-w-[800px]">
                                    {desktopView}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
                {pagination}
            </Card>
        </div>
    );
}
