"use client";

import { useState, useEffect } from "react";
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
import { Pencil } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Badge } from "@/components/ui/badge";

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

export function EditDeliverableDialog({ campaignId, kolId, initialMetrics, kolName }: EditDeliverableDialogProps) {
    const { updateCampaignDeliverableDB } = useData();
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        videosCount: "",
        totalViews: "",
        totalEngagements: "",
        salesGenerated: "",
        contentLink: "",
        collaborationType: "PAID" as 'PAID' | 'AFFILIATE',
        fixedFee: "",
        commissionRate: "",
    });

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setFormData({
                    videosCount: initialMetrics.videosCount.toString(),
                    totalViews: initialMetrics.totalViews.toString(),
                    totalEngagements: initialMetrics.totalEngagements.toString(),
                    salesGenerated: initialMetrics.salesGenerated.toString(),
                    contentLink: initialMetrics.contentLink || "",
                    collaborationType: initialMetrics.collaborationType || "PAID",
                    fixedFee: (initialMetrics.fixedFee || 0).toString(),
                    commissionRate: (initialMetrics.commissionRate || 0).toString(),
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, initialMetrics]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateCampaignDeliverableDB(campaignId, kolId, {
            videosCount: Number(formData.videosCount) || 0,
            totalViews: Number(formData.totalViews) || 0,
            totalEngagements: Number(formData.totalEngagements) || 0,
            salesGenerated: Number(formData.salesGenerated) || 0,
            contentLink: formData.contentLink,
            // NEW: Collaboration type fields
            collaborationType: formData.collaborationType,
            fixedFee: formData.collaborationType === 'PAID' ? Number(formData.fixedFee) || 0 : undefined,
            commissionRate: formData.collaborationType === 'AFFILIATE' ? Number(formData.commissionRate) || 0 : undefined,
        });

        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Collaboration Type Selector */}
                    <div className="space-y-3 pb-4 border-b">
                        <Label className="text-sm font-semibold">Collaboration Type</Label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, collaborationType: 'PAID' }))}
                                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${
                                    formData.collaborationType === 'PAID'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                💰 PAID
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, collaborationType: 'AFFILIATE' }))}
                                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${
                                    formData.collaborationType === 'AFFILIATE'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                🤝 AFFILIATE
                            </button>
                        </div>
                        
                        {/* Conditional Fee/Commission Field */}
                        {formData.collaborationType === 'PAID' ? (
                            <div className="grid grid-cols-4 items-center gap-4 pt-2">
                                <Label htmlFor="fixedFee" className="text-right">Fixed Fee</Label>
                                <CurrencyInput 
                                    id="fixedFee" 
                                    value={formData.fixedFee} 
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, fixedFee: val.toString() }))} 
                                    className="col-span-3" 
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 items-center gap-4 pt-2">
                                <Label htmlFor="commissionRate" className="text-right">Commission %</Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input 
                                        id="commissionRate" 
                                        name="commissionRate"
                                        type="number" 
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={formData.commissionRate} 
                                        onChange={handleChange}
                                        className="flex-1"
                                        placeholder="10"
                                    />
                                    <span className="text-muted-foreground">%</span>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Auto-Settled</Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="videosCount" className="text-right">Videos</Label>
                        <Input id="videosCount" name="videosCount" type="number" value={formData.videosCount} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="totalViews" className="text-right">Views</Label>
                        <CurrencyInput id="totalViews" value={formData.totalViews} onValueChange={(val) => setFormData(prev => ({ ...prev, totalViews: val.toString() }))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="totalEngagements" className="text-right">Engage.</Label>
                        <CurrencyInput id="totalEngagements" value={formData.totalEngagements} onValueChange={(val) => setFormData(prev => ({ ...prev, totalEngagements: val.toString() }))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salesGenerated" className="text-right">Sales (IDR)</Label>
                        <CurrencyInput
                            id="salesGenerated"
                            value={formData.salesGenerated}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, salesGenerated: val.toString() }))}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contentLink" className="text-right">Link</Label>
                        <Input
                            id="contentLink"
                            name="contentLink"
                            placeholder="https://tiktok.com/..."
                            value={formData.contentLink}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
