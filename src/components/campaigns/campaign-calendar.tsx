"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Campaign } from "@/lib/static-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CampaignCalendarProps {
    campaigns: Campaign[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export function CampaignCalendar({ campaigns }: CampaignCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Get first day and number of days in month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    // Navigate months
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    // Get campaigns for a specific date
    const getCampaignsForDate = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return campaigns.filter((c) => {
            const start = c.startDate?.split("T")[0];
            const end = c.endDate?.split("T")[0];
            if (!start) return false;
            // Simple check: is date between start and end?
            return dateStr >= start && (!end || dateStr <= end);
        });
    };

    // Generate calendar days
    const calendarDays = [];
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return (
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="pb-4 border-b-2 border-black">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Campaign Calendar</CardTitle>
                        <CardDescription>Visual timeline of your active marketing campaigns.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={prevMonth} 
                            className="h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[140px] text-center text-lg">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={nextMonth} 
                            className="h-8 w-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b-2 border-black bg-muted">
                    {DAYS.map((day) => (
                        <div key={day} className="text-center text-xs font-bold text-foreground py-3 border-r-2 border-black last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 auto-rows-[1fr]">
                    {calendarDays.map((date, idx) => {
                        if (!date) {
                            return <div key={`empty-${idx}`} className="min-h-[120px] bg-muted/20 border-b border-black border-r border-black last:border-r-0" />;
                        }

                        const dayCampaigns = getCampaignsForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate?.toDateString() === date.toDateString();

                        return (
                            <div
                                key={date.toISOString()}
                                className={cn(
                                    "min-h-[120px] border-b border-black border-r border-black last:border-r-0 p-1 relative group transition-colors",
                                    isToday ? "bg-yellow-50 dark:bg-yellow-900/20" : "hover:bg-muted/50",
                                    isSelected && "ring-2 ring-black ring-inset z-10"
                                )}
                                onClick={() => setSelectedDate(date)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={cn(
                                        "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-sm border border-transparent",
                                        isToday ? "bg-yellow-400 text-black border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" : "text-muted-foreground",
                                        isSelected && !isToday && "bg-black text-white"
                                    )}>
                                        {date.getDate()}
                                    </span>
                                </div>

                                {/* Campaign Bars */}
                                <div className="flex flex-col gap-1">
                                    {dayCampaigns.slice(0, 3).map((c) => (
                                        <Link key={c.id} href={`/campaigns/${c.id}`} onClick={(e) => e.stopPropagation()}>
                                            <div className={cn(
                                                "text-[10px] truncate px-1.5 py-0.5 rounded-sm font-medium border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-[1px] cursor-pointer",
                                                c.platform === 'Instagram'
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-pink-500 text-white"
                                            )}>
                                                {c.name}
                                            </div>
                                        </Link>
                                    ))}
                                    {dayCampaigns.length > 3 && (
                                        <div className="text-[10px] text-muted-foreground pl-1 font-bold">
                                            +{dayCampaigns.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
