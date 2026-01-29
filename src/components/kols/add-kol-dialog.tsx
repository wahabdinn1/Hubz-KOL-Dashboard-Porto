"use client";

import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Dialog } from "@/components/retroui/Dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/retroui/Button";
import { useData } from "@/context/data-context";
import { Plus, Users, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import { KOL } from "@/lib/static-data";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { kolFormSchema } from "./add-kol/schema";
import { BasicInfoForm } from "./add-kol/basic-info-form";
import { SocialMediaForm } from "./add-kol/social-media-form";
import { RateCardForm } from "./add-kol/rate-card-form";

interface AddKOLDialogProps {
    enableAutoLink?: boolean;
}

export function AddKOLDialog({ enableAutoLink = true }: AddKOLDialogProps) {
    const { kols, addKOL, activeCampaign, addKOLToCampaign } = useData();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [filterTier, setFilterTier] = useState<string>("All");
    const [selectedKOLId, setSelectedKOLId] = useState("");
    
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

    // TanStack Form
    const form = useForm({
        defaultValues: {
            name: "",
            categoryId: "",
            avatar: "",
            tiktokUsername: "",
            tiktokProfileLink: "",
            tiktokFollowers: "",
            instagramUsername: "",
            instagramProfileLink: "",
            instagramFollowers: "",
            rateCardTiktok: "",
            rateCardReels: "",
            rateCardPdfLink: "",
            whatsappNumber: "",
            collaborationType: "PAID" as "PAID" | "AFFILIATE",
            defaultCommissionRate: "",
        },
        validators: {
            onChange: kolFormSchema,
        },
        onSubmit: async ({ value }) => {
            // Determine type based on total followers
            const totalFollowers = Math.max(
                Number(value.tiktokFollowers) || 0,
                Number(value.instagramFollowers) || 0
            );

            const newKOL: KOL = {
                id: `kol-${crypto.randomUUID()}`,
                name: value.name,
                category: 'General', 
                categoryId: value.categoryId,
                followers: totalFollowers,
                avgViews: 0,
                type: totalFollowers > 1000000 ? 'Macro' : totalFollowers < 100000 ? 'Micro' : 'Macro',
                
                tiktokUsername: value.tiktokUsername,
                tiktokProfileLink: value.tiktokProfileLink,
                tiktokFollowers: Number(value.tiktokFollowers) || 0,

                instagramUsername: value.instagramUsername,
                instagramProfileLink: value.instagramProfileLink,
                instagramFollowers: Number(value.instagramFollowers) || 0,

                rateCardTiktok: Number(value.rateCardTiktok) || 0,
                rateCardReels: Number(value.rateCardReels) || 0,
                rateCardPdfLink: value.rateCardPdfLink,
                avatar: value.avatar,
                whatsappNumber: value.whatsappNumber,
                collaborationType: value.collaborationType,
                defaultCommissionRate: Number(value.defaultCommissionRate) || 0
            };

            try {
                await addKOL(newKOL, enableAutoLink);
                if (duplicateWarning) setDuplicateWarning(null);
                setOpen(false);
            } catch (e) {
                console.error("Add KOL failed", e);
                if (typeof e === 'object' && e !== null) {
                    console.error("Error details:", JSON.stringify(e, null, 2));
                    const errorObj = e as { message?: string };
                    if (errorObj.message) console.error("Error message:", errorObj.message);
                }
            }
            form.reset();
        },
    });

    // Filter KOLs logic remains same
    const availableKOLs = useMemo(() => {
        if (!activeCampaign || !enableAutoLink) return kols;
        const existingIds = activeCampaign.deliverables.map(d => d.kolId);
        let validKols = kols.filter(k => !existingIds.includes(k.id));
        if (filterTier !== "All") {
            validKols = validKols.filter(k => k.type === filterTier);
        }
        return validKols;
    }, [kols, activeCampaign, enableAutoLink, filterTier]);

    const handleSubmitExisting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKOLId) return;
        await addKOLToCampaign(selectedKOLId);
        setOpen(false);
        setSelectedKOLId("");
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Dialog.Trigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> {enableAutoLink ? "Add Influencer" : "New Profile"}
                            </Button>
                        </Dialog.Trigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Add an influencer to this campaign or create a new profile</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <Dialog.Content className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <Dialog.Header>
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold leading-none">{enableAutoLink ? "Add to Campaign" : "Create Influencer Profile"}</span>
                        <Dialog.Description className="text-sm text-muted-foreground font-normal">
                             {enableAutoLink ? "Select from database or create new." : "Add a new influencer to the global directory."}
                        </Dialog.Description>
                    </div>
                </Dialog.Header>

                {/* Toggle Mode */}
                {enableAutoLink && (
                    <div className="flex gap-2 my-2 p-1 bg-muted rounded-lg">
                        <Button variant={mode === "existing" ? "default" : "ghost"} className="flex-1" onClick={() => setMode("existing")} type="button">
                            <Users className="w-4 h-4 mr-2" /> From Database
                        </Button>
                        <Button variant={mode === "new" ? "default" : "ghost"} className="flex-1" onClick={() => setMode("new")} type="button">
                            <UserPlus className="w-4 h-4 mr-2" /> Create New
                        </Button>
                    </div>
                )}

                {enableAutoLink && mode === "existing" ? (
                    <form onSubmit={handleSubmitExisting} className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Filter by Tier</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={filterTier}
                                onChange={(e) => {
                                    setFilterTier(e.target.value);
                                    setSelectedKOLId(""); 
                                }}
                            >
                                <option value="All">All Tiers</option>
                                <option value="Nano">Nano (1k - 10k)</option>
                                <option value="Micro">Micro (10k - 100k)</option>
                                <option value="Macro">Macro (100k - 1M)</option>
                                <option value="Mega">Mega (1M+)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Influencer</Label>
                            {availableKOLs.length === 0 ? (
                                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                    {filterTier !== 'All' ? `No ${filterTier} influencers available.` : "All your influencers are already in this campaign."}
                                </p>
                            ) : (
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedKOLId} onChange={(e) => setSelectedKOLId(e.target.value)} required>
                                    <option value="" disabled>Select an influencer...</option>
                                    {availableKOLs.map(k => (
                                        <option key={k.id} value={k.id}>{k.name} ({k.category} - {k.type})</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <Dialog.Footer>
                            <Button type="submit" disabled={!selectedKOLId}>Add to Campaign</Button>
                        </Dialog.Footer>
                    </form>
                ) : (
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }} 
                        className="py-4 grid gap-6"
                    >
                        {duplicateWarning && (
                            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                <AlertTriangle className="h-4 w-4 mt-0.5" />
                                <span>{duplicateWarning}</span>
                            </div>
                        )}

                        <BasicInfoForm form={form} setDuplicateWarning={setDuplicateWarning} />
                        <SocialMediaForm form={form} />
                        <RateCardForm form={form} />

                        <Dialog.Footer className="mt-4">
                            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                                {([canSubmit, isSubmitting]) => (
                                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                        {isSubmitting ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                        ) : (
                                            enableAutoLink ? "Create & Add" : "Create Profile"
                                        )}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </Dialog.Footer>
                    </form>
                )}
            </Dialog.Content>
        </Dialog >
    );
}
