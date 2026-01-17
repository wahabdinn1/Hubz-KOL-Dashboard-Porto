"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Trash2 } from "lucide-react";
import { Campaign } from "@/lib/static-data";

interface DeleteCampaignDialogProps {
    campaign: Campaign;
    trigger?: React.ReactNode;
}

export function DeleteCampaignDialog({ campaign, trigger }: DeleteCampaignDialogProps) {
    const { deleteCampaign } = useData();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent bubbling if inside link
        setIsDeleting(true);
        try {
            await deleteCampaign(campaign.id);
            setOpen(false);
        } catch (error) {
            console.error("Failed to delete Campaign", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Campaign</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{campaign.name}</strong>? This will remove all data associated with this campaign. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-4 sm:gap-4 sm:space-x-4">
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false); }} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
