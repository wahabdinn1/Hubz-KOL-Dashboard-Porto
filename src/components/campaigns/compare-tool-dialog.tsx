"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/context/data-context";
import { formatIDR } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/utils";
import { TierBadge } from "@/components/ui/tier-badge";
import { KOL } from "@/lib/static-data";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompareToolDialogProps {
    selectedKols?: KOL[];
}

export function CompareToolDialog({ selectedKols: initialKols }: CompareToolDialogProps) {
    const { kols } = useData();
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>(
        initialKols?.map((k) => k.id) || []
    );

    const selectedKols = kols.filter((k) => selectedIds.includes(k.id));

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else if (selectedIds.length < 3) {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getTier = (kol: KOL): "Mega-Tier" | "Macro-Tier" | "Micro-Tier" | "Nano-Tier" => {
        const followers = kol.followers || 0;
        if (followers >= 1_000_000) return "Mega-Tier";
        if (followers >= 100_000) return "Macro-Tier";
        if (followers >= 10_000) return "Micro-Tier";
        return "Nano-Tier";
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Scale className="h-3 w-3 mr-1" />
                                Compare
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Compare up to 3 KOLs side-by-side</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Influencer Comparison Tool</DialogTitle>
                    <DialogDescription>
                        Select up to 3 influencers to compare side-by-side.
                    </DialogDescription>
                </DialogHeader>

                {/* Selection Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 max-h-40 overflow-y-auto border rounded-md p-2">
                    {kols.map((kol) => (
                        <button
                            key={kol.id}
                            onClick={() => handleToggle(kol.id)}
                            className={`p-2 text-left text-sm rounded-md border transition-colors ${selectedIds.includes(kol.id)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted"
                                }`}
                            disabled={!selectedIds.includes(kol.id) && selectedIds.length >= 3}
                        >
                            {kol.name}
                        </button>
                    ))}
                </div>

                {/* Comparison Cards */}
                {selectedKols.length > 0 ? (
                    <div className={`grid gap-4 ${selectedKols.length === 1 ? 'grid-cols-1' : selectedKols.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {selectedKols.map((kol) => (
                            <Card key={kol.id} className="border-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{kol.name}</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <TierBadge tier={getTier(kol)} />
                                        <span className="text-xs text-muted-foreground">{kol.category}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">TikTok</span>
                                        <span className="font-medium">{kol.tiktokFollowers ? formatCompactNumber(kol.tiktokFollowers) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Instagram</span>
                                        <span className="font-medium">{kol.instagramFollowers ? formatCompactNumber(kol.instagramFollowers) : '-'}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">TikTok Rate</span>
                                        <span className="font-medium">{kol.rateCardTiktok ? formatIDR(kol.rateCardTiktok) : '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reels Rate</span>
                                        <span className="font-medium">{kol.rateCardReels ? formatIDR(kol.rateCardReels) : '-'}</span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Reach</span>
                                        <span className="font-medium">{formatCompactNumber(kol.followers || 0)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Select influencers above to compare.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
