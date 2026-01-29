"use client";

import { cn } from "@/lib/utils";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn(
            "animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out"
        )}>
            {children}
        </div>
    );
}
