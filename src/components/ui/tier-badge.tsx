import { Badge } from "@/components/ui/badge";

interface TierBadgeProps {
    tier: string;
    className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
    // Normalize string to handle case sensitivity or partial matches if needed
    // But our app now consistently uses "Nano-Tier", etc.

    let variantStyles = "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300"; // Default (Nano)

    if (tier.includes("Mega")) {
        variantStyles = "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    } else if (tier.includes("Macro")) {
        variantStyles = "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    } else if (tier.includes("Micro")) {
        variantStyles = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    }

    return (
        <Badge
            variant="outline"
            className={`font-medium border ${variantStyles} ${className}`}
        >
            {tier}
        </Badge>
    );
}
