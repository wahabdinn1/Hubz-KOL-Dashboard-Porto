"use client";

import { useEffect, use } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { KOLTable } from "@/components/kol-table";
import { formatIDR, calculateROI, calculateROAS, calculateCampaignSuccess, calculateER } from "@/lib/analytics";
import {
    Wallet,
    TrendingUp,
    Users,
    Award,
    ChevronLeft,
    List,
    LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { AddKOLDialog } from "@/components/add-kol-dialog";
import { SmartMatchDialog } from "@/components/ai/smart-match-dialog";
import Link from "next/link";
import { EditCampaignDialog } from "@/components/edit-campaign-dialog";
import { DeleteCampaignDialog } from "@/components/delete-campaign-dialog";
import { CampaignDownloadButton } from "@/components/pdf/download-button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Content Component that uses the Context
function CampaignDetailContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { kols, campaign, campaigns, setActiveCampaignId, loading } = useData();
    const router = useRouter();

    // Sync URL param with Context
    useEffect(() => {
        if (id) {
            setActiveCampaignId(id);
        }
    }, [id, setActiveCampaignId]);

    // Handle Loading & Redirection
    useEffect(() => {
        if (!loading && (!campaign || campaign.id !== id)) {
            const found = campaigns.find(c => c.id === id);
            if (!found) {
                // Current ID invalid, redirect to list
                router.push('/campaigns');
            }
        }
    }, [loading, campaign, id, campaigns, router]);

    // Show loading state while data is fetching or if switching campaigns
    if (loading || (!campaign || campaign.id !== id)) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground font-medium">Loading Campaign Data...</p>
            </div>
        )
    }

    // Aggregate Calculations
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalViews = 0;
    let totalShares = 0;
    let totalClicks = 0;
    let totalOrders = 0;

    let totalEngagements = 0;

    // Track best performer dynamically
    let bestPerformer = {
        name: "N/A",
        value: 0,
        metricLabel: campaign.objective === 'AWARENESS' ? 'Views' : 'Sales'
    };

    campaign.deliverables.forEach((del) => {
        const kol = kols.find((k) => k.id === del.kolId);
        if (!kol) return;

        const rate = campaign.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
        const cost = rate * del.videosCount;
        // console.log(`Calc Debug: ${kol.name} | Rate: ${rate} | Count: ${del.videosCount} | Cost: ${cost} | Plat: ${campaign.platform}`);
        totalSpend += cost;
        totalRevenue += del.salesGenerated;
        totalViews += del.totalViews;
        totalEngagements += del.totalEngagements;

        // Accumulate new metrics
        totalShares += del.detailedEngagements?.shares || 0;
        totalClicks += del.clicks || 0;
        totalOrders += del.orders || 0;

        // Determine metric to compare
        const metricValue = campaign.objective === 'AWARENESS' ? del.totalViews : del.salesGenerated;

        if (metricValue > bestPerformer.value) {
            bestPerformer = {
                name: kol.name,
                value: metricValue,
                metricLabel: campaign.objective === 'AWARENESS' ? 'Views' : 'Sales'
            };
        }
    });

    const successMetrics = calculateCampaignSuccess(
        campaign.objective || 'AWARENESS',
        totalSpend,
        totalRevenue,
        totalViews,
        totalShares,
        totalClicks,
        totalOrders
    );
    const roi = calculateROI(totalRevenue, totalSpend);
    const aggER = calculateER(totalEngagements, totalViews);

    // Dynamic Card 3 Logic
    let card3Title = "Aggregate ROI";
    let card3Value = `${roi.toFixed(1)}%`;
    let card3Subtext = roi > 0 ? "Positive Return" : "Negative Return";
    let card3Color = roi > 100 ? "text-green-600 dark:text-green-500" : "text-foreground";
    let card3Icon = <Users className="h-4 w-4 text-blue-600 dark:text-blue-500" />;

    if (campaign.objective === 'AWARENESS') {
        card3Title = "Engagement Rate";
        card3Value = `${aggER.toFixed(2)}%`;
        card3Subtext = "Avg. Engagement";
        card3Color = "text-foreground";
        card3Icon = <TrendingUp className="h-4 w-4 text-pink-600" />;
    }

    return (
        <div className="space-y-8">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/campaigns">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {campaign.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Campaign Performance Dashboard
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Platform Badge */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${campaign.platform === 'Instagram'
                        ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                        : 'bg-black text-white dark:bg-slate-800 dark:text-slate-100'
                        }`}>
                        {campaign.platform === 'Instagram' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                        )}
                        {campaign.platform}
                    </div>
                    <CampaignDownloadButton campaign={campaign} kols={kols} />
                    <EditCampaignDialog campaign={campaign} />
                    <DeleteCampaignDialog campaign={campaign} />
                </div>
            </div>

            {/* Campaign Banner / Context */}
            <div className="bg-card rounded-xl p-4 border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Campaign</p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${successMetrics.performanceColor} cursor-help flex items-center gap-1`}>
                                        {successMetrics.performanceLabel} <HelpCircle className="h-3 w-3" />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Performance based on {campaign.objective} goal.</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {campaign.objective === 'CONVERSION' ? 'Target: ROAS > 2.0x' : 'Target: CPM < 25k IDR'}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <h2 className="text-lg font-semibold text-foreground">{campaign.name}</h2>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-sm text-muted-foreground cursor-help flex items-center gap-1">
                                        Objective: <span className="font-medium text-foreground">{campaign.objective || 'AWARENESS'}</span>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{campaign.objective === 'CONVERSION' ? 'Focus: ROI & ROAS' : 'Focus: Reach & Views'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground pb-1">Budget Utilization</p>
                    <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((totalSpend / campaign.budget) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <SummaryCard
                    title={`Primary: ${successMetrics.primaryMetricLabel}`}
                    value={successMetrics.primaryMetricValue}
                    subtext={`${successMetrics.secondaryMetricLabel}: ${successMetrics.secondaryMetricValue}`}
                    valueColor={successMetrics.performanceColor.split(' ')[0]}
                    icon={<Award className="h-4 w-4 text-purple-500" />}
                />
                <SummaryCard
                    title="Campaign Budget"
                    value={formatIDR(campaign.budget)}
                    subtext={`Remaining: ${formatIDR(Math.max(0, campaign.budget - totalSpend))}`}
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                />
                <SummaryCard
                    title="Total Spend"
                    value={formatIDR(totalSpend)}
                    subtext="Realized Cost"
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                />
                <SummaryCard
                    title={card3Title}
                    value={card3Value}
                    subtext={card3Subtext}
                    valueColor={card3Color}
                    icon={card3Icon}
                />
                <SummaryCard
                    title="Best Performer"
                    value={bestPerformer.name}
                    subtext={`${bestPerformer.metricLabel}: ${bestPerformer.metricLabel === 'Sales'
                        ? formatIDR(bestPerformer.value)
                        : new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(bestPerformer.value)
                        }`}
                    icon={<Award className="h-4 w-4 text-amber-500" />}
                />
            </div>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="list" className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <TabsTrigger value="list" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
                            <List className="h-4 w-4 mr-2" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger value="board" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Kanban Board
                        </TabsTrigger>
                    </TabsList>
                    <div className="flex items-center gap-2">
                        <SmartMatchDialog campaign={campaign} />
                        <AddKOLDialog />
                    </div>
                </div>

                <TabsContent value="list" className="space-y-4">
                    <Card className="shadow-sm border-border">
                        <CardContent className="p-0">
                            <KOLTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="board" className="h-[calc(100vh-220px)] w-full">
                    <div className="h-full overflow-hidden p-1">
                        <KanbanBoard />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface SummaryCardProps {
    title: string;
    value: string;
    subtext: string;
    icon: React.ReactNode;
    valueColor?: string;
}

function SummaryCard({ title, value, subtext, icon, valueColor = "text-foreground" }: SummaryCardProps) {
    return (
        <Card className="shadow-sm border-border transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </CardContent>
        </Card>
    );
}

// Wrap with DashboardShell AND DataProvider
// Note: In Next.js 15, page params are a Promise!
export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <CampaignDetailContent params={params} />
    );
}
