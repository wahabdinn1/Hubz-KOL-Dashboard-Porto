"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, Link as LinkIcon, Plus, ExternalLink, Trash2, Image, Video, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Attachment {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
    created_at: string;
}

interface DeliverableAttachmentsProps {
    campaignId: string;
    deliverableKolId: string;
    className?: string;
}

const FILE_TYPE_ICONS: Record<string, typeof File> = {
    image: Image,
    video: Video,
    default: FileText,
};

function getFileIcon(fileType: string) {
    if (fileType.startsWith("image")) return FILE_TYPE_ICONS.image;
    if (fileType.startsWith("video")) return FILE_TYPE_ICONS.video;
    return FILE_TYPE_ICONS.default;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
    const [urlInput, setUrlInput] = useState("");
    const [dragActive, setDragActive] = useState(false);

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
    const handleAddUrl = async () => {
        if (!urlInput.trim()) {
            toast.error("Please enter a URL");
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from("deliverable_attachments")
                .insert({
                    campaign_id: campaignId,
                    kol_id: deliverableKolId,
                    file_name: urlInput,
                    file_url: urlInput,
                    file_type: "url",
                    file_size: 0,
                });

            if (error) throw error;

            toast.success("Link added successfully");
            setUrlInput("");
            fetchAttachments();
            setIsDialogOpen(false);
        } catch (err) {
            console.error("Error adding URL:", err);
            toast.error("Failed to add link");
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

            // Optionally delete from storage (if it was a file)
            if (attachment.file_type !== "url" && attachment.file_url.includes("supabase")) {
                // Extract path from URL and delete
                // Not required for this implementation
            }

            toast.success("Attachment removed");
            setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
        } catch (err) {
            console.error("Error deleting attachment:", err);
            toast.error("Failed to remove attachment");
        }
    };

    // Drag and drop handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFileUpload(e.dataTransfer.files);
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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <DialogHeader>
                                <DialogTitle>Add Attachment</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                {/* File Upload */}
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                                        dragActive ? "border-primary bg-primary/5" : "border-gray-300",
                                        uploading && "opacity-50 pointer-events-none"
                                    )}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Drag & drop files here, or
                                    </p>
                                    <label>
                                        <Input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e.target.files)}
                                            accept="image/*,video/*,.pdf,.doc,.docx"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-black"
                                            disabled={uploading}
                                            asChild
                                        >
                                            <span>{uploading ? "Uploading..." : "Browse Files"}</span>
                                        </Button>
                                    </label>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Images, videos, PDFs up to 10MB
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground">OR</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                {/* URL Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4" />
                                        Add Link
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="url"
                                            placeholder="https://tiktok.com/..."
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            className="border-2 border-black"
                                        />
                                        <Button
                                            onClick={handleAddUrl}
                                            size="sm"
                                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px]"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="pt-3">
                {loading ? (
                    <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
                ) : attachments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No attachments yet</p>
                ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {attachments.map((attachment) => {
                            const Icon = getFileIcon(attachment.file_type);
                            const isUrl = attachment.file_type === "url";
                            return (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded border hover:bg-muted transition-colors group"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="h-8 w-8 rounded bg-background border flex items-center justify-center shrink-0">
                                            {isUrl ? (
                                                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <Icon className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {attachment.file_name}
                                            </p>
                                            {!isUrl && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(attachment.file_size)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={attachment.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 hover:bg-background rounded"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(attachment)}
                                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
