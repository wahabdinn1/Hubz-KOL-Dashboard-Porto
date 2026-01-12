"use client";

import { useState, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Plus, Users, UserPlus, AlertTriangle } from "lucide-react";
import { KOL } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";

interface AddKOLDialogProps {
    enableAutoLink?: boolean;
}

export function AddKOLDialog({ enableAutoLink = true }: AddKOLDialogProps) {
    const { kols, addKOL, activeCampaign, addKOLToCampaign, categories } = useData();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [filterTier, setFilterTier] = useState<string>("All");

    // For Existing Mode
    const [selectedKOLId, setSelectedKOLId] = useState("");

    // For New Mode
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        followers: "",
        avgViews: "",

        // TikTok
        tiktokUsername: "",
        tiktokProfileLink: "",
        tiktokFollowers: "",
        rateCardTiktok: "",

        // Instagram
        instagramUsername: "",
        instagramProfileLink: "",
        instagramFollowers: "",
        rateCardReels: "",

        // Other
        rateCardPdfLink: ""
    });
    const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

    // Filter KOLs not in current campaign AND by Tier
    const availableKOLs = useMemo(() => {
        if (!activeCampaign || !enableAutoLink) return kols;

        const existingIds = activeCampaign.deliverables.map(d => d.kolId);
        let validKols = kols.filter(k => !existingIds.includes(k.id));

        if (filterTier !== "All") {
            validKols = validKols.filter(k => k.type === filterTier);
        }

        return validKols;
    }, [kols, activeCampaign, enableAutoLink, filterTier]);

    const handleNameBlur = () => {
        const exists = kols.some(k => k.name.toLowerCase() === formData.name.trim().toLowerCase());
        if (exists) {
            setDuplicateWarning(`"${formData.name}" already exists. `);
        } else {
            setDuplicateWarning(null);
        }
    };

    const handleSubmitNew = async (e: React.FormEvent) => {
        e.preventDefault();

        // Determine type based on total followers (using primary or max)
        const totalFollowers = Math.max(
            Number(formData.followers) || 0,
            Number(formData.tiktokFollowers) || 0,
            Number(formData.instagramFollowers) || 0
        );

        const newKOL: KOL = {
            id: `kol-${Date.now()}`,
            name: formData.name,
            category: formData.category,
            followers: Number(formData.followers) || 0, // Primary generic
            avgViews: Number(formData.avgViews) || 0,
            type: totalFollowers > 1000000 ? 'Macro' : totalFollowers < 100000 ? 'Micro' : 'Macro', // Fallback logic

            tiktokUsername: formData.tiktokUsername,
            tiktokProfileLink: formData.tiktokProfileLink,
            tiktokFollowers: Number(formData.tiktokFollowers) || 0,

            instagramUsername: formData.instagramUsername,
            instagramProfileLink: formData.instagramProfileLink,
            instagramFollowers: Number(formData.instagramFollowers) || 0,

            rateCardTiktok: Number(formData.rateCardTiktok) || 0,
            rateCardReels: Number(formData.rateCardReels) || 0,
            rateCardPdfLink: formData.rateCardPdfLink
        };

        await addKOL(newKOL, enableAutoLink);
        resetAndClose();
    };

    const handleSubmitExisting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedKOLId) return;
        await addKOLToCampaign(selectedKOLId);
        resetAndClose();
    }

    const resetAndClose = () => {
        setOpen(false);
        setFormData({
            name: "", category: "", followers: "", avgViews: "",
            tiktokUsername: "", tiktokProfileLink: "", tiktokFollowers: "", rateCardTiktok: "",
            instagramUsername: "", instagramProfileLink: "", instagramFollowers: "", rateCardReels: "",
            rateCardPdfLink: ""
        });
        setSelectedKOLId("");
        setDuplicateWarning(null);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            // Auto-fill TikTok Profile Link (Strict Sync)
            if (name === "tiktokUsername") {
                if (value) {
                    const cleanUser = value.replace(/^@/, '');
                    newData.tiktokProfileLink = `https://www.tiktok.com/@${cleanUser}`;
                } else {
                    newData.tiktokProfileLink = "";
                }
            }

            // Auto-fill Instagram Profile Link (Strict Sync)
            if (name === "instagramUsername") {
                if (value) {
                    const cleanUser = value.replace(/^@/, '');
                    newData.instagramProfileLink = `https://www.instagram.com/${cleanUser}/`;
                } else {
                    newData.instagramProfileLink = "";
                }
            }

            return newData;
        });
        if (name === "name") setDuplicateWarning(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {enableAutoLink ? "Add Influencer" : "New Profile"}
                </Button>
            </DialogTrigger>
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

                        {/* Tier Filter */}
                        <div className="space-y-2">
                            <Label>Filter by Tier</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={filterTier}
                                onChange={(e) => {
                                    setFilterTier(e.target.value);
                                    setSelectedKOLId(""); // Reset selection on filter change
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
                    <form onSubmit={handleSubmitNew} className="py-4 grid gap-6">
                        {duplicateWarning && (
                            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-md flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                                <AlertTriangle className="h-4 w-4 mt-0.5" />
                                <span>{duplicateWarning}</span>
                            </div>
                        )}

                        {/* --- Basic Info --- */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} onBlur={handleNameBlur} required placeholder="e.g. Jane Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    {categories.length > 0 ? (
                                        <select id="category" name="category" value={formData.category} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    ) : (
                                        <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avgViews">Avg. Views (General)</Label>
                                    <Input id="avgViews" name="avgViews" type="number" value={formData.avgViews} onChange={handleChange} required placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="followers">Total Reach (Main)</Label>
                                    <Input id="followers" name="followers" type="number" value={formData.followers} onChange={handleChange} required placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* --- TikTok --- */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                TikTok
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tiktokUsername">Username</Label>
                                    <Input id="tiktokUsername" name="tiktokUsername" value={formData.tiktokUsername} onChange={handleChange} placeholder="@username" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tiktokFollowers">Followers</Label>
                                    <Input id="tiktokFollowers" name="tiktokFollowers" type="number" value={formData.tiktokFollowers} onChange={handleChange} placeholder="0" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="tiktokProfileLink">Profile Link</Label>
                                    <Input
                                        id="tiktokProfileLink"
                                        name="tiktokProfileLink"
                                        value={formData.tiktokProfileLink}
                                        readOnly
                                        className="bg-muted text-muted-foreground cursor-not-allowed"
                                        placeholder="Auto-generated from username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- Instagram --- */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                                Instagram
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="instagramUsername">Username</Label>
                                    <Input id="instagramUsername" name="instagramUsername" value={formData.instagramUsername} onChange={handleChange} placeholder="@username" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="instagramFollowers">Followers</Label>
                                    <Input id="instagramFollowers" name="instagramFollowers" type="number" value={formData.instagramFollowers} onChange={handleChange} placeholder="0" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="instagramProfileLink">Profile Link</Label>
                                    <Input
                                        id="instagramProfileLink"
                                        name="instagramProfileLink"
                                        value={formData.instagramProfileLink}
                                        readOnly
                                        className="bg-muted text-muted-foreground cursor-not-allowed"
                                        placeholder="Auto-generated from username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- Rates --- */}
                        <div className="space-y-4 border-t pt-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rate Card (IDR)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rateCardTiktok">TikTok Video</Label>
                                    <CurrencyInput id="rateCardTiktok" value={formData.rateCardTiktok} onValueChange={(val) => setFormData(p => ({ ...p, rateCardTiktok: val.toString() }))} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rateCardReels">IG Reels</Label>
                                    <CurrencyInput id="rateCardReels" value={formData.rateCardReels} onValueChange={(val) => setFormData(p => ({ ...p, rateCardReels: val.toString() }))} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rateCardPdfLink">PDF Rate Card (URL)</Label>
                                    <Input id="rateCardPdfLink" name="rateCardPdfLink" value={formData.rateCardPdfLink} onChange={handleChange} placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <Button type="submit">{enableAutoLink ? "Create & Add" : "Create Profile"}</Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
