"use client";

import { useMemo } from "react";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO, addMonths } from "date-fns";
import { Campaign } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CampaignGanttProps {
    campaigns: Campaign[];
    className?: string;
}

const PLATFORM_COLORS: Record<Campaign["platform"], string> = {
    TikTok: "bg-pink-500",
    Instagram: "bg-purple-500",
};

export function CampaignGantt({ campaigns, className }: CampaignGanttProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Calculate the timeline range (current month +/- 1 month view)
    const timelineStart = startOfMonth(addMonths(currentDate, -1));
    const timelineEnd = endOfMonth(addMonths(currentDate, 1));
    
    const days = useMemo(() => {
        return eachDayOfInterval({ start: timelineStart, end: timelineEnd });
    }, [timelineStart, timelineEnd]);
    
    const totalDays = days.length;
    
    // Filter campaigns that have dates and overlap with timeline
    const visibleCampaigns = useMemo(() => {
        return campaigns.filter(campaign => {
            if (!campaign.startDate || !campaign.endDate) return false;
            const start = parseISO(campaign.startDate);
            const end = parseISO(campaign.endDate);
            // Check if campaign overlaps with timeline
            return (
                isWithinInterval(start, { start: timelineStart, end: timelineEnd }) ||
                isWithinInterval(end, { start: timelineStart, end: timelineEnd }) ||
                (start <= timelineStart && end >= timelineEnd)
            );
        });
    }, [campaigns, timelineStart, timelineEnd]);
    
    const getBarPosition = (campaign: Campaign) => {
        if (!campaign.startDate || !campaign.endDate) return null;
        
        const campaignStart = parseISO(campaign.startDate);
        const campaignEnd = parseISO(campaign.endDate);
        
        // Clamp to timeline bounds
        const visibleStart = campaignStart < timelineStart ? timelineStart : campaignStart;
        const visibleEnd = campaignEnd > timelineEnd ? timelineEnd : campaignEnd;
        
        const startOffset = differenceInDays(visibleStart, timelineStart);
        const duration = differenceInDays(visibleEnd, visibleStart) + 1;
        
        const leftPercent = (startOffset / totalDays) * 100;
        const widthPercent = (duration / totalDays) * 100;
        
        return { left: `${leftPercent}%`, width: `${widthPercent}%` };
    };
    
    const goToPrevMonth = () => setCurrentDate(prev => addMonths(prev, -1));
    const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
    const goToToday = () => setCurrentDate(new Date());
    
    // Group days by month for header
    const months = useMemo(() => {
        const monthMap = new Map<string, { label: string; days: number; startIndex: number }>();
        days.forEach((day, index) => {
            const monthKey = format(day, "yyyy-MM");
            const monthLabel = format(day, "MMMM yyyy");
            if (!monthMap.has(monthKey)) {
                monthMap.set(monthKey, { label: monthLabel, days: 0, startIndex: index });
            }
            monthMap.get(monthKey)!.days++;
        });
        return Array.from(monthMap.values());
    }, [days]);
    
    return (
        <div className={cn("border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-background rounded-lg overflow-hidden", className)}>
            {/* Header with navigation */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black">
                <h3 className="font-bold text-lg">Campaign Timeline</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPrevMonth}
                        className="h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextMonth}
                        className="h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            {/* Timeline header */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Month headers */}
                    <div className="flex border-b border-black">
                        <div className="w-48 shrink-0 p-2 border-r-2 border-black bg-muted font-bold text-sm">
                            Campaign
                        </div>
                        <div className="flex-1 flex">
                            {months.map((month, idx) => (
                                <div
                                    key={idx}
                                    className="text-center text-sm font-medium p-1 border-r border-dashed border-slate-300"
                                    style={{ width: `${(month.days / totalDays) * 100}%` }}
                                >
                                    {month.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Day markers (show every 7th day) */}
                    <div className="flex border-b border-black">
                        <div className="w-48 shrink-0 p-1 border-r-2 border-black bg-muted text-xs text-muted-foreground">
                            Status / Platform
                        </div>
                        <div className="flex-1 flex relative">
                            {days.map((day, idx) => {
                                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                                const showLabel = idx % 7 === 0 || isToday;
                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "text-center text-[10px]",
                                            isToday && "bg-yellow-100 font-bold"
                                        )}
                                        style={{ width: `${100 / totalDays}%` }}
                                    >
                                        {showLabel && format(day, "d")}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Campaign rows */}
                    {visibleCampaigns.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No campaigns with dates in this time range.
                        </div>
                    ) : (
                        visibleCampaigns.map((campaign) => {
                            const barPosition = getBarPosition(campaign);
                            return (
                                <div key={campaign.id} className="flex border-b border-slate-200 hover:bg-muted/50">
                                    {/* Campaign info */}
                                    <div className="w-48 shrink-0 p-2 border-r-2 border-black">
                                        <div className="font-medium text-sm truncate">{campaign.name}</div>
                                        <div className="flex gap-1 mt-1">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                {campaign.status}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                {campaign.platform}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    {/* Gantt bar */}
                                    <div className="flex-1 relative h-16">
                                        {/* Today marker */}
                                        {days.some(d => format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")) && (
                                            <div
                                                className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                                                style={{
                                                    left: `${(differenceInDays(new Date(), timelineStart) / totalDays) * 100}%`
                                                }}
                                            />
                                        )}
                                        
                                        {barPosition && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div
                                                            className={cn(
                                                                "absolute top-3 h-10 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center px-2 cursor-pointer hover:opacity-80 transition-opacity",
                                                                PLATFORM_COLORS[campaign.platform]
                                                            )}
                                                            style={{
                                                                left: barPosition.left,
                                                                width: barPosition.width,
                                                                minWidth: "40px"
                                                            }}
                                                        >
                                                            <span className="text-white text-xs font-medium truncate">
                                                                {differenceInDays(
                                                                    parseISO(campaign.endDate!),
                                                                    parseISO(campaign.startDate!)
                                                                ) + 1}d
                                                            </span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                        <div className="text-sm">
                                                            <p className="font-bold">{campaign.name}</p>
                                                            <p className="text-muted-foreground">
                                                                {format(parseISO(campaign.startDate!), "MMM d")} - {format(parseISO(campaign.endDate!), "MMM d, yyyy")}
                                                            </p>
                                                            <p>Budget: ${campaign.budget.toLocaleString()}</p>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Legend */}
            <div className="p-3 border-t-2 border-black bg-muted flex items-center gap-4 text-xs">
                <span className="font-bold">Legend:</span>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-pink-500 border border-black rounded-sm" />
                    <span>TikTok</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 border border-black rounded-sm" />
                    <span>Instagram</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-px h-3 bg-red-500" />
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
}
