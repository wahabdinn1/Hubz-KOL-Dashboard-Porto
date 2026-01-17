"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useData } from "@/context/data-context";
import {
    Search,
    LayoutDashboard,
    Megaphone,
    Users,
    Settings,
    Calculator,
    User,
    FolderOpen,
} from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const router = useRouter();
    const { campaigns, kols } = useData();

    // Toggle the menu with ⌘K or Ctrl+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // Filter campaigns and KOLs based on search
    const filteredCampaigns = campaigns.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredKOLs = kols.filter((k) =>
        k.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
                <DialogTitle className="sr-only">Command Menu</DialogTitle>
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Search campaigns, influencers, or navigate..."
                            value={search}
                            onValueChange={setSearch}
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[500px] overflow-y-auto overflow-x-hidden">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        {/* Navigation */}
                        <Command.Group heading="Navigation">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/"))}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/campaigns"))}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <Megaphone className="h-4 w-4" />
                                Campaigns
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/influencers"))}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <Users className="h-4 w-4" />
                                Influencers
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/er-calculator"))}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <Calculator className="h-4 w-4" />
                                ER Calculator
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push("/settings"))}
                                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                                <Settings className="h-4 w-4" />
                                Settings
                            </Command.Item>
                        </Command.Group>

                        {/* Campaigns */}
                        {filteredCampaigns.length > 0 && (
                            <Command.Group heading="Campaigns">
                                {filteredCampaigns.slice(0, 5).map((campaign) => (
                                    <Command.Item
                                        key={campaign.id}
                                        onSelect={() =>
                                            runCommand(() => router.push(`/campaigns/${campaign.id}`))
                                        }
                                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <FolderOpen className="h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span>{campaign.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {campaign.platform} • {campaign.objective || "AWARENESS"}
                                            </span>
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Influencers */}
                        {filteredKOLs.length > 0 && (
                            <Command.Group heading="Influencers">
                                {filteredKOLs.slice(0, 5).map((kol) => (
                                    <Command.Item
                                        key={kol.id}
                                        onSelect={() =>
                                            runCommand(() => router.push(`/influencers/${kol.id}`))
                                        }
                                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <User className="h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span>{kol.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {kol.category} • {(kol.followers || 0).toLocaleString()} followers
                                            </span>
                                        </div>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
