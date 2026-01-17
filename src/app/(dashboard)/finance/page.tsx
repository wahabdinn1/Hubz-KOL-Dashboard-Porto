"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useData } from "@/context/data-context";
import { useMemo } from "react";
import { formatIDR } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/utils";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    BarChart3,
} from "lucide-react";
import { BarChart } from "@/components/retroui/charts/BarChart";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import { Plus, List } from "lucide-react";

function FinanceContent() {
    const { campaigns, kols } = useData();

    // Calculate finance metrics
    const metrics = useMemo(() => {
        let totalRevenue = 0;
        let totalSpend = 0;
        let totalBudget = 0;

        const campaignPnL: {
            id: string;
            name: string;
            revenue: number;
            spend: number;
            profit: number;
            roi: number;
        }[] = [];

        campaigns.forEach((c) => {
            let campaignSpend = 0;
            let campaignRevenue = 0;

            c.deliverables.forEach((del) => {
                const kol = kols.find((k) => k.id === del.kolId);
                if (!kol) return;
                
                const rate = c.platform === "Instagram"
                    ? (kol.rateCardReels || 0)
                    : (kol.rateCardTiktok || 0);
                
                campaignSpend += rate * del.videosCount;
                campaignRevenue += del.salesGenerated || 0;
            });

            totalSpend += campaignSpend;
            totalRevenue += campaignRevenue;
            totalBudget += c.budget || 0;

            const profit = campaignRevenue - campaignSpend;
            const roi = campaignSpend > 0 ? ((campaignRevenue - campaignSpend) / campaignSpend) * 100 : 0;

            campaignPnL.push({
                id: c.id,
                name: c.name,
                revenue: campaignRevenue,
                spend: campaignSpend,
                profit,
                roi,
            });
        });

        const netProfit = totalRevenue - totalSpend;
        const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
        const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

        return {
            totalRevenue,
            totalSpend,
            totalBudget,
            netProfit,
            overallROI,
            budgetUtilization,
            campaignPnL: campaignPnL.sort((a, b) => b.profit - a.profit),
        };
    }, [campaigns, kols]);

    // Chart data
    const chartData = metrics.campaignPnL.slice(0, 10).map((c) => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
        revenue: c.revenue,
        spend: c.spend,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Financial Summary
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Overview of revenue, expenses, and profitability across all campaigns.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/invoices/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Invoice
                        </Button>
                    </Link>
                    <Link href="/invoices">
                        <Button variant="outline">
                            <List className="mr-2 h-4 w-4" />
                            All Invoices
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatIDR(metrics.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            From all campaigns
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Spend
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatIDR(metrics.totalSpend)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics.budgetUtilization.toFixed(1)}% of total budget
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Net Profit
                        </CardTitle>
                        <PiggyBank className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatIDR(metrics.netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {metrics.netProfit >= 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            Revenue - Expenses
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Overall ROI
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.overallROI >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {metrics.overallROI.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Return on Investment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Revenue vs Spend Chart */}
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader>
                        <CardTitle>Revenue vs Spend by Campaign</CardTitle>
                        <CardDescription>Top 10 campaigns by profit</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={chartData}
                            index="name"
                            categories={["revenue", "spend"]}
                            fillColors={["#10B981", "#F97316"]}
                        />
                    </CardContent>
                </Card>

                {/* Campaign P&L Table */}
                <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <CardHeader>
                        <CardTitle>Campaign Profitability</CardTitle>
                        <CardDescription>All campaigns sorted by profit</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[350px] overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left font-medium">Campaign</th>
                                        <th className="p-3 text-right font-medium">Revenue</th>
                                        <th className="p-3 text-right font-medium">Spend</th>
                                        <th className="p-3 text-right font-medium">Profit</th>
                                        <th className="p-3 text-right font-medium">ROI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.campaignPnL.map((campaign) => (
                                        <tr key={campaign.id} className="border-t hover:bg-muted/50 transition-colors">
                                            <td className="p-3 font-medium">{campaign.name}</td>
                                            <td className="p-3 text-right text-emerald-600">
                                                {formatCompactNumber(campaign.revenue)}
                                            </td>
                                            <td className="p-3 text-right text-orange-600">
                                                {formatCompactNumber(campaign.spend)}
                                            </td>
                                            <td className={`p-3 text-right font-semibold ${campaign.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {formatCompactNumber(campaign.profit)}
                                            </td>
                                            <td className={`p-3 text-right ${campaign.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {campaign.roi.toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                    {metrics.campaignPnL.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No campaign data available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function FinancePage() {
    return <FinanceContent />;
}
