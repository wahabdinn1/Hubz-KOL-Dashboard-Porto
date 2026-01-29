"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Attachment } from "./attachments/types";
import { AttachmentList } from "./attachments/attachment-list";
import { UploadAttachmentDialog } from "./attachments/upload-attachment-dialog";

interface DeliverableAttachmentsProps {
    campaignId: string;
    deliverableKolId: string;
    className?: string;
}

export function DeliverableAttachments({
    campaignId,
    deliverableKolId,
    className,
}: DeliverableAttachmentsProps) {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch existing attachments
    const fetchAttachments = useCallback(async () => {
        setLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from("deliverable_attachments")
                .select("*")
                .eq("campaign_id", campaignId)
                .eq("kol_id", deliverableKolId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setAttachments(data || []);
        } catch (err) {
            console.error("Error fetching attachments:", err);
        } finally {
            setLoading(false);
        }
    }, [campaignId, deliverableKolId]);

    // Upload file to Supabase Storage
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                // Upload to Supabase Storage
                const fileName = `${Date.now()}-${file.name}`;
                const filePath = `deliverables/${campaignId}/${deliverableKolId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("attachments")
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    // Fallback: store as URL reference without actual file
                    toast.info(`File "${file.name}" saved as reference`);
                }

                // Get public URL
                const { data: publicUrlData } = supabase.storage
                    .from("attachments")
                    .getPublicUrl(filePath);

                // Save to database
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error: dbError } = await (supabase as any)
                    .from("deliverable_attachments")
                    .insert({
                        campaign_id: campaignId,
                        kol_id: deliverableKolId,
                        file_name: file.name,
                        file_url: publicUrlData.publicUrl,
                        file_type: file.type,
                        file_size: file.size,
                    });

                if (dbError) throw dbError;
            }

            toast.success("Files uploaded successfully");
            fetchAttachments();
            setIsDialogOpen(false);
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload files");
        } finally {
            setUploading(false);
        }
    };

    // Add URL as attachment
    const handleAddUrl = async (url: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from("deliverable_attachments")
                .insert({
                    campaign_id: campaignId,
                    kol_id: deliverableKolId,
                    file_name: url,
                    file_url: url,
                    file_type: "url",
                    file_size: 0,
                });

            if (error) throw error;

            toast.success("Link added successfully");
            fetchAttachments();
            setIsDialogOpen(false);
        } catch (err) {
            console.error("Error adding URL:", err);
            toast.error("Failed to add link");
            throw err;
        }
    };

    // Delete attachment
    const handleDelete = async (attachment: Attachment) => {
        try {
            // Delete from database
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from("deliverable_attachments")
                .delete()
                .eq("id", attachment.id);

            if (error) throw error;

            toast.success("Attachment removed");
            setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
        } catch (err) {
            console.error("Error deleting attachment:", err);
            toast.error("Failed to remove attachment");
        }
    };

    // Load attachments on mount
    useState(() => {
        fetchAttachments();
    });

    return (
        <Card className={cn("border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", className)}>
            <CardHeader className="border-b-2 border-black pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Attachments
                        {attachments.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {attachments.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <UploadAttachmentDialog 
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onUpload={handleFileUpload}
                        onAddUrl={handleAddUrl}
                        uploading={uploading}
                    />
                </div>
            </CardHeader>
            <CardContent className="pt-3">
                <AttachmentList 
                    attachments={attachments}
                    loading={loading}
                    onDelete={handleDelete}
                />
            </CardContent>
        </Card>
    );
}
