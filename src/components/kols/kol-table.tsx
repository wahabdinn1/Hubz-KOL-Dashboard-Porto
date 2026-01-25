"use client";

import { useMemo } from "react";
import {
    calculateER,
    calculateCPM,
    calculateEfficiencyScore,
} from "@/lib/analytics";
import { useData } from "@/context/data-context";
import { DataTable } from "@/components/ui/data-table";
import { columns, KOLTableItem } from "@/components/kols/kol-table-columns";

export function KOLTable() {
    const { kols, campaign } = useData();

    const data = useMemo(() => {
        return campaign.deliverables.map((del) => {
            const kol = kols.find((k) => k.id === del.kolId);
            if (!kol) return null;
            const er = calculateER(del.totalEngagements, del.totalViews);

            // Calculate Cost based on Campaign Platform
            const rate = campaign.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
            const realCost = rate * del.videosCount; // Total cost for calculations
            const displayRate = rate; // Unit rate for display

            const cpm = calculateCPM(realCost, del.totalViews);
            const efficiency = calculateEfficiencyScore(del.totalViews, realCost);

            let tier = "Nano-Tier";
            if (kol.followers >= 1000000) tier = "Mega-Tier";
            else if (kol.followers >= 100000) tier = "Macro-Tier";
            else if (kol.followers >= 10000) tier = "Micro-Tier";

            return {
                kol,
                del,
                cost: realCost,
                displayRate, // For column display
                er,
                cpm,
                efficiency,
                tier,
            } as KOLTableItem & { displayRate: number }; // Intersection to satisfy the any cast in columns if needed, but better to update interface
        }).filter((item): item is KOLTableItem & { displayRate: number } => item !== null);
    }, [campaign.deliverables, campaign.platform, kols]);

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder="Filter by name..."
            emptyMessage="No KOLs in this campaign. Add one to get started."
        />
    );
}
