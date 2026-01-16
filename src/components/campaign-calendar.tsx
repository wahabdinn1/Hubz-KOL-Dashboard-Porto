"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

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
            if (dateStr === start) return true;
            if (end && dateStr >= start && dateStr <= end) return true;
            return false;
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

    // Get selected date campaigns
    const selectedCampaigns = selectedDate ? getCampaignsForDate(selectedDate) : [];

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Campaign Calendar</CardTitle>
                        <CardDescription>View campaign schedules</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, idx) => {
                        if (!date) {
                            return <div key={`empty-${idx}`} className="h-10" />;
                        }

                        const dayCampaigns = getCampaignsForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = selectedDate?.toDateString() === date.toDateString();

                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "h-10 rounded-md text-sm relative transition-colors",
                                    "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                                    isToday && "bg-primary/10 font-bold",
                                    isSelected && "bg-primary text-primary-foreground",
                                    dayCampaigns.length > 0 && !isSelected && "border-2 border-primary"
                                )}
                            >
                                {date.getDate()}
                                {dayCampaigns.length > 0 && (
                                    <span className={cn(
                                        "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                                        isSelected ? "bg-primary-foreground" : "bg-primary"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Selected date campaigns */}
                {selectedDate && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">
                            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </h4>
                        {selectedCampaigns.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No campaigns on this date</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedCampaigns.map((campaign) => (
                                    <Link
                                        key={campaign.id}
                                        href={`/campaigns/${campaign.id}`}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors border"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{campaign.name}</p>
                                            <div className="flex gap-1 mt-1">
                                                <Badge variant="outline" className="text-[10px] h-4">{campaign.platform}</Badge>
                                                <Badge variant="secondary" className="text-[10px] h-4">{campaign.status}</Badge>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
