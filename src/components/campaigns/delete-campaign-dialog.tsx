import { useState } from "react";
import { Dialog } from "@/components/retroui/Dialog";
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
        e.preventDefault(); 
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
            <Dialog.Trigger asChild>
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
            </Dialog.Trigger>
            <Dialog.Content>
                <Dialog.Header>
                    <span className="font-semibold text-lg">Delete Campaign</span>
                </Dialog.Header>
                <div className="p-4">
                    <p className="text-muted-foreground">
                         Are you sure you want to delete <strong>{campaign.name}</strong>? This will remove all data associated with this campaign. This action cannot be undone.
                    </p>
                </div>
                <Dialog.Footer>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false); }} disabled={isDeleting}>
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
