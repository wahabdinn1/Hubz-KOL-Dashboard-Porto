"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Dialog } from "@/components/retroui/Dialog";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Pencil, Loader2, AlertTriangle } from "lucide-react";
import { KOL } from "@/lib/static-data";
import { kolFormSchema } from "./add-kol/schema";
import { BasicInfoForm } from "./add-kol/basic-info-form";
import { SocialMediaForm } from "./add-kol/social-media-form";
import { RateCardForm } from "./add-kol/rate-card-form";

interface EditKOLDialogProps {
    kol: KOL;
}

export function EditKOLDialog({ kol }: EditKOLDialogProps) {
    const { updateKOL } = useData();
    const [open, setOpen] = useState(false);
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

                if (duplicateWarning) setDuplicateWarning(null);
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <Dialog.Header>
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold leading-none">Edit Influencer</span>
                        <Dialog.Description className="text-sm text-muted-foreground font-normal">
                             Update details for {kol.name}.
                        </Dialog.Description>
                    </div>
                </Dialog.Header>

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

                    <BasicInfoForm form={form} setDuplicateWarning={setDuplicateWarning} currentKolId={kol.id} />
                    <SocialMediaForm form={form} />
                    <RateCardForm form={form} />

                    <Dialog.Footer>
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
                    </Dialog.Footer>
                </form>
            </Dialog.Content>
        </Dialog>
    );
}
