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
import { Settings } from "lucide-react";
import { Campaign } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";

interface EditCampaignDialogProps {
    campaign: Campaign;
}

export function EditCampaignDialog({ campaign }: EditCampaignDialogProps) {
    const { updateCampaign } = useData();
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        budget: "",
        platform: "TikTok",
        objective: "AWARENESS",
        startDate: "",
        endDate: ""
    });

    useEffect(() => {
        if (open) {
            setFormData({
                name: campaign.name,
                budget: campaign.budget.toString(),
                platform: campaign.platform || "TikTok",
                objective: campaign.objective || "AWARENESS",
                startDate: campaign.startDate || "",
                endDate: campaign.endDate || ""
            });
        }
    }, [open, campaign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateCampaign(campaign.id, {
            name: formData.name,
            budget: Number(formData.budget),
            platform: formData.platform as "TikTok" | "Instagram",
            objective: formData.objective as "AWARENESS" | "CONVERSION",
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined
        });

        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Campaign</DialogTitle>
                    <DialogDescription>
                        Update details for {campaign.name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="budget" className="text-right">Budget (IDR)</Label>
                        <CurrencyInput
                            id="budget"
                            value={formData.budget}
                            onValueChange={(val) => setFormData(p => ({ ...p, budget: val.toString() }))}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="platform" className="text-right">Platform</Label>
                        <select
                            id="platform"
                            name="platform"
                            value={formData.platform}
                            onChange={(e) => setFormData(p => ({ ...p, platform: e.target.value }))}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="objective" className="text-right">Objective</Label>
                        <select
                            id="objective"
                            name="objective"
                            value={formData.objective}
                            onChange={(e) => setFormData(p => ({ ...p, objective: e.target.value }))}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                            <option value="AWARENESS">Awareness (CPM Focus)</option>
                            <option value="CONVERSION">Conversion (ROAS Focus)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">Start Date</Label>
                        <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">End Date</Label>
                        <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="col-span-3" />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
