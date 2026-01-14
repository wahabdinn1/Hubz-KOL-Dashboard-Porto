"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { TrendingUp, Users, DollarSign, Activity, Zap, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { useMemo, useState, useEffect } from "react";
import { CreateCampaignDialog } from "@/components/create-campaign-dialog";
import { AddKOLDialog } from "@/components/add-kol-dialog";
import { BarChart } from "@/components/retroui/charts/BarChart";
import { Progress } from "@/components/retroui/Progress";
import { TierBadge } from "@/components/ui/tier-badge";
import { formatCompactNumber } from "@/lib/utils";

function DashboardContent() {
  const { kols, campaigns } = useData();
  const [activeChart, setActiveChart] = useState<"revenue" | "views">("revenue");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Calculate Metrics ---
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalSpend = 0;
    let totalViews = 0;
    let totalBudget = 0;

    const statusCounts: Record<string, number> = {
      'TO_CONTACT': 0, 'NEGOTIATING': 0, 'IN_PROGRESS': 0,
      'SUBMITTED': 0, 'POSTED': 0, 'COMPLETED': 0
    };

    campaigns.forEach(c => {
      totalBudget += c.budget || 0;

      // Calculate spend based on platform rates
      const campaignSpend = c.deliverables.reduce((acc, del) => {
        const kol = kols.find(k => k.id === del.kolId);
        if (!kol) return acc;
        const rate = c.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
        return acc + (rate * del.videosCount);
      }, 0);

      totalSpend += campaignSpend;

      c.deliverables.forEach(d => {
        totalRevenue += d.salesGenerated || 0;
        totalViews += d.totalViews || 0;
        if (d.status && statusCounts[d.status] !== undefined) {
          statusCounts[d.status]++;
        } else {
          // Fallback for undefined status or legacy data
          statusCounts['TO_CONTACT']++;
        }
      });
    });

    const activeKOLs = kols.length;
    const activeCampaigns = campaigns.length;

    // Tier Counts
    const tierCounts = { 'Nano-Tier': 0, 'Micro-Tier': 0, 'Macro-Tier': 0, 'Mega-Tier': 0 };
    kols.forEach(kol => {
      const followers = kol.followers || 0;
      if (followers >= 1000000) tierCounts['Mega-Tier']++;
      else if (followers >= 100000) tierCounts['Macro-Tier']++;
      else if (followers >= 10000) tierCounts['Micro-Tier']++;
      else tierCounts['Nano-Tier']++;
    });

    return { totalRevenue, totalViews, activeKOLs, activeCampaigns, totalSpend, totalBudget, statusCounts, tierCounts };
  }, [kols, campaigns]);

  // --- Prepare Chart Data ---
  const chartData = useMemo(() => {
    return campaigns.map(c => {
      const revenue = c.deliverables.reduce((sum, d) => sum + (d.salesGenerated || 0), 0);
      const views = c.deliverables.reduce((sum, d) => sum + (d.totalViews || 0), 0);
      return {
        name: c.name,
        revenue: revenue,
        views: views
      };
    }).sort((a, b) => activeChart === 'revenue' ? b.revenue - a.revenue : b.views - a.views);
  }, [campaigns, activeChart]);

  // --- Prepare Platform Distribution Data ---
  const platformData = useMemo(() => {
    const data = { TikTok: 0, Instagram: 0 };
    campaigns.forEach(c => {
      if (c.platform === 'Instagram') data.Instagram += c.budget;
      else data.TikTok += c.budget;
    });
    return [
      { name: 'TikTok', value: data.TikTok, color: '#000000' },
      { name: 'Instagram', value: data.Instagram, color: '#FFDA5C' }
    ].filter(d => d.value > 0);
  }, [campaigns]);

  // --- Prepare Global Top KOLs ---
  const topKOLs = useMemo(() => {
    const kolApp = new Map<string, { sales: number, views: number }>();

    campaigns.forEach(c => {
      c.deliverables.forEach(d => {
        const current = kolApp.get(d.kolId) || { sales: 0, views: 0 };
        kolApp.set(d.kolId, {
          sales: current.sales + d.salesGenerated,
          views: current.views + d.totalViews
        });
      });
    });

    return Array.from(kolApp.entries())
      .map(([id, stats]) => {
        const kol = kols.find(k => k.id === id);
        return {
          name: kol?.name || 'Unknown',
          sales: stats.sales,
          views: stats.views,
          category: kol?.category
        };
      })
      .sort((a, b) => activeChart === 'revenue' ? b.sales - a.sales : b.views - a.views)
      .slice(0, 5);

  }, [campaigns, kols, activeChart]);

  // Format currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(number);
  };



  return (
    <div className="space-y-8">

      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Performance Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Aggregate metrics across {metrics.activeCampaigns} active campaign{metrics.activeCampaigns !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CreateCampaignDialog />
            <div className="hidden sm:block">
              <AddKOLDialog enableAutoLink={false} />
            </div>
          </div>
        </div>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* REVENUE & BUDGET */}
        <Card className={activeChart === 'revenue' ? "border-primary/50 shadow-md" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financials</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIDR(metrics.totalRevenue)}</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Spend: {formatCompactNumber(metrics.totalSpend)}</span>
                <span>Budget: {formatCompactNumber(metrics.totalBudget)}</span>
              </div>
              <Progress value={(metrics.totalSpend / (metrics.totalBudget || 1)) * 100} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-green-500 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> ROAS: {(metrics.totalRevenue / (metrics.totalSpend || 1)).toFixed(2)}x
            </p>
          </CardContent>
        </Card>

        {/* ACTIVE KOLS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active KOLs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeKOLs}</div>
            <p className="text-xs text-muted-foreground mt-1">Influencers in network</p>
            {/* Mini Tier Distribution */}
            <div className="flex gap-1 mt-3 h-1.5 w-full rounded-full overflow-hidden">
              <div className="bg-slate-300 dark:bg-slate-700" style={{ width: `${(metrics.tierCounts['Nano-Tier'] / metrics.activeKOLs) * 100}%` }} title="Nano" />
              <div className="bg-blue-400" style={{ width: `${(metrics.tierCounts['Micro-Tier'] / metrics.activeKOLs) * 100}%` }} title="Micro" />
              <div className="bg-purple-500" style={{ width: `${(metrics.tierCounts['Macro-Tier'] / metrics.activeKOLs) * 100}%` }} title="Macro" />
              <div className="bg-amber-400" style={{ width: `${(metrics.tierCounts['Mega-Tier'] / metrics.activeKOLs) * 100}%` }} title="Mega" />
            </div>
          </CardContent>
        </Card>

        {/* TOTAL VIEWS */}
        <Card className={activeChart === 'views' ? "border-purple-500/50 shadow-md" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactNumber(metrics.totalViews)}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated video views</p>
          </CardContent>
        </Card>

        {/* AVG PERFORMANCE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. {activeChart === 'revenue' ? 'Rev' : 'Views'} / Campaign</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeCampaigns > 0
                ? formatCompactNumber(
                  activeChart === 'revenue'
                    ? metrics.totalRevenue / metrics.activeCampaigns
                    : metrics.totalViews / metrics.activeCampaigns
                )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per campaign performance</p>
          </CardContent>
        </Card>
      </div>

      {/* --- PIPELINE SNAPSHOT --- */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(metrics.statusCounts).map(([status, count]) => (
          <Card key={status} className="bg-muted/30 border-dashed">
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold">{count}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {status.replace(/_/g, ' ')}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Charts Section --- */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Interactive Chart */}
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Comparison of top campaigns by selected metric.
              </CardDescription>
            </div>
            <div className="flex">
              <button
                data-active={activeChart === "revenue"}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 transition-colors hover:bg-muted/20"
                onClick={() => setActiveChart("revenue")}
              >
                <span className="text-xs text-muted-foreground">
                  Total Revenue
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {formatCompactNumber(metrics.totalRevenue)}
                </span>
              </button>
              <button
                data-active={activeChart === "views"}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6 transition-colors hover:bg-muted/20"
                onClick={() => setActiveChart("views")}
              >
                <span className="text-xs text-muted-foreground">
                  Total Views
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {formatCompactNumber(metrics.totalViews)}
                </span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <div className="w-full min-h-[300px]">
              {isMounted && chartData.length > 0 ? (
                <BarChart
                  className="h-[300px] w-full"
                  data={chartData}
                  index="name"
                  categories={[activeChart]}
                  valueFormatter={(value) => activeChart === 'revenue' ? formatIDR(value) : formatCompactNumber(value)}
                  fillColors={activeChart === 'revenue' ? ["var(--primary)"] : ["#8b5cf6"]}
                  strokeColors={["#000"]}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No campaign data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Platform & Top KOLs */}
        <div className="col-span-1 lg:col-span-3 space-y-4">

          {/* Platform Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget Allocation</CardTitle>
              <CardDescription>Platform distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {platformData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: any) => formatIDR(value)}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading...</div>}
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {platformData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top KOLs Leaderboard */}
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top {activeChart === 'revenue' ? 'Earners' : 'Profiles by Reach'}</CardTitle>
              <CardDescription>Global top 5 by {activeChart === 'revenue' ? 'revenue' : 'views'}.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topKOLs.map((kol, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{kol.name}</p>
                        <p className="text-xs text-muted-foreground">{kol.category}</p>
                      </div>
                    </div>
                    <div className="font-medium text-sm flex items-center gap-1">
                      {activeChart === 'revenue' ? (
                        formatCompactNumber(kol.sales)
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          {formatCompactNumber(kol.views)}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {topKOLs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data available.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function Home() {
  return (
    <DashboardContent />
  );
}
