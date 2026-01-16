"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, UserPlus } from "lucide-react";
import { Campaign } from "@/lib/static-data";
import { getSmartRecommendations } from "@/lib/ai-matchmaker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { useData } from "@/context/data-context";
import { formatIDR } from "@/lib/analytics";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SmartMatchDialogProps {
    campaign: Campaign;
}

export function SmartMatchDialog({ campaign }: SmartMatchDialogProps) {
    const { kols, addCampaignDeliverableDB } = useData();
    const [open, setOpen] = useState(false);

    const recommendations = useMemo(() => {
        if (!campaign || !kols.length) return [];
        // Filter out KOLs already in the campaign
        const currentKolIds = new Set(campaign.deliverables.map(d => d.kolId));
        const availableKols = kols.filter(k => !currentKolIds.has(k.id));

        return getSmartRecommendations(availableKols, campaign);
    }, [campaign, kols]); // Re-calc when data changes

    const handleAdd = async (kolId: string) => {
        await addCampaignDeliverableDB(kolId, campaign.id);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/30">
                                <Sparkles className="h-4 w-4" />
                                AI Match
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">AI recommends best KOLs based on campaign goals</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-[600px] flex flex-col p-0 gap-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-zinc-800 dark:shadow-none bg-background sm:rounded-3xl">
                <div className="p-6 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 sm:rounded-t-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            Smart Recommendations
                        </DialogTitle>
                        <DialogDescription className="text-zinc-600 dark:text-zinc-400">
                            AI-ranked influencers based on objectives and budget.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="h-[60vh] p-6 bg-white dark:bg-black">
                    <div className="space-y-4 pr-4">
                        {recommendations.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-zinc-200 rounded-xl">
                                No specific recommendations found.
                            </div>
                        ) : (
                            recommendations.map(({ kol, score, reasons }) => (
                                <div
                                    key={kol.id}
                                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="relative shrink-0">
                                            <Avatar className="h-14 w-14 border-2 border-black shadow-sm">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.id}`} />
                                                <AvatarFallback>{kol.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-3 -right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]">
                                                {score}%
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <h4 className="font-bold text-lg leading-none">{kol.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 border-black rounded-md bg-zinc-100">
                                                        {kol.category}
                                                    </Badge>
                                                    <TierBadge
                                                        tier={(kol.followers || 0) >= 1000000 ? "Mega-Tier" :
                                                            (kol.followers || 0) >= 100000 ? "Macro-Tier" :
                                                                (kol.followers || 0) >= 10000 ? "Micro-Tier" : "Nano-Tier"}
                                                        className="text-[10px] h-5 px-1.5 py-0"
                                                    />
                                                    <span className="text-xs text-muted-foreground mr-auto">
                                                        {formatIDR(campaign.platform === 'Instagram' ? kol.rateCardReels || 0 : kol.rateCardTiktok || 0)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {reasons.map((reason, i) => (
                                                    <span key={i} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end sm:border-l-2 sm:border-black sm:pl-4 sm:ml-2 border-t-2 sm:border-t-0 border-black pt-3 sm:pt-0 mt-2 sm:mt-0">
                                        <Button
                                            size="sm"
                                            onClick={() => handleAdd(kol.id)}
                                            className="w-full sm:w-auto border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t-2 border-black bg-zinc-100 dark:bg-zinc-900 sm:rounded-b-3xl text-center text-xs text-muted-foreground font-medium">
                    <span className="font-bold text-black dark:text-white">Match Logic:</span> 40% Category Overlap • 30% Objective Alignment • 20% Budget Fit • 10% Platform
                </div>
            </DialogContent>
        </Dialog>
    );
}
