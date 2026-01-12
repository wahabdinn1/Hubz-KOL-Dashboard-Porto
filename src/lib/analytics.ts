/**
 * Formats a number as IDR currency.
 */
export function formatIDR(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Calculates Engagement Rate (ER).
 * Formula: ((Likes + Comments + Shares) / Views) * 100
 * Or simply (Total Engagements / Views) * 100
 */
export function calculateER(engagements: number, views: number): number {
    if (views === 0) return 0;
    return (engagements / views) * 100;
}

/**
 * Calculates Cost Per Mille (CPM).
 * Formula: (Cost / Total Views) * 1000
 */
export function calculateCPM(cost: number, views: number): number {
    if (views === 0) return 0;
    return (cost / views) * 1000;
}

/**
 * Calculates Cost Per Engagement (CPE).
 * Formula: Cost / Total Engagements
 */
export function calculateCPE(cost: number, engagements: number): number {
    if (engagements === 0) return 0;
    return cost / engagements;
}

/**
 * Calculates Return on Ad Spend (ROAS).
 * Formula: Revenue Generated / Cost
 */
export function calculateROAS(revenue: number, cost: number): number {
    if (cost === 0) return 0;
    return revenue / cost;
}

/**
 * Calculates Return on Investment (ROI).
 * Formula: ((Revenue - Cost) / Cost) * 100
 */
export function calculateROI(revenue: number, cost: number): number {
    if (cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
}

/**
 * Calculates Efficiency Score for KOL Table.
 * Logic: Views per Rp 1,000 Spend
 * Formula: (Views / Cost) * 1000
 */
export function calculateEfficiencyScore(views: number, cost: number): number {
    if (cost === 0) return 0;
    return (views / cost) * 1000;
}

/**
 * Calculates Virality Rate.
 * Formula: (Shares / Views) * 100
 */
export function calculateViralityRate(shares: number, views: number): string {
    if (views === 0) return "0%";
    return ((shares / views) * 100).toFixed(1) + "%";
}

/**
 * Calculates Conversion Rate (CVR).
 * Formula: (Orders / Clicks) * 100
 */
export function calculateCVR(orders: number, clicks: number): string {
    if (clicks === 0) return "0%";
    return ((orders / clicks) * 100).toFixed(2) + "%";
}

export interface CampaignSuccessMetrics {
    performanceLabel: string;
    performanceColor: string;
    primaryMetricLabel: string;
    primaryMetricValue: string;
    secondaryMetricLabel: string;
    secondaryMetricValue: string;
}

/**
 * Calculates Success Metrics based on Campaign Objective.
 */
export function calculateCampaignSuccess(
    objective: 'AWARENESS' | 'CONVERSION',
    totalSpend: number,
    totalRevenue: number,
    totalViews: number,
    shares: number = 0,
    clicks: number = 0,
    orders: number = 0
): CampaignSuccessMetrics {
    if (objective === 'CONVERSION') {
        const roas = calculateROAS(totalRevenue, totalSpend);
        // Success: ROAS > 2.0
        const isSuccess = roas > 2.0;

        // Calculate CVR using helper
        const cvr = calculateCVR(orders, clicks);

        return {
            performanceLabel: isSuccess ? "High Performance" : "Needs Optimization",
            performanceColor: isSuccess ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
            primaryMetricLabel: "ROAS",
            primaryMetricValue: `${roas.toFixed(2)}x`,
            secondaryMetricLabel: "CVR",
            secondaryMetricValue: cvr // Updated to CVR
        };
    } else {
        // AWARENESS
        const cpm = calculateCPM(totalSpend, totalViews);
        const cpv = totalViews > 0 ? totalSpend / totalViews : 0;

        // Calculate Virality Rate using helper
        const viralityRate = calculateViralityRate(shares, totalViews);

        // Success: CPM < 25,000 IDR
        const isSuccess = cpm < 25000;

        return {
            performanceLabel: isSuccess ? "High Performance" : "Standard Performance",
            performanceColor: isSuccess ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
            primaryMetricLabel: "CPM",
            primaryMetricValue: formatIDR(cpm),
            secondaryMetricLabel: "Virality Rate", // Changed from CPV
            secondaryMetricValue: viralityRate
        };
    }
}
