"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";
import { useData } from "@/context/data-context";

export function Breadcrumbs() {
    const pathname = usePathname();
    const { campaigns } = useData();

    if (pathname === "/") return null;

    const pathSegments = pathname.split("/").filter((segment) => segment);

    // Helper to resolve names for IDs
    const resolveName = (segment: string, type: 'campaign' | 'kol' | 'unknown') => {
        if (type === 'campaign') {
            const campaign = campaigns.find(c => c.id === segment);
            return campaign ? campaign.name : segment;
        }
        // Add KOL resolution if needed in future
        return segment;
    };

    return (
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-muted-foreground">
            <Link
                href="/"
                className="flex items-center hover:text-foreground transition-colors"
            >
                <Home className="h-4 w-4" />
            </Link>
            {pathSegments.map((segment, index) => {
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;

                // Determine context for name resolution
                let displayName = segment;
                let type: 'campaign' | 'kol' | 'unknown' = 'unknown';

                // Simple heuristic: if previous segment is "campaigns", this likely is a campaign ID
                if (index > 0 && pathSegments[index - 1] === 'campaigns') {
                    type = 'campaign';
                }

                if (type === 'campaign') {
                    displayName = resolveName(segment, type);
                } else {
                    // Capitalize first letter
                    displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
                }

                return (
                    <Fragment key={href}>
                        <ChevronRight className="mx-2 h-4 w-4" />
                        {isLast ? (
                            <span className="font-medium text-foreground truncate max-w-[200px]">
                                {displayName}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-foreground transition-colors"
                            >
                                {displayName}
                            </Link>
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}
