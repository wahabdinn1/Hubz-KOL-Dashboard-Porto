"use client";

import { useMemo, useCallback } from "react";
import { formatIDR, calculateROI } from "@/lib/analytics";
import { useData } from "@/context/data-context";
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog";
import { CampaignGantt } from "@/components/campaigns/campaign-gantt";
import { Campaign } from "@/lib/static-data";
import { useRouter } from "next/navigation";
import { EmptyState, EmptyStateIcons } from "@/components/retroui/EmptyState";
import { DataView } from "@/components/shared/data-view";
import { DataTable } from "@/components/ui/data-table";
import { columns, CampaignWithMetrics } from "@/components/campaigns/columns";

function CampaignsListContent() {
  const { campaigns, kols, loading } = useData();
  const router = useRouter();

  // Helper to calculate metrics for a single campaign row
  const getCampaignMetrics = useCallback((campaign: Campaign): CampaignWithMetrics => {
    let totalSpend = 0;
    let totalRevenue = 0;

    campaign.deliverables.forEach((del) => {
      const kol = kols.find((k) => k.id === del.kolId);
      if (!kol) return;
      const rate = campaign.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
      totalSpend += rate * del.videosCount;
      totalRevenue += del.salesGenerated;
    });

    const roi = calculateROI(totalRevenue, totalSpend);

    // Calculate completion % based on deliverable statuses
    const completedCount = campaign.deliverables.filter(d => d.status === 'completed' || d.status === 'posted').length;
    const completionPercent = campaign.deliverables.length > 0
      ? Math.round((completedCount / campaign.deliverables.length) * 100)
      : 0;

    return { 
        ...campaign,
        totalSpend, 
        totalRevenue, 
        roi, 
        completionPercent 
    };
  }, [kols]);

  const campaignsWithMetrics = useMemo(() => {
    return campaigns.map(getCampaignMetrics);
  }, [campaigns, getCampaignMetrics]);

  const actions = (
    <div className="flex gap-2">
      <CreateCampaignDialog />
    </div>
  );

  // Note: Mobile view is currently handled by DataView but DataTable handles logic for desktop.
  const mobileView = (
    <div className="grid gap-4">
        {campaignsWithMetrics.map((campaign) => (
             <div 
                key={campaign.id}
                className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer bg-card"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
                <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center rounded-full w-8 h-8 border ${campaign.platform === 'Instagram'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                    }`}>
                    {campaign.platform === 'Instagram' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                    )}
                    </span>
                    <span className="font-medium truncate max-w-[180px]">{campaign.name}</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${campaign.objective === 'CONVERSION'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                    {campaign.objective || 'AWARENESS'}
                </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Budget: {formatIDR(campaign.budget)}</div>
                <div>ROI: {campaign.roi >= 0 ? '+' : ''}{campaign.roi.toFixed(0)}%</div>
                <div>Start: {campaign.startDate || '-'}</div>
                <div>Progress: {campaign.completionPercent.toFixed(0)}%</div>
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
        <DataView
            pageTitle="All Campaigns"
            pageDescription="Overview of all your marketing initiatives."
            pageActions={actions}
            cardTitle="Active Campaigns"
            cardDescription="Click on a campaign to view detailed performance metrics."
            isLoading={loading}
            isEmpty={!loading && campaigns.length === 0}
            emptyState={
                <div className="py-12">
                    <EmptyState
                    title="No campaigns yet"
                    description="Create your first campaign to start tracking influencer collaborations."
                    icon={EmptyStateIcons.folder}
                    action={<CreateCampaignDialog />}
                    />
                </div>
            }
            desktopView={
                <DataTable 
                    columns={columns} 
                    data={campaignsWithMetrics} 
                    searchKey="name"
                    searchPlaceholder="Filter campaigns..."
                />
            }
            mobileView={mobileView}
        />

      {/* Campaign Timeline */}
      {!loading && campaigns.length > 0 && (
          <CampaignGantt campaigns={campaigns} className="mt-8" />
      )}
    </div>
  );
}

// Wrap with DashboardShell AND DataProvider
export default function CampaignsListPage() {
  return (
    <CampaignsListContent />
  );
}
