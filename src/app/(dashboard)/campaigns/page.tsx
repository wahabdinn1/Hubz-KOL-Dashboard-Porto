"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatIDR, calculateROI } from "@/lib/analytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
import { DeleteCampaignDialog } from "@/components/delete-campaign-dialog";
import { ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Campaign } from "@/lib/static-data";
import { useRouter } from "next/navigation";

function CampaignsListContent() {
  const { campaigns, kols, deleteCampaign } = useData();

  const router = useRouter();

  // Helper to calculate metrics for a single campaign row
  const getCampaignMetrics = (campaign: Campaign) => {
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

    return { totalSpend, totalRevenue, roi };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            All Campaigns
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of all your marketing initiatives.
          </p>
        </div>
        <div>
          <CreateCampaignDialog />
        </div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Click on a campaign to view detailed performance metrics.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                    No campaigns found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => {
                  const metrics = getCampaignMetrics(campaign);
                  return (
                    <TableRow
                      key={campaign.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors group"
                      onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    >
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${campaign.objective === 'CONVERSION'
                          ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-400/20'
                          : 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/10 dark:text-blue-400 dark:ring-blue-400/20'
                          }`}>
                          {campaign.objective || 'AWARENESS'}
                        </span>
                      </TableCell>
                      <TableCell>{campaign.startDate || "-"}</TableCell>
                      <TableCell>{campaign.endDate || "-"}</TableCell>
                      <TableCell>{formatIDR(campaign.budget)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatIDR(metrics.totalSpend)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((metrics.totalSpend / campaign.budget) * 100)}% Used
                        </div>
                      </TableCell>
                      <TableCell>{formatIDR(metrics.totalRevenue)}</TableCell>
                      <TableCell>
                        <span className={metrics.roi > 0 ? "text-green-600 font-medium" : "text-slate-500"}>
                          {metrics.roi.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <Link href={`/campaigns/${campaign.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteCampaignDialog campaign={campaign} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap with DashboardShell AND DataProvider
export default function CampaignsListPage() {
  return (
    <CampaignsListContent />
  );
}
