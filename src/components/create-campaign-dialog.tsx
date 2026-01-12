"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function CreateCampaignDialog() {
    const { addCampaign } = useData();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [budget, setBudget] = useState("");
    const [platform, setPlatform] = useState<"TikTok" | "Instagram">("TikTok");
    const [objective, setObjective] = useState<"AWARENESS" | "CONVERSION">("AWARENESS");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addCampaign(name, parseFloat(budget) || 0, platform, objective, startDate, endDate);
            setOpen(false);
            setName("");
            setBudget("");
            setPlatform("TikTok");
            setObjective("AWARENESS");
            setStartDate("");
            setEndDate("");
        } catch (error) {
            console.error("Failed to create campaign", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> New Campaign
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Valid Campaign</DialogTitle>
                    <DialogDescription>
                        Set up a new campaign to track KOL performance.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., Summer Sale 2025"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right">
                                Budget (IDR)
                            </Label>
                            <CurrencyInput
                                id="budget"
                                value={budget}
                                onValueChange={(val) => setBudget(val.toString())}
                                className="col-span-3"
                                placeholder="50.000.000"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="platform" className="text-right">Platform</Label>
                            <select
                                id="platform"
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value as "TikTok" | "Instagram")}
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
                                value={objective}
                                onChange={(e) => setObjective(e.target.value as "AWARENESS" | "CONVERSION")}
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                <option value="AWARENESS">Awareness (CPM Focus)</option>
                                <option value="CONVERSION">Conversion (ROAS Focus)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Campaign</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
