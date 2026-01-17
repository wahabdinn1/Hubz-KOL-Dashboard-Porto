"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Campaign } from "@/lib/static-data";

interface KOLPerformanceChartProps {
    kolId: string;
    campaigns: Campaign[];
    variant?: "bar" | "line";
}

export function KOLPerformanceChart({ kolId, campaigns, variant = "line" }: KOLPerformanceChartProps) {
    const chartData = React.useMemo(() => {
        return campaigns
            .filter((c) => c.deliverables.some((d) => d.kolId === kolId))
            .slice(0, 6) // Last 6 campaigns
            .map((campaign) => {
                const deliverable = campaign.deliverables.find((d) => d.kolId === kolId);
                return {
                    name: campaign.name.length > 12 ? campaign.name.substring(0, 12) + "..." : campaign.name,
                    views: deliverable?.totalViews || 0,
                    revenue: deliverable?.salesGenerated || 0,
                    platform: campaign.platform,
                };
            })
            .reverse(); // Show oldest first
    }, [kolId, campaigns]);

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance Trend</CardTitle>
                    <CardDescription>View performance across campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                        No campaign data yet
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance Trend</CardTitle>
                <CardDescription>Views across {chartData.length} campaigns</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        {variant === "line" ? (
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="name"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => formatCompactNumber(val)}
                                    width={45}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCompactNumber(Number(value) || 0), "Views"]}
                                    labelStyle={{ fontWeight: "bold" }}
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        border: "2px solid var(--border)",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="name"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => formatCompactNumber(val)}
                                    width={45}
                                />
                                <Tooltip
                                    formatter={(value) => [formatCompactNumber(Number(value) || 0), "Views"]}
                                    contentStyle={{
                                        backgroundColor: "var(--background)",
                                        border: "2px solid var(--border)",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar
                                    dataKey="views"
                                    fill="var(--primary)"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#000"
                                    strokeWidth={2}
                                />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
