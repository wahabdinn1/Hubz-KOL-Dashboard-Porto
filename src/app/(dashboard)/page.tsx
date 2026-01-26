"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Activity, Zap, Eye } from "lucide-react";
import { useData } from "@/context/data-context";
import { useMemo, useState, useEffect } from "react";
import { CreateCampaignDialog } from "@/components/campaigns/create-campaign-dialog";
import { AddKOLDialog } from "@/components/kols/add-kol-dialog";
import { Progress } from "@/components/retroui/Progress";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";
import { Skeleton } from "@/components/retroui/Skeleton";
import dynamic from 'next/dynamic';
import { DashboardSkeleton } from "./dashboard-skeleton";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

// Dynamically import charts to reduce initial bundle size
const BarChart = dynamic(() => import("@/components/retroui/charts/BarChart").then(mod => mod.BarChart), {
  loading: () => <Skeleton className="h-[350px] w-full bg-muted/20" />,
  ssr: false
});

// Recharts components need to be dynamically imported for performance sometimes, 
// but since they are used inside the component directly, we might just defer the specialized chart sections.
// However, since we are doing manual composition for PieChart, let's keep it as is for now 
// but note that 'recharts' is heavy.
// A better approach for the PieChart section would be to wrap it in a separate component and dynamic import it.
// For now, let's focus on BarChart which is the heaviest, and the general loading state.
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";

