"use client";

import { useMemo, useCallback, useState } from "react";
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
import { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/retroui/Dialog";

function CampaignsListContent() {
  const { campaigns, kols, loading, deleteCampaigns } = useData();
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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

  const handleBulkDelete = async () => {
    try {
        const selectedIds = Object.keys(rowSelection);
        await deleteCampaigns(selectedIds);
        toast.success(`Deleted ${selectedIds.length} campaigns`);
        setRowSelection({});
    } catch (error) {
        toast.error("Failed to delete campaigns");
        console.error(error);
    }
  };

  const actions = (
    <div className="flex gap-2">
      {Object.keys(rowSelection).length > 0 && (
          <Dialog>
              <Dialog.Trigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete ({Object.keys(rowSelection).length})
                  </Button>
              </Dialog.Trigger>
              <Dialog.Content>
                  <Dialog.Header>
                      <span className="font-semibold text-lg">Are you absolutely sure?</span>
                  </Dialog.Header>
                  <div className="p-4">
                      <p className="text-muted-foreground">
                          This action cannot be undone. This will permanently delete the selected campaigns and remove their data from our servers.
                      </p>
                  </div>
                  <Dialog.Footer>
                      <Button variant="destructive" onClick={handleBulkDelete}>
                          Delete
                      </Button>
                  </Dialog.Footer>
              </Dialog.Content>
          </Dialog>
      )}
      <CreateCampaignDialog />
    </div>
  );

  // Note: Mobile view is currently handled by DataView but DataTable handles logic for desktop.
  /* Mobile View with Neo-Brutalist Cards */
  const mobileView = (
    <div className="space-y-4">
        {campaignsWithMetrics.map((campaign) => (
             <div 
                key={campaign.id}
                className="group relative flex flex-col gap-3 rounded-lg border-2 border-black bg-white dark:bg-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-px hover:shadow-none cursor-pointer"
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
            >
                {/* Header: Platform Icon + Name + Status */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black shadow-sm ${
                            campaign.platform === 'Instagram' ? 'bg-pink-100 text-pink-700' : 'bg-zinc-100 text-zinc-900'
                        }`}>
                             {campaign.platform === 'Instagram' ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                             <h3 className="font-bold text-lg leading-tight truncate">{campaign.name}</h3>
                             <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{campaign.platform}</p>
                        </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full border-2 border-black px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        campaign.objective === 'CONVERSION' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                        {campaign.objective || 'AWARENESS'}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full border border-black overflow-hidden mt-1">
                    <div 
                        className="h-full bg-yellow-400 border-r border-black transition-all duration-500" 
                        style={{ width: `${campaign.completionPercent}%` }} 
                    />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm mt-1">
                    <div className="flex flex-col p-2 bg-slate-50 border border-black rounded-md">
                        <span className="text-xs text-muted-foreground font-semibold">Budget</span>
                        <span className="font-bold">{formatIDR(campaign.budget)}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-slate-50 border border-black rounded-md">
                        <span className="text-xs text-muted-foreground font-semibold">ROI</span>
                        <span className={`font-bold ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {campaign.roi >= 0 ? '+' : ''}{campaign.roi.toFixed(0)}%
                        </span>
                    </div>
                    <div className="flex flex-col p-2 bg-slate-50 border border-black rounded-md">
                        <span className="text-xs text-muted-foreground font-semibold">Start Date</span>
                        <span className="font-medium">{campaign.startDate || '-'}</span>
                    </div>
                     <div className="flex flex-col p-2 bg-slate-50 border border-black rounded-md">
                        <span className="text-xs text-muted-foreground font-semibold">Progress</span>
                        <span className="font-medium">{campaign.completionPercent.toFixed(0)}%</span>
                    </div>
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
                    onRowClick={(row) => router.push(`/campaigns/${row.id}`)}
                    onRowSelectionChange={setRowSelection}
                    rowSelection={rowSelection}
                    getRowId={(row) => row.id}
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
