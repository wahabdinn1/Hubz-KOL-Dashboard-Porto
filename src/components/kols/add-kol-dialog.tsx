"use client";

import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/retroui/Button";
import { useData } from "@/context/data-context";
import { Plus, Users, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import { KOL } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

interface AddKOLDialogProps {
    enableAutoLink?: boolean;
}

// Zod Schema
const kolFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    categoryId: z.string().min(1, "Category is required"),
    avatar: z.string(),
    
    // TikTok
    tiktokUsername: z.string(),
    tiktokProfileLink: z.string(),
    tiktokFollowers: z.string(),
    
    // Instagram
    instagramUsername: z.string(),
    instagramProfileLink: z.string(),
    instagramFollowers: z.string(),
    
    // Rates
    rateCardTiktok: z.string(),
    rateCardReels: z.string(),
    rateCardPdfLink: z.string(),
    
    // WhatsApp
    whatsappNumber: z.string(),
    
    // Collaboration
    collaborationType: z.enum(["PAID", "AFFILIATE"]),
    defaultCommissionRate: z.string(),
});

export function AddKOLDialog({ enableAutoLink = true }: AddKOLDialogProps) {
    const { kols, addKOL, activeCampaign, addKOLToCampaign, categories } = useData();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [filterTier, setFilterTier] = useState<string>("All");
    const [selectedKOLId, setSelectedKOLId] = useState("");
    
    const [fetchingTikTok, setFetchingTikTok] = useState(false);
    const [fetchingInstagram, setFetchingInstagram] = useState(false);
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
                id: `kol-${Date.now()}`,
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
            }
            form.reset();
        },
    });

    // Fetch TikTok data
    const fetchTikTokData = async () => {
        const username = form.getFieldValue("tiktokUsername");
        if (!username) return;
        
        setFetchingTikTok(true);
        try {
            const response = await fetch(`/api/tiktok/stalk?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                form.setFieldValue("tiktokFollowers", data.data.followers?.toString() || "");
                form.setFieldValue("name", form.getFieldValue("name") || data.data.nickname || "");
                form.setFieldValue("avatar", data.data.avatar || form.getFieldValue("avatar"));
            }
        } catch (error) {
            console.error('Failed to fetch TikTok data:', error);
        } finally {
            setFetchingTikTok(false);
        }
    };

    // Fetch Instagram data
    const fetchInstagramData = async () => {
        const username = form.getFieldValue("instagramUsername");
        if (!username) return;

        setFetchingInstagram(true);
        try {
            const cleanUser = username.replace('@', '');
            const response = await fetch(`/api/instagram/profile?username=${encodeURIComponent(cleanUser)}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                form.setFieldValue("instagramFollowers", data.data.followers?.toString() || "");
                form.setFieldValue("name", form.getFieldValue("name") || data.data.full_name || "");
                if (!form.getFieldValue("avatar") && data.data.profile_pic_url) {
                    form.setFieldValue("avatar", `/api/image-proxy?url=${encodeURIComponent(data.data.profile_pic_url)}`);
                }
            }
        } catch (error) {
            console.error('Failed to fetch Instagram data:', error);
        } finally {
            setFetchingInstagram(false);
        }
    };

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
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> {enableAutoLink ? "Add Influencer" : "New Profile"}
                            </Button>
                        </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Add an influencer to this campaign or create a new profile</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{enableAutoLink ? "Add to Campaign" : "Create Influencer Profile"}</DialogTitle>
                    <DialogDescription>
                        {enableAutoLink ? "Select from database or create new." : "Add a new influencer to the global directory."}
                    </DialogDescription>
                </DialogHeader>

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
                        <DialogFooter>
                            <Button type="submit" disabled={!selectedKOLId}>Add to Campaign</Button>
                        </DialogFooter>
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

                        {/* --- Basic Info --- */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                            
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <form.Field name="avatar">
                                    {(field) => (
                                        <>
                                            <Avatar className="h-16 w-16 border">
                                                <AvatarImage src={field.state.value} />
                                                <AvatarFallback>K</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-2 flex-1">
                                                <FormInput
                                                    label="Avatar URL"
                                                    description="Enter a URL or fetch from TikTok to auto-fill."
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </form.Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="name">
                                    {(field) => (
                                        <FormInput
                                            label="Full Name"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={() => {
                                                const exists = kols.some(k => k.name.toLowerCase() === field.state.value.trim().toLowerCase());
                                                setDuplicateWarning(exists ? `"${field.state.value}" already exists.` : null);
                                                field.handleBlur();
                                            }}
                                            error={field.state.meta.errors ? field.state.meta.errors.join(", ") : undefined}
                                            required
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="categoryId">
                                    {(field) => (
                                        categories.length > 0 ? (
                                            <FormSelect
                                                label="Category"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                options={categories.map(c => ({ value: c.id, label: c.name }))}
                                                error={field.state.meta.errors ? field.state.meta.errors.join(", ") : undefined}
                                            />
                                        ) : (
                                            <FormInput
                                                label="Category ID"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                        )
                                    )}
                                </form.Field>

                                <form.Field name="whatsappNumber">
                                    {(field) => (
                                        <FormInput
                                            label="WhatsApp Number"
                                            placeholder="628xxxxxxxxxx"
                                            description="Format: 628xxxxxxxxxx (no + or spaces)"
                                            value={field.state.value || ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    )}
                                </form.Field>
                            </div>

                            {/* Collaboration Type Selector */}
                            <form.Field name="collaborationType">
                                {(field) => (
                                    <div className="space-y-3 pt-4 border-t">
                                        <Label className="text-sm font-semibold">Collaboration Type</Label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => field.handleChange("PAID")}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-sm font-bold ${
                                                    field.state.value === 'PAID'
                                                        ? 'border-black bg-primary text-primary-foreground shadow-hard-sm'
                                                        : 'border-muted bg-transparent hover:border-black/50 text-muted-foreground'
                                                }`}
                                            >
                                                PAID
                                                <span className="block text-[10px] font-normal mt-1 opacity-80">Fixed rate card pricing</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.handleChange("AFFILIATE")}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-sm font-bold ${
                                                    field.state.value === 'AFFILIATE'
                                                        ? 'border-black bg-primary text-primary-foreground shadow-hard-sm'
                                                        : 'border-muted bg-transparent hover:border-black/50 text-muted-foreground'
                                                }`}
                                            >
                                                AFFILIATE
                                                <span className="block text-[10px] font-normal mt-1 opacity-80">Commission-based</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        {/* --- TikTok --- */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                TikTok
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="tiktokUsername">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label>Username</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    value={field.state.value || ""} 
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.handleChange(val);
                                                        // Auto link logic
                                                        if (val) form.setFieldValue("tiktokProfileLink", `https://www.tiktok.com/@${val.replace(/^@/, '')}`);
                                                    }} 
                                                    placeholder="@username" 
                                                    className="flex-1" 
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={fetchTikTokData}
                                                    disabled={!field.state.value || fetchingTikTok}
                                                >
                                                    {fetchingTikTok ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="tiktokFollowers">
                                    {(field) => (
                                        <FormInput
                                            label="Followers"
                                            type="number"
                                            value={field.state.value || ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="0"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="tiktokProfileLink">
                                    {(field) => (
                                        <div className="space-y-2 col-span-2">
                                            <Label>Profile Link</Label>
                                            <Input
                                                value={field.state.value || ""}
                                                readOnly
                                                className="bg-muted text-muted-foreground cursor-not-allowed"
                                                placeholder="Auto-generated from username"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        {/* --- Instagram --- */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                                Instagram
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <form.Field name="instagramUsername">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <Label>Username</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    value={field.state.value || ""} 
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.handleChange(val);
                                                        // Auto link logic
                                                        if (val) form.setFieldValue("instagramProfileLink", `https://www.instagram.com/${val.replace(/^@/, '')}/`);
                                                    }} 
                                                    placeholder="@username" 
                                                    className="flex-1" 
                                                />
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={fetchInstagramData}
                                                    disabled={!field.state.value || fetchingInstagram}
                                                >
                                                    {fetchingInstagram ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </form.Field>

                                <form.Field name="instagramFollowers">
                                    {(field) => (
                                        <FormInput
                                            label="Followers"
                                            type="number"
                                            value={field.state.value || ""}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="0"
                                        />
                                    )}
                                </form.Field>

                                <form.Field name="instagramProfileLink">
                                    {(field) => (
                                        <div className="space-y-2 col-span-2">
                                            <Label>Profile Link</Label>
                                            <Input
                                                value={field.state.value || ""}
                                                readOnly
                                                className="bg-muted text-muted-foreground cursor-not-allowed"
                                                placeholder="Auto-generated from username"
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        {/* --- Rates (Only for PAID) --- */}
                        <form.Subscribe selector={(state) => state.values.collaborationType}>
                            {(collaborationType) => (
                                collaborationType === 'PAID' && (
                                    <div className="space-y-4 border-t pt-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rate Card (IDR)</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <form.Field name="rateCardTiktok">
                                                {(field) => (
                                                    <div className="space-y-2">
                                                        <Label>TikTok Video</Label>
                                                        <CurrencyInput 
                                                            value={field.state.value || ""} 
                                                            onValueChange={(val) => field.handleChange(val.toString())} 
                                                            placeholder="0" 
                                                        />
                                                    </div>
                                                )}
                                            </form.Field>

                                            <form.Field name="rateCardReels">
                                                {(field) => (
                                                    <div className="space-y-2">
                                                        <Label>IG Reels</Label>
                                                        <CurrencyInput 
                                                            value={field.state.value || ""} 
                                                            onValueChange={(val) => field.handleChange(val.toString())} 
                                                            placeholder="0" 
                                                        />
                                                    </div>
                                                )}
                                            </form.Field>

                                            <form.Field name="rateCardPdfLink">
                                                {(field) => (
                                                    <div className="space-y-2">
                                                        <FormInput
                                                            label="PDF Rate Card (URL)"
                                                            value={field.state.value || ""}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                )}
                                            </form.Field>
                                        </div>
                                    </div>
                                )
                            )}
                        </form.Subscribe>

                        <DialogFooter className="mt-4">
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
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog >
    );
}
