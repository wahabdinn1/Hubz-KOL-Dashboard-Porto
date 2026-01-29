"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Briefcase, Users, Settings } from "lucide-react";

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    { href: "/", label: "Home", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/campaigns", label: "Campaigns", icon: <Briefcase className="h-5 w-5" /> },
    { href: "/influencers", label: "Influencers", icon: <Users className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    // Check if current path matches (including nested routes)
    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-black md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs font-medium transition-all min-w-[64px]",
                                active
                                    ? "text-foreground font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center w-10 h-7 rounded-full transition-all border-2 border-transparent",
                                    active && "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none translate-y-[-2px]"
                                )}
                            >
                                {item.icon}
                            </div>
                            <span className={cn(active && "font-bold scale-105 origin-top transition-transform")}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
