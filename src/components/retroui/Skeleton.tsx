"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "circular" | "text";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "animate-pulse bg-muted border-2 border-border",
                    variant === "circular" && "rounded-full",
                    variant === "text" && "h-4 rounded-sm",
                    variant === "default" && "rounded-md",
                    className
                )}
                {...props}
            />
        );
    }
);
Skeleton.displayName = "Skeleton";

// Pre-built skeleton patterns for common use cases
const SkeletonCard = ({ className }: { className?: string }) => (
    <div className={cn("p-4 space-y-3", className)}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
    </div>
);

const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
    <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
        ))}
    </div>
);

const SkeletonAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
    };
    return <Skeleton variant="circular" className={sizeClasses[size]} />;
};

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonAvatar };
