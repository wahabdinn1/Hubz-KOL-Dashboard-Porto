"use client";

import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Pencil, Loader2 } from "lucide-react";
import { KOL } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

interface EditKOLDialogProps {
    kol: KOL;
}

// Zod Schema
const kolFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    categoryId: z.string().min(1, "Category is required"),
    avatar: z.string(),
    
    tiktokUsername: z.string(),
    tiktokProfileLink: z.string(),
    tiktokFollowers: z.string(),
    
    instagramUsername: z.string(),
    instagramProfileLink: z.string(),
    instagramFollowers: z.string(),
    
    rateCardTiktok: z.string(),
    rateCardReels: z.string(),
    rateCardPdfLink: z.string(),
    
    whatsappNumber: z.string(),
    collaborationType: z.enum(["PAID", "AFFILIATE"]),
    defaultCommissionRate: z.string(),
});

export function EditKOLDialog({ kol }: EditKOLDialogProps) {
    const { updateKOL, categories } = useData();
    const [open, setOpen] = useState(false);
    const [fetchingTikTok, setFetchingTikTok] = useState(false);
    const [fetchingInstagram, setFetchingInstagram] = useState(false);

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
            const totalFollowers = Math.max(
                Number(value.tiktokFollowers) || 0,
                Number(value.instagramFollowers) || 0
            );

            try {
                await updateKOL(kol.id, {
                    name: value.name,
                    categoryId: value.categoryId,
                    followers: totalFollowers,
                    // Removed avgViews reset to preserve existing data
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
                });

                setOpen(false);
            } catch (e) {
                // Error handled by global toast
                console.error("Update KOL failed", e);
            }
        },
    });

    // Populate form when dialog opens
    useEffect(() => {
        if (open) {
            form.reset();
            // Use setTimeout to ensure form is ready
            setTimeout(() => {
                form.setFieldValue("name", kol.name);
                form.setFieldValue("categoryId", kol.categoryId || "");
                form.setFieldValue("avatar", kol.avatar || "");
                form.setFieldValue("tiktokUsername", kol.tiktokUsername || "");
                form.setFieldValue("tiktokProfileLink", kol.tiktokProfileLink || "");
                form.setFieldValue("tiktokFollowers", (kol.tiktokFollowers || 0).toString());
                form.setFieldValue("instagramUsername", kol.instagramUsername || "");
                form.setFieldValue("instagramProfileLink", kol.instagramProfileLink || "");
                form.setFieldValue("instagramFollowers", (kol.instagramFollowers || 0).toString());
                form.setFieldValue("rateCardTiktok", (kol.rateCardTiktok || 0).toString());
                form.setFieldValue("rateCardReels", (kol.rateCardReels || 0).toString());
                form.setFieldValue("rateCardPdfLink", kol.rateCardPdfLink || "");
                form.setFieldValue("whatsappNumber", kol.whatsappNumber || "");
                form.setFieldValue("collaborationType", kol.collaborationType || "PAID");
                form.setFieldValue("defaultCommissionRate", (kol.defaultCommissionRate || 0).toString());
            }, 0);
        }
    }, [open, kol, form]);

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Influencer</DialogTitle>
                    <DialogDescription>
                        Update details for {kol.name}.
                    </DialogDescription>
                </DialogHeader>

                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }} 
                    className="py-4 grid gap-6"
                >
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
                                            <AvatarFallback>{form.getFieldValue("name")?.charAt(0) || "K"}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2 flex-1">
                                            <FormInput
                                                label="Avatar URL"
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
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">TikTok</h3>
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
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="https://www.tiktok.com/@..."
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </div>
                    </div>

                    {/* --- Instagram --- */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Instagram</h3>
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
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="https://www.instagram.com/..."
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
                                                <FormInput
                                                    label="PDF Rate Card (URL)"
                                                    value={field.state.value || ""}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            )}
                                        </form.Field>
                                    </div>
                                </div>
                            )
                        )}
                    </form.Subscribe>

                    <DialogFooter>
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
