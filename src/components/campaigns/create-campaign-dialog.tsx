"use client";

import { useState } from "react";
import { Plus, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/retroui/Button";
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
import { useData } from "@/context/data-context";
import { CurrencyInput } from "@/components/ui/currency-input";
import { CAMPAIGN_TEMPLATES } from "@/lib/campaign-templates";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

// Zod Schema
const campaignFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    budget: z.string().min(1, "Budget is required"),
    platform: z.enum(["TikTok", "Instagram"]),
    objective: z.enum(["AWARENESS", "CONVERSION"]),
    startDate: z.string(),
    endDate: z.string(),
});

export function CreateCampaignDialog() {
    const { addCampaign } = useData();
    const [open, setOpen] = useState(false);

    const form = useForm({
        defaultValues: {
            name: "",
            budget: "",
            platform: "TikTok" as "TikTok" | "Instagram",
            objective: "AWARENESS" as "AWARENESS" | "CONVERSION",
            startDate: "",
            endDate: "",
        },
        validators: {
            onChange: campaignFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await addCampaign(
                    value.name,
                    parseFloat(value.budget) || 0,
                    value.platform,
                    value.objective,
                    value.startDate || "",
                    value.endDate || ""
                );
                setOpen(false);
                form.reset();
            } catch (error) {
                console.error("Failed to create campaign", error);
            }
        },
    });

    const handleTemplateChange = (templateId: string) => {
        const template = CAMPAIGN_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            form.setFieldValue("name", template.name);
            if (template.defaultValues.platform) form.setFieldValue("platform", template.defaultValues.platform);
            if (template.defaultValues.budget) form.setFieldValue("budget", template.defaultValues.budget.toString());
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Valid Campaign</DialogTitle>
                    <DialogDescription>
                        Set up a new campaign to track KOL performance.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        {/* Template Selector */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="template" className="col-span-1 text-right flex items-center justify-end gap-1">
                                Template
                                <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                        <TooltipTrigger type="button" tabIndex={-1}>
                                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="text-xs max-w-[200px]">Pre-fill form with common campaign configurations</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Label>
                            <div className="col-span-3">
                                <select
                                    id="template"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                >
                                    <option value="">-- Select a template (optional) --</option>
                                    {CAMPAIGN_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id} title={t.description}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Name</Label>
                            <div className="col-span-3">
                                <form.Field name="name">
                                    {(field) => (
                                        <FormInput
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="e.g., Summer Sale 2025"
                                            error={field.state.meta.errors ? field.state.meta.errors.join(", ") : undefined}
                                            className="w-full"
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Budget (IDR)</Label>
                            <div className="col-span-3">
                                <form.Field name="budget">
                                    {(field) => (
                                        <div className="space-y-2">
                                            <CurrencyInput
                                                value={field.state.value}
                                                onValueChange={(val) => field.handleChange(val.toString())}
                                                placeholder="50.000.000"
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
                            <Label className="text-right">Platform</Label>
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
                            <Label className="text-right">Objective</Label>
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
                            <Label className="text-right">Start Date</Label>
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
                            <Label className="text-right">End Date</Label>
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

                    <DialogFooter>
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                    {isSubmitting ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                                    ) : (
                                        "Create Campaign"
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
