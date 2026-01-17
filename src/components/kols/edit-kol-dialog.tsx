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
import { KOL } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";

interface EditKOLDialogProps {
    kol: KOL;
}

export function EditKOLDialog({ kol }: EditKOLDialogProps) {
    const { updateKOL, categories } = useData();
    const [open, setOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        followers: "",
        avgViews: "",

        tiktokUsername: "",
        tiktokProfileLink: "",
        tiktokFollowers: "",
        rateCardTiktok: "",

        instagramUsername: "",
        instagramProfileLink: "",
        instagramFollowers: "",
        rateCardReels: "",

        rateCardPdfLink: ""
    });

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setFormData({
                    name: kol.name,
                    category: kol.category,
                    followers: kol.followers.toString(),
                    avgViews: kol.avgViews.toString(),

                    tiktokUsername: kol.tiktokUsername || "",
                    tiktokProfileLink: kol.tiktokProfileLink || "",
                    tiktokFollowers: (kol.tiktokFollowers || 0).toString(),
                    rateCardTiktok: (kol.rateCardTiktok || 0).toString(),

                    instagramUsername: kol.instagramUsername || "",
                    instagramProfileLink: kol.instagramProfileLink || "",
                    instagramFollowers: (kol.instagramFollowers || 0).toString(),
                    rateCardReels: (kol.rateCardReels || 0).toString(),

                    rateCardPdfLink: kol.rateCardPdfLink || ""
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [open, kol]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Recalculate type
        const totalFollowers = Math.max(
            Number(formData.tiktokFollowers) || 0,
            Number(formData.instagramFollowers) || 0
        );

        await updateKOL(kol.id, {
            name: formData.name,
            category: formData.category,
            followers: totalFollowers,
            avgViews: 0,
            type: totalFollowers > 1000000 ? 'Macro' : totalFollowers < 100000 ? 'Micro' : 'Macro',

            tiktokUsername: formData.tiktokUsername,
            tiktokProfileLink: formData.tiktokProfileLink,
            tiktokFollowers: Number(formData.tiktokFollowers) || 0,

            instagramUsername: formData.instagramUsername,
            instagramProfileLink: formData.instagramProfileLink,
            instagramFollowers: Number(formData.instagramFollowers) || 0,

            rateCardTiktok: Number(formData.rateCardTiktok) || 0,
            rateCardReels: Number(formData.rateCardReels) || 0,
            rateCardPdfLink: formData.rateCardPdfLink
        });

        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };

            // Auto-fill TikTok Profile Link
            if (name === "tiktokUsername") {
                if (value) {
                    const cleanUser = value.replace(/^@/, '');
                    newData.tiktokProfileLink = `https://www.tiktok.com/@${cleanUser}`;
                } else {
                    newData.tiktokProfileLink = "";
                }
            }

            // Auto-fill Instagram Profile Link
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

                <form onSubmit={handleSubmit} className="py-4 grid gap-6">
                    {/* --- Basic Info --- */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
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
                        </div>
                    </div>

                    {/* --- TikTok --- */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            TikTok
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tiktokUsername">Username</Label>
                                <Input id="tiktokUsername" name="tiktokUsername" value={formData.tiktokUsername} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tiktokFollowers">Followers</Label>
                                <Input id="tiktokFollowers" name="tiktokFollowers" type="number" value={formData.tiktokFollowers} onChange={handleChange} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="tiktokProfileLink">Profile Link</Label>
                                <Input id="tiktokProfileLink" name="tiktokProfileLink" value={formData.tiktokProfileLink} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* --- Instagram --- */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Instagram
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instagramUsername">Username</Label>
                                <Input id="instagramUsername" name="instagramUsername" value={formData.instagramUsername} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instagramFollowers">Followers</Label>
                                <Input id="instagramFollowers" name="instagramFollowers" type="number" value={formData.instagramFollowers} onChange={handleChange} />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="instagramProfileLink">Profile Link</Label>
                                <Input id="instagramProfileLink" name="instagramProfileLink" value={formData.instagramProfileLink} onChange={handleChange} />
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
                                <Input id="rateCardPdfLink" name="rateCardPdfLink" value={formData.rateCardPdfLink} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
