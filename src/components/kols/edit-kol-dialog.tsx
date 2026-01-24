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
import { Pencil, Loader2 } from "lucide-react";
import { KOL } from "@/lib/static-data";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditKOLDialogProps {
    kol: KOL;
}

export function EditKOLDialog({ kol }: EditKOLDialogProps) {
    const { updateKOL, categories } = useData();
    const [open, setOpen] = useState(false);
    const [fetchingTikTok, setFetchingTikTok] = useState(false);
    const [fetchingInstagram, setFetchingInstagram] = useState(false);

    // Fetch TikTok data
    const fetchTikTokData = async () => {
        if (!formData.tiktokUsername) return;
        setFetchingTikTok(true);
        try {
            const response = await fetch(`/api/tiktok/stalk?username=${encodeURIComponent(formData.tiktokUsername)}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                setFormData(prev => ({
                    ...prev,
                    tiktokFollowers: data.data.followers?.toString() || prev.tiktokFollowers,
                    avatar: data.data.avatar || prev.avatar,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch TikTok data:', error);
        } finally {
            setFetchingTikTok(false);
        }
    };

    // Fetch Instagram data - only updates followers, preserves existing avatar
    const fetchInstagramData = async () => {
        if (!formData.instagramUsername) return;
        setFetchingInstagram(true);
        try {
            const username = formData.instagramUsername.replace('@', '');
            const response = await fetch(`/api/instagram/profile?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                setFormData(prev => ({
                    ...prev,
                    instagramFollowers: data.data.followers?.toString() || prev.instagramFollowers,
                    // Only set avatar if not already filled (e.g., from TikTok fetch)
                    avatar: prev.avatar || (data.data.profile_pic_url ? `/api/image-proxy?url=${encodeURIComponent(data.data.profile_pic_url)}` : ''),
                }));
            }
        } catch (error) {
            console.error('Failed to fetch Instagram data:', error);
        } finally {
            setFetchingInstagram(false);
        }
    };

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        followers: "",
        avgViews: "",
        avatar: "",

        tiktokUsername: "",
        tiktokProfileLink: "",
        tiktokFollowers: "",
        rateCardTiktok: "",

        instagramUsername: "",
        instagramProfileLink: "",
        instagramFollowers: "",
        rateCardReels: "",

        rateCardPdfLink: "",
        whatsappNumber: "",
        collaborationType: "PAID" as 'PAID' | 'AFFILIATE',
        defaultCommissionRate: ""
    });

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                setFormData({
                    name: kol.name,
                    categoryId: kol.categoryId || "",
                    followers: kol.followers.toString(),
                    avgViews: kol.avgViews.toString(),
                    avatar: kol.avatar || "",

                    tiktokUsername: kol.tiktokUsername || "",
                    tiktokProfileLink: kol.tiktokProfileLink || "",
                    tiktokFollowers: (kol.tiktokFollowers || 0).toString(),
                    rateCardTiktok: (kol.rateCardTiktok || 0).toString(),

                    instagramUsername: kol.instagramUsername || "",
                    instagramProfileLink: kol.instagramProfileLink || "",
                    instagramFollowers: (kol.instagramFollowers || 0).toString(),
                    rateCardReels: (kol.rateCardReels || 0).toString(),

                    rateCardPdfLink: kol.rateCardPdfLink || "",
                    whatsappNumber: kol.whatsappNumber || "",
                    collaborationType: kol.collaborationType || "PAID",
                    defaultCommissionRate: (kol.defaultCommissionRate || 0).toString()
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
            categoryId: formData.categoryId,
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
            rateCardPdfLink: formData.rateCardPdfLink,
            avatar: formData.avatar,
            whatsappNumber: formData.whatsappNumber,
            collaborationType: formData.collaborationType,
            defaultCommissionRate: Number(formData.defaultCommissionRate) || 0
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
                        
                        {/* Avatar Input */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border">
                                <AvatarImage src={formData.avatar} alt={formData.name} />
                                <AvatarFallback>{formData.name?.charAt(0) || "K"}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="avatar">Avatar URL</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="avatar" 
                                        name="avatar" 
                                        value={formData.avatar} 
                                        onChange={handleChange} 
                                        placeholder="https://..." 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Category</Label>
                                {categories.length > 0 ? (
                                    <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                ) : (
                                    <Input id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                                <Input 
                                    id="whatsappNumber" 
                                    name="whatsappNumber" 
                                    value={formData.whatsappNumber} 
                                    onChange={handleChange} 
                                    placeholder="628xxxxxxxxxx" 
                                />
                                <p className="text-xs text-muted-foreground">Format: 628xxxxxxxxxx (no + or spaces)</p>
                            </div>
                        </div>

                        {/* Collaboration Type Selector */}
                        <div className="space-y-3 pt-4 border-t">
                            <Label className="text-sm font-semibold">Collaboration Type</Label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, collaborationType: 'PAID' }))}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                                        formData.collaborationType === 'PAID'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    💰 PAID
                                    <span className="block text-xs font-normal mt-1 opacity-70">Fixed rate card pricing</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, collaborationType: 'AFFILIATE' }))}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                                        formData.collaborationType === 'AFFILIATE'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    🤝 AFFILIATE
                                    <span className="block text-xs font-normal mt-1 opacity-70">Commission-based, auto-settled</span>
                                </button>
                            </div>
                            
                            {/* Info text for affiliates */}
                            {formData.collaborationType === 'AFFILIATE' && (
                                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                    💡 Commission rates are set per campaign when adding this influencer to campaigns.
                                </p>
                            )}
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
                                <div className="flex gap-2">
                                    <Input id="tiktokUsername" name="tiktokUsername" value={formData.tiktokUsername} onChange={handleChange} className="flex-1" />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={fetchTikTokData}
                                        disabled={!formData.tiktokUsername || fetchingTikTok}
                                    >
                                        {fetchingTikTok ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                                    </Button>
                                </div>
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
                                <div className="flex gap-2">
                                    <Input id="instagramUsername" name="instagramUsername" value={formData.instagramUsername} onChange={handleChange} className="flex-1" />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={fetchInstagramData}
                                        disabled={!formData.instagramUsername || fetchingInstagram}
                                    >
                                        {fetchingInstagram ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                                    </Button>
                                </div>
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

                    {/* --- Rates (Only for PAID) --- */}
                    {formData.collaborationType === 'PAID' && (
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
                    )}

                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
