"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface KOLRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
}

export function KOLRating({ rating, onRate, size = "md", readonly = false }: KOLRatingProps) {
    const [hovered, setHovered] = useState(0);

    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={cn(
                        "focus:outline-none transition-transform",
                        !readonly && "hover:scale-110 cursor-pointer",
                        readonly && "cursor-default"
                    )}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => !readonly && onRate?.(star)}
                    disabled={readonly}
                    aria-label={`Rate ${star} stars`}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            (hovered || rating) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                        )}
                    />
                </button>
            ))}
            {rating > 0 && (
                <span className="ml-1 text-sm text-muted-foreground">
                    ({rating}/5)
                </span>
            )}
        </div>
    );
}
