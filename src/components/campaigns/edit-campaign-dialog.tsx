"use client";

import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Dialog } from "@/components/retroui/Dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Settings, Loader2 } from "lucide-react";
import { Campaign } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

interface EditCampaignDialogProps {
    campaign: Campaign;
}

// Zod Schema
const campaignFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    budget: z.string().min(1, "Budget is required"),
    platform: z.enum(["TikTok", "Instagram"]),
    objective: z.enum(["AWARENESS", "CONVERSION"]),
    startDate: z.string(),
    endDate: z.string(),
});

export function EditCampaignDialog({ campaign }: EditCampaignDialogProps) {
    const { updateCampaign } = useData();
    const [open, setOpen] = useState(false);

    const form = useForm({
        defaultValues: {
            name: "",
            budget: "",
            platform: "TikTok" as "TikTok" | "Instagram",
            objective: "AWARENESS" as "AWARENESS" | "CONVERSION",
            startDate: "",
            endDate: ""
        },
        validators: {
            onChange: campaignFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateCampaign(campaign.id, {
                    name: value.name,
                    budget: parseFloat(value.budget) || 0,
                    platform: value.platform,
                    objective: value.objective,
                    startDate: value.startDate || undefined,
                    endDate: value.endDate || undefined
                });

                setOpen(false);
            } catch (e) {
                // Error handled by global toast, keep dialog open
                console.error("Update failed", e);
            }
        },
    });

    useEffect(() => {
        if (open) {
            form.reset();
            // Populate form values
            setTimeout(() => {
                form.setFieldValue("name", campaign.name);
                form.setFieldValue("budget", campaign.budget.toString());
                form.setFieldValue("platform", campaign.platform || "TikTok");
                form.setFieldValue("objective", campaign.objective || "AWARENESS");
                form.setFieldValue("startDate", campaign.startDate || "");
                form.setFieldValue("endDate", campaign.endDate || "");
            }, 0);
        }
    }, [open, campaign, form]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
            </Dialog.Trigger>
            <Dialog.Content className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <Dialog.Header>
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold leading-none">Edit Campaign</span>
                        <Dialog.Description className="text-sm text-muted-foreground font-normal">
                            Update details for {campaign.name}.
                        </Dialog.Description>
                    </div>
                </Dialog.Header>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <div className="col-span-3">
                                <form.Field name="name">
                                    {(field) => (
                                        <FormInput
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={field.state.meta.errors ? field.state.meta.errors.join(", ") : undefined}
                                            required
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right">Budget (IDR)</Label>
                            <div className="col-span-3">
                                <form.Field name="budget">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <CurrencyInput
                                                value={field.state.value}
                                                onValueChange={(val) => field.handleChange(val.toString())}
                                                required
                                            />
                                            {field.state.meta.errors && (
                                                <p className="text-xs text-red-500">{field.state.meta.errors.join(", ")}</p>
                                            )}
                                        </div>
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="platform" className="text-right">Platform</Label>
                            <div className="col-span-3">
                                <form.Field name="platform">
                                    {(field) => (
                                        <FormSelect
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value as "TikTok" | "Instagram")}
                                            options={[
                                                { value: "TikTok", label: "TikTok" },
                                                { value: "Instagram", label: "Instagram" }
                                            ]}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="objective" className="text-right">Objective</Label>
                            <div className="col-span-3">
                                <form.Field name="objective">
                                    {(field) => (
                                        <FormSelect
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value as "AWARENESS" | "CONVERSION")}
                                            options={[
                                                { value: "AWARENESS", label: "Awareness (CPM Focus)" },
                                                { value: "CONVERSION", label: "Conversion (ROAS Focus)" }
                                            ]}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">Start Date</Label>
                            <div className="col-span-3">
                                <form.Field name="startDate">
                                    {(field) => (
                                        <Input
                                            type="date"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">End Date</Label>
                            <div className="col-span-3">
                                <form.Field name="endDate">
                                    {(field) => (
                                        <Input
                                            type="date"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>
                    </div>

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
