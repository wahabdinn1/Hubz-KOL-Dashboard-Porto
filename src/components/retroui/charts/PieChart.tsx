"use client";


import { cn } from "@/lib/utils";
import React from "react";
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

interface PieChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: { name: string; value: number; color?: string }[];
    innerRadius?: number;
    outerRadius?: number;
    showLegend?: boolean;
    showTooltip?: boolean;
    valueFormatter?: (value: number) => string;
    colors?: string[];
    className?: string;
}

const DEFAULT_COLORS = [
    "#a3e635", // lime (primary)
    "#8b5cf6", // purple
    "#f97316", // orange
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#eab308", // yellow
];

const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
    (
        {
            data = [],
            innerRadius = 0,
            outerRadius = 80,
            showLegend = true,
            showTooltip = true,
            valueFormatter = (value: number) => value.toString(),
            colors = DEFAULT_COLORS,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <div ref={ref} className={cn("h-64 w-full", className)} {...props}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={innerRadius}
                            outerRadius={outerRadius}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="#000"
                            strokeWidth={2}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || colors[index % colors.length]}
                                />
                            ))}
                        </Pie>
                        {showTooltip && (
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const item = payload[0];
                                    return (
                                        <div
                                            className="border-2 border-black p-2 shadow-hard bg-background"
                                        >
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-muted-foreground">
                                                {valueFormatter(item.value as number)}
                                            </p>
                                        </div>
                                    );
                                }}
                            />
                        )}
                        {showLegend && (
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-sm text-foreground">{value}</span>
                                )}
                            />
                        )}
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        );
    }
);
PieChart.displayName = "PieChart";

export { PieChart, type PieChartProps };
