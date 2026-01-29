"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link as LinkIcon, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadAttachmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpload: (files: FileList | null) => Promise<void>;
    onAddUrl: (url: string) => Promise<void>;
    uploading: boolean;
}

export function UploadAttachmentDialog({
    open,
    onOpenChange,
    onUpload,
    onAddUrl,
    uploading,
}: UploadAttachmentDialogProps) {
    const [dragActive, setDragActive] = useState(false);
    const [urlInput, setUrlInput] = useState("");

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
        onUpload(e.dataTransfer.files);
    };

    const handleUrlSubmit = async () => {
        if (!urlInput.trim()) {
            toast.error("Please enter a URL");
            return;
        }
        await onAddUrl(urlInput);
        setUrlInput("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                onChange={(e) => onUpload(e.target.files)}
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
                                onClick={handleUrlSubmit}
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
    );
}
