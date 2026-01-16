"use client";

import { cn } from "@/lib/utils";
import React from "react";
import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: Record<string, string | number>[];
    index: string;
    categories: string[];
    strokeColors?: string[];
    fillColors?: string[];
    tooltipBgColor?: string;
    tooltipBorderColor?: string;
    gridColor?: string;
    valueFormatter?: (value: number) => string;
    xAxisFormatter?: (value: string) => string;
    yAxisFormatter?: (value: number) => string;
    showGrid?: boolean;
    showTooltip?: boolean;
    stacked?: boolean;
    alignment?: "vertical" | "horizontal";
    className?: string; // Explicitly included in interface
    yAxisWidth?: number;
    rotateLabel?: boolean;
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
    (
        {
            data = [],
            index,
            categories = [],
            strokeColors = ["var(--foreground)"],
            fillColors = ["var(--primary)", "var(--secondary)"],
            // tooltipBgColor = "var(--background)", // Unused
            // tooltipBorderColor = "var(--border)", // Unused
            gridColor = "var(--muted)",
            valueFormatter = (value: number) => value.toString(),
            xAxisFormatter,
            yAxisFormatter,
            showGrid = true,
            showTooltip = true,
            stacked = false,
            alignment = "vertical",
            className,
            yAxisWidth = 60,
            ...props
        },
        ref
    ) => {
        return (
            <div ref={ref} className={cn("h-80 w-full", className)} {...props}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                        data={data}
                        layout={alignment === "horizontal" ? "vertical" : undefined}
                        margin={{ top: 10, right: 30, left: 0, bottom: props.rotateLabel ? 60 : 0 }}
                    >
                        {showGrid && (
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        )}

                        {alignment === "horizontal" ? (
                            <>
                                <XAxis
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-muted-foreground"
                                    tickFormatter={valueFormatter}
                                />
                                <YAxis
                                    type="category"
                                    dataKey={index}
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-muted-foreground"
                                    width={80}
                                />
                            </>
                        ) : (
                            <>
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-muted-foreground"
                                    tickFormatter={yAxisFormatter || valueFormatter}
                                    width={yAxisWidth}
                                    allowDecimals={false}
                                    tickCount={5}
                                />
                                <XAxis
                                    dataKey={index}
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-muted-foreground"
                                    interval={props.rotateLabel ? 0 : "preserveStartEnd"}
                                    height={props.rotateLabel ? 70 : 30}
                                    tickFormatter={xAxisFormatter}
                                    tick={
                                        props.rotateLabel
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            ? ({ angle: -45, textAnchor: "end", fontSize: 10 } as any)
                                            : undefined
                                    }
                                />
                            </>
                        )}

                        {showTooltip && (
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (!active || !payload?.length) return null;
                                    return (
                                        <div className="rounded-lg border-2 border-border p-3 shadow-lg bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-slate-400 dark:text-slate-500">
                                                        {index}
                                                    </span>
                                                    <span className="font-bold">
                                                        {label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    {payload.map((entry, idx) => (
                                                        <div key={idx} className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-slate-400 dark:text-slate-500">
                                                                {entry.dataKey}
                                                            </span>
                                                            <span className="font-bold text-emerald-400 dark:text-emerald-600">
                                                                {valueFormatter(entry.value as number)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        )}

                        {categories.map((category, index) => {
                            const fillColor = fillColors[index] || fillColors[0];
                            const strokeColor = strokeColors[index] || strokeColors[0];

                            return (
                                <Bar
                                    key={category}
                                    dataKey={category}
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth={1}
                                    stackId={stacked ? "strokeId" : undefined}
                                    radius={[4, 4, 0, 0]}
                                />
                            );
                        })}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        );
    }
);
BarChart.displayName = "BarChart";

export { BarChart, type BarChartProps };
