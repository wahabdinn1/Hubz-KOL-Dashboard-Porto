"use client";


import { cn } from "@/lib/utils";
import React from "react";
import {
    LineChart as RechartsLineChart,
    Line,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface LineChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Record<string, string | number>[];
    index: string;
    categories: string[];
    strokeColors?: string[];
    tooltipBgColor?: string;
    tooltipBorderColor?: string;
    gridColor?: string;
    valueFormatter?: (value: number) => string;
    showGrid?: boolean;
    showTooltip?: boolean;
    showDots?: boolean;
    className?: string;
}

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
    (
        {
            data = [],
            index,
            categories = [],
            strokeColors = ["var(--primary)", "#8b5cf6", "#f97316"],
            tooltipBgColor = "var(--background)",
            tooltipBorderColor = "var(--border)",
            gridColor = "var(--muted)",
            valueFormatter = (value: number) => value.toString(),
            showGrid = true,
            showTooltip = true,
            showDots = true,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div ref={ref} className={cn("h-80 w-full", className)} {...props}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        {showGrid && (
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        )}
                        <XAxis
                            dataKey={index}
                            axisLine={false}
                            tickLine={false}
                            className="text-xs fill-muted-foreground"
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            className="text-xs fill-muted-foreground"
                            tickFormatter={valueFormatter}
                        />
                        {showTooltip && (
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null;
                                    return (
                                        <div
                                            className="border-2 border-black p-2 shadow-hard"
                                            style={{
                                                backgroundColor: tooltipBgColor,
                                                borderColor: tooltipBorderColor,
                                            }}
                                        >
                                            <p className="font-bold mb-1">{label}</p>
                                            {payload.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-black"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <span className="text-sm">
                                                        {entry.dataKey}: {valueFormatter(entry.value as number)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }}
                            />
                        )}
                        {categories.map((category, idx) => (
                            <Line
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stroke={strokeColors[idx] || strokeColors[0]}
                                strokeWidth={2}
                                dot={showDots ? { fill: strokeColors[idx] || strokeColors[0], strokeWidth: 2, r: 4 } : false}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                        ))}
                    </RechartsLineChart>
                </ResponsiveContainer>
            </div>
        );
    }
);
LineChart.displayName = "LineChart";

export { LineChart, type LineChartProps };
