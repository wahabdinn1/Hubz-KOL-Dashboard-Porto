"use client";

import { CampaignCalendar } from "@/components/campaigns/campaign-calendar";
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog";
import { useData } from "@/context/data-context";

export default function CalendarPage() {
    const { campaigns } = useData();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Campaign Calendar
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Visual timeline of all your active campaigns.
                    </p>
                </div>
                <CreateCampaignDialog />
            </div>

            <div className="p-1">
                <CampaignCalendar campaigns={campaigns} />
            </div>
        </div>
    );
}
