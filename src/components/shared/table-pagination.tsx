"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Select } from "@/components/retroui/Select";

interface TablePaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

export function TablePagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
}: TablePaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 px-4 border-t">
            {/* Items info */}
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalItems}</span>
            </div>

            {/* Page navigation - centered */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={!canGoPrevious}
                    className="h-8 px-2"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoPrevious}
                    className="h-8 px-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 px-2 min-w-[80px] justify-center">
                    <span className="text-sm font-medium">{currentPage}</span>
                    <span className="text-sm text-muted-foreground">/</span>
                    <span className="text-sm font-medium">{totalPages || 1}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoNext}
                    className="h-8 px-2"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canGoNext}
                    className="h-8 px-2"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Page size selector */}
            <div className="flex items-center gap-2 order-3">
                <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => onPageSizeChange(Number(val))}
                >
                    <Select.Trigger className="w-fit min-w-[3.5rem] h-8 bg-background text-xs px-2">
                        <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                        {pageSizeOptions.map((size) => (
                            <Select.Item key={size} value={size.toString()}>
                                {size}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select>
                <span className="text-xs text-muted-foreground">per page</span>
            </div>
        </div>
    );
}

/**
 * Hook for managing pagination state
 */
export function usePagination(totalItems: number, defaultPageSize = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const totalPages = Math.ceil(totalItems / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Calculate paginated items indices
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
        currentPage,
        pageSize,
        totalPages,
        startIndex,
        endIndex,
        handlePageChange,
        handlePageSizeChange,
    };
}
