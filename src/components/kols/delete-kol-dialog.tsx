"use client";

import { useState } from "react";
import { Dialog } from "@/components/retroui/Dialog";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Trash2 } from "lucide-react";
import { KOL } from "@/lib/static-data";

interface DeleteKOLDialogProps {
    kol: KOL;
}

export function DeleteKOLDialog({ kol }: DeleteKOLDialogProps) {
    const { deleteKOL } = useData();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteKOL(kol.id);
            setOpen(false);
        } catch (error) {
            console.error("Failed to delete KOL", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className="sm:max-w-[425px]">
                <Dialog.Header>
                    <div className="flex flex-col gap-1">
                        <span className="text-lg font-bold leading-none">Delete Influencer</span>
                        <Dialog.Description className="text-sm text-muted-foreground font-normal">
                             Are you sure you want to delete <strong>{kol.name}</strong>? This action cannot be undone and will remove them from all campaigns.
                        </Dialog.Description>
                    </div>
                </Dialog.Header>
                <Dialog.Footer className="mt-4 gap-4 sm:gap-4 sm:space-x-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
