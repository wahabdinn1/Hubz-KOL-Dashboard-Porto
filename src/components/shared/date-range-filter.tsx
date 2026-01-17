"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/retroui/Calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangeFilterProps { 
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    className?: string;
}

const presets = [
    { label: "7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: "30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
    { label: "Last Month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { label: "3 Months", getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
];

export function DateRangeFilter({
    dateRange,
    onDateRangeChange,
    className,
}: DateRangeFilterProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                    {format(dateRange.to, "MMM d, yyyy")}
                                </>
                            ) : (
                                format(dateRange.from, "MMM d, yyyy")
                            )
                        ) : (
                            <span>All time</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" align="start">
                    <div className="flex flex-col sm:flex-row">
                        {/* Presets */}
                        <div className="border-b border-border sm:border-b-0 sm:border-r p-2 flex flex-col gap-1 w-full sm:w-[120px]">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 px-2">Quick Select</p>
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs h-7 px-2"
                                    onClick={() => onDateRangeChange(preset.getValue())}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                            <div className="border-t border-border my-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => onDateRangeChange(undefined)}
                            >
                                Reset
                            </Button>
                        </div>
                        {/* Calendar */}
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={onDateRangeChange}
                            numberOfMonths={1}
                        />
                    </div>
                </PopoverContent>
            </Popover>
            {dateRange && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDateRangeChange(undefined)}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