function DashboardContent() {
  const { kols, campaigns, loading } = useData();
  const [activeChart, setActiveChart] = useState<"revenue" | "views">("revenue");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);



  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
  }, []);

  // Filter campaigns by date range
  const filteredCampaigns = useMemo(() => {
    if (!dateRange?.from) return campaigns;
    
    return campaigns.filter(c => {
      if (!c.startDate && !c.endDate) return true; // Include campaigns without dates
      
      const campaignStart = c.startDate ? parseISO(c.startDate) : null;
      const campaignEnd = c.endDate ? parseISO(c.endDate) : null;
      
      // Check if campaign overlaps with selected range
      if (dateRange.from && dateRange.to) {
        if (campaignStart && campaignEnd) {
          return (
            isWithinInterval(campaignStart, { start: dateRange.from, end: dateRange.to }) ||
            isWithinInterval(campaignEnd, { start: dateRange.from, end: dateRange.to }) ||
            isWithinInterval(dateRange.from, { start: campaignStart, end: campaignEnd })
          );
        }
        if (campaignStart) {
          return isWithinInterval(campaignStart, { start: dateRange.from, end: dateRange.to });
        }
      }
      return true;
    });
  }, [campaigns, dateRange]);

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

    filteredCampaigns.forEach(c => {
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
    const activeCampaigns = filteredCampaigns.length;

    // Tier Counts
    const tierCounts = { 'Nano-Tier': 0, 'Micro-Tier': 0, 'Macro-Tier': 0, 'Mega-Tier': 0 };
    kols.forEach(kol => {
      const followers = kol.followers || 0;
      if (followers >= 1000000) tierCounts['Mega-Tier']++;
      else if (followers >= 100000) tierCounts['Macro-Tier']++;
      else if (followers >= 10000) tierCounts['Micro-Tier']++;
      else tierCounts['Nano-Tier']++;
    });

    // Category Performance
    const categoryPerformance: Record<string, { revenue: number; views: number }> = {};
    filteredCampaigns.forEach(c => {
      c.deliverables.forEach(d => {
        const kol = kols.find(k => k.id === d.kolId);
        if (kol) {
          const cat = kol.category || 'Uncategorized';
          if (!categoryPerformance[cat]) categoryPerformance[cat] = { revenue: 0, views: 0 };
          categoryPerformance[cat].revenue += d.salesGenerated || 0;
          categoryPerformance[cat].views += d.totalViews || 0;
        }
      });
    });

    return { totalRevenue, totalViews, activeKOLs, activeCampaigns, totalSpend, totalBudget, statusCounts, tierCounts, categoryPerformance };
  }, [kols, filteredCampaigns]);

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

  // --- Prepare category chart data ---
  const categoryChartData = useMemo(() => {
    return Object.entries(metrics.categoryPerformance).map(([name, val]) => ({
      name,
      revenue: val.revenue,
      views: val.views
    })).sort((a, b) => activeChart === 'revenue' ? b.revenue - a.revenue : b.views - a.views);
  }, [metrics.categoryPerformance, activeChart]);

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

  // --- Prepare Platform Comparison Metrics ---
  const platformMetrics = useMemo(() => {
    const metrics = {
      TikTok: { views: 0, revenue: 0, spend: 0, count: 0 },
      Instagram: { views: 0, revenue: 0, spend: 0, count: 0 }
    };

    campaigns.forEach(c => {
      const platform = c.platform as 'TikTok' | 'Instagram';
      if (!metrics[platform]) return;

      metrics[platform].count++;

      let campaignSpend = 0;
      c.deliverables.forEach(d => {
        metrics[platform].views += d.totalViews || 0;
        metrics[platform].revenue += d.salesGenerated || 0;

        const kol = kols.find(k => k.id === d.kolId);
        if (kol) {
          const rate = c.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
          campaignSpend += (rate * d.videosCount);
        }
      });
      metrics[platform].spend += campaignSpend;
    });

    return metrics;
  }, [campaigns, kols]);

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



  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">

      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Performance Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Aggregate metrics across {metrics.activeCampaigns} {dateRange?.from ? "filtered" : "active"} campaign{metrics.activeCampaigns !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <DateRangeFilter 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
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
        <Card 
            className={`transition-all hover:-translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              activeChart === 'revenue' ? "bg-primary/5 ring-2 ring-primary ring-offset-2" : ""
            }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financials</CardTitle>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-[180px]">Total revenue generated from KOL campaigns, including spend vs budget tracking</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        <Card className="transition-all hover:-translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active KOLs</CardTitle>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-[180px]">Total influencers in your network, broken down by tier (Nano, Micro, Macro, Mega)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        <Card 
            className={`transition-all hover:-translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              activeChart === 'views' ? "bg-purple-500/10 ring-2 ring-purple-500 ring-offset-2" : ""
            }`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-[180px]">Combined video views across all campaigns from all KOL content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactNumber(metrics.totalViews)}</div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated video views</p>
          </CardContent>
        </Card>

        {/* AVG PERFORMANCE */}
        <Card className="transition-all hover:-translate-y-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. {activeChart === 'revenue' ? 'Rev' : 'Views'} / Campaign</CardTitle>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-[180px]">Average performance per campaign - toggle using the chart selector above</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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



      {/* --- Charts Section --- */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-12">
        {/* Interactive Chart */}
        <Card className="col-span-1 lg:col-span-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
              <CardTitle className="flex items-center gap-2">
                Campaign Performance
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs max-w-[200px]">Bar chart comparing campaigns by revenue or views. Click the tabs to toggle between metrics.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
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
            <div className="w-full min-h-[350px]">
              {isMounted && chartData.length > 0 ? (
                <BarChart
                  className="h-[350px] w-full"
                  data={chartData}
                  index="name"
                  categories={[activeChart]}
                  valueFormatter={(value) => activeChart === 'revenue' ? formatIDR(value) : formatCompactNumber(value)}
                  yAxisFormatter={(value) => formatCompactNumber(value)}
                  fillColors={activeChart === 'revenue' ? ["var(--primary)"] : ["#8b5cf6"]}
                  strokeColors={["#000"]}
                  xAxisFormatter={(val) => val.length > 15 ? val.slice(0, 15) + '...' : val}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No campaign data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>



        {/* Platform Comparison */}
        {/* Platform Comparison */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Platform Comparison</CardTitle>
            <CardDescription>Head-to-head metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px] items-center pb-2 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metric</span>
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_80px_80px] items-center">
                <span className="text-sm font-medium text-muted-foreground">Campaigns</span>
                <span className="text-sm font-semibold text-center">{platformMetrics.TikTok.count}</span>
                <span className="text-sm font-semibold text-center">{platformMetrics.Instagram.count}</span>
              </div>
              <div className="grid grid-cols-[1fr_80px_80px] items-center">
                <span className="text-sm font-medium text-muted-foreground">Views</span>
                <span className="text-sm font-medium text-center">{formatCompactNumber(platformMetrics.TikTok.views)}</span>
                <span className="text-sm font-medium text-center">{formatCompactNumber(platformMetrics.Instagram.views)}</span>
              </div>
              <div className="grid grid-cols-[1fr_80px_80px] items-center">
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                <span className="text-sm font-medium text-emerald-600 text-center">{formatCompactNumber(platformMetrics.TikTok.revenue)}</span>
                <span className="text-sm font-medium text-emerald-600 text-center">{formatCompactNumber(platformMetrics.Instagram.revenue)}</span>
              </div>
              <div className="grid grid-cols-[1fr_80px_80px] items-center">
                <span className="text-sm font-medium text-muted-foreground">Avg CPV</span>
                <span className="text-sm font-medium text-center">{formatCompactNumber(platformMetrics.TikTok.views > 0 ? platformMetrics.TikTok.spend / platformMetrics.TikTok.views : 0)}</span>
                <span className="text-sm font-medium text-center">{formatCompactNumber(platformMetrics.Instagram.views > 0 ? platformMetrics.Instagram.spend / platformMetrics.Instagram.views : 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Platform & Top KOLs */}
        {/* Platform Distribution */}
        {/* Platform Distribution */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Budget Allocation
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs max-w-[200px]">Pie chart showing how your total budget is distributed across TikTok and Instagram campaigns.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
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
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border-2 border-border p-3 shadow-lg bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs uppercase text-slate-400 dark:text-slate-500">
                                Platform
                              </span>
                              <span className="font-bold">{data.name}</span>
                              <span className="text-emerald-400 dark:text-emerald-600 font-bold">
                                {formatIDR(data.value as number)}
                              </span>
                            </div>
                          </div>
                        );
                      }}
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

        {/* Category Performance */}
        {/* Category Performance */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Category Performance
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs max-w-[200px]">Performance breakdown by influencer category (Beauty, Gaming, etc.)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                Top categories by {activeChart === 'revenue' ? 'Revenue' : 'Views'}.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-2 pr-2">
            <div className="h-[220px] w-full">
              {categoryChartData.length > 0 ? (
                <BarChart
                  data={categoryChartData}
                  index="name"
                  categories={[activeChart]}
                  fillColors={activeChart === "revenue" ? ["#10b981"] : ["#3b82f6"]}
                  valueFormatter={(val) => formatCompactNumber(val)}
                  yAxisWidth={45}
                  className="aspect-auto h-full w-full"
                  strokeColors={["#000"]}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  No category data available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top KOLs Leaderboard */}
        {/* Top KOLs Leaderboard */}
        <Card className="col-span-1 lg:col-span-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Top {activeChart === 'revenue' ? 'Earners' : 'Profiles by Reach'}
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs max-w-[180px]">Top 5 KOLs ranked by {activeChart === 'revenue' ? 'total sales generated' : 'total video views'} across all campaigns</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
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
  );
}

export default function Home() {
  return (
    <DashboardContent />
  );
}
