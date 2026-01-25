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
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";
import { FormInput } from "@/components/ui/form-fields";

interface EditDeliverableDialogProps {
    campaignId: string;
    kolId: string;
    initialMetrics: {
        videosCount: number;
        totalViews: number;
        totalEngagements: number;
        salesGenerated: number;
        contentLink?: string;
        collaborationType?: 'PAID' | 'AFFILIATE';
        fixedFee?: number;
        commissionRate?: number;
    };
    kolName: string;
}

// Zod Schema
const deliverableFormSchema = z.object({
    videosCount: z.string(),
    totalViews: z.string(),
    totalEngagements: z.string(),
    salesGenerated: z.string(),
    contentLink: z.string(),
    collaborationType: z.enum(['PAID', 'AFFILIATE']),
    fixedFee: z.string(),
    commissionRate: z.string(),
});

export function EditDeliverableDialog({ campaignId, kolId, initialMetrics, kolName }: EditDeliverableDialogProps) {
    const { updateCampaignDeliverableDB } = useData();
    const [open, setOpen] = useState(false);

    const form = useForm({
        defaultValues: {
            videosCount: "0",
            totalViews: "0",
            totalEngagements: "0",
            salesGenerated: "0",
            contentLink: "",
            collaborationType: "PAID" as "PAID" | "AFFILIATE",
            fixedFee: "0",
            commissionRate: "0",
        },
        validators: {
            onChange: deliverableFormSchema,
        },
        onSubmit: async ({ value }) => {
            await updateCampaignDeliverableDB(campaignId, kolId, {
                videosCount: Number(value.videosCount) || 0,
                totalViews: Number(value.totalViews) || 0,
                totalEngagements: Number(value.totalEngagements) || 0,
                salesGenerated: Number(value.salesGenerated) || 0,
                contentLink: value.contentLink,
                collaborationType: value.collaborationType,
                fixedFee: value.collaborationType === 'PAID' ? Number(value.fixedFee) || 0 : undefined,
                commissionRate: value.collaborationType === 'AFFILIATE' ? Number(value.commissionRate) || 0 : undefined,
            });

            setOpen(false);
        },
    });

    useEffect(() => {
        if (open) {
            form.reset();
            setTimeout(() => {
                form.setFieldValue("videosCount", initialMetrics.videosCount.toString());
                form.setFieldValue("totalViews", initialMetrics.totalViews.toString());
                form.setFieldValue("totalEngagements", initialMetrics.totalEngagements.toString());
                form.setFieldValue("salesGenerated", initialMetrics.salesGenerated.toString());
                form.setFieldValue("contentLink", initialMetrics.contentLink || "");
                form.setFieldValue("collaborationType", initialMetrics.collaborationType || "PAID");
                form.setFieldValue("fixedFee", (initialMetrics.fixedFee || 0).toString());
                form.setFieldValue("commissionRate", (initialMetrics.commissionRate || 0).toString());
            }, 0);
        }
    }, [open, initialMetrics, form]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                    <Pencil className="h-3 w-3 text-slate-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Performance</DialogTitle>
                    <DialogDescription>
                        Update metrics for {kolName}.
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
                        {/* Collaboration Type Selector */}
                        <form.Field name="collaborationType">
                            {(field) => (
                                <div className="space-y-3 pb-4 border-b">
                                    <Label className="text-sm font-semibold">Collaboration Type</Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => field.handleChange("PAID")}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${
                                                field.state.value === 'PAID'
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            💰 PAID
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.handleChange("AFFILIATE")}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${
                                                field.state.value === 'AFFILIATE'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            🤝 AFFILIATE
                                        </button>
                                    </div>

                                    {/* Conditional Fee/Commission Field */}
                                    {field.state.value === 'PAID' ? (
                                        <div className="grid grid-cols-4 items-center gap-4 pt-2">
                                            <Label className="text-right">Fixed Fee</Label>
                                            <div className="col-span-3">
                                                <form.Field name="fixedFee">
                                                    {(subField) => (
                                                        <CurrencyInput
                                                            value={subField.state.value}
                                                            onValueChange={(val) => subField.handleChange(val.toString())}
                                                        />
                                                    )}
                                                </form.Field>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 items-center gap-4 pt-2">
                                            <Label className="text-right">Commission %</Label>
                                            <div className="col-span-3 flex items-center gap-2">
                                                <form.Field name="commissionRate">
                                                    {(subField) => (
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            value={subField.state.value}
                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                            className="flex-1"
                                                            placeholder="10"
                                                        />
                                                    )}
                                                </form.Field>
                                                <span className="text-muted-foreground">%</span>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Auto-Settled</Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Videos</Label>
                            <div className="col-span-3">
                                <form.Field name="videosCount">
                                    {(field) => (
                                        <Input
                                            type="number"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Views</Label>
                            <div className="col-span-3">
                                <form.Field name="totalViews">
                                    {(field) => (
                                        <CurrencyInput
                                            value={field.state.value}
                                            onValueChange={(val) => field.handleChange(val.toString())}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Engage.</Label>
                            <div className="col-span-3">
                                <form.Field name="totalEngagements">
                                    {(field) => (
                                        <CurrencyInput
                                            value={field.state.value}
                                            onValueChange={(val) => field.handleChange(val.toString())}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Sales (IDR)</Label>
                            <div className="col-span-3">
                                <form.Field name="salesGenerated">
                                    {(field) => (
                                        <CurrencyInput
                                            value={field.state.value}
                                            onValueChange={(val) => field.handleChange(val.toString())}
                                        />
                                    )}
                                </form.Field>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Link</Label>
                            <div className="col-span-3">
                                <form.Field name="contentLink">
                                    {(field) => (
                                        <FormInput
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            placeholder="https://tiktok.com/..."
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
