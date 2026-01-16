"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    hideOnMobile?: boolean;
}

interface Action<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: "default" | "destructive";
}

interface ResponsiveTableProps<T extends { id: string }> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    cardTitle?: (item: T) => React.ReactNode;
    cardSubtitle?: (item: T) => React.ReactNode;
    cardBadges?: (item: T) => React.ReactNode;
}

export function ResponsiveTable<T extends { id: string }>({
    data,
    columns,
    actions,
    onRowClick,
    emptyMessage = "No data available",
    cardTitle,
    cardSubtitle,
    cardBadges,
}: ResponsiveTableProps<T>) {
    const getValue = (item: T, key: string): string | number | React.ReactNode => {
        const column = columns.find((c) => c.key === key);
        if (column?.render) {
            return column.render(item);
        }
        const keys = key.split(".");
        let value: unknown = item;
        for (const k of keys) {
            value = (value as Record<string, unknown>)?.[k];
        }
        return value as string | number;
    };

    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground text-sm">
                {emptyMessage}
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={String(col.key)}
                                    className={cn(
                                        "text-left font-medium text-muted-foreground p-3",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {actions && actions.length > 0 && (
                                <th className="text-right font-medium text-muted-foreground p-3 w-12">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                className={cn(
                                    "border-b hover:bg-muted/50 transition-colors",
                                    onRowClick && "cursor-pointer"
                                )}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((col) => (
                                    <td key={String(col.key)} className={cn("p-3", col.className)}>
                                        {col.render ? col.render(item) : getValue(item, String(col.key))}
                                    </td>
                                ))}
                                {actions && actions.length > 0 && (
                                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {actions.map((action, idx) => (
                                                    <DropdownMenuItem
                                                        key={idx}
                                                        onClick={() => action.onClick(item)}
                                                        className={cn(
                                                            action.variant === "destructive" && "text-red-600"
                                                        )}
                                                    >
                                                        {action.icon}
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {data.map((item) => (
                    <Card
                        key={item.id}
                        className={cn(
                            "border-2",
                            onRowClick && "cursor-pointer hover:border-primary/50 transition-colors"
                        )}
                        onClick={() => onRowClick?.(item)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Title */}
                                    {cardTitle && (
                                        <div className="font-semibold text-sm truncate">
                                            {cardTitle(item)}
                                        </div>
                                    )}
                                    {/* Subtitle */}
                                    {cardSubtitle && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {cardSubtitle(item)}
                                        </div>
                                    )}
                                    {/* Badges */}
                                    {cardBadges && (
                                        <div className="flex flex-wrap gap-1 mt-2">{cardBadges(item)}</div>
                                    )}
                                </div>

                                {/* Actions */}
                                {actions && actions.length > 0 && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {actions.map((action, idx) => (
                                                    <DropdownMenuItem
                                                        key={idx}
                                                        onClick={() => action.onClick(item)}
                                                        className={cn(
                                                            action.variant === "destructive" && "text-red-600"
                                                        )}
                                                    >
                                                        {action.icon}
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                                {columns
                                    .filter((col) => !col.hideOnMobile)
                                    .slice(0, 4)
                                    .map((col) => (
                                        <div key={String(col.key)}>
                                            <div className="text-[10px] uppercase text-muted-foreground font-medium">
                                                {col.header}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {col.render ? col.render(item) : getValue(item, String(col.key))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
