import { ExternalLink, FileText, Image, Link as LinkIcon, Trash2, Video } from "lucide-react";
import { Attachment } from "./types";

interface AttachmentListProps {
    attachments: Attachment[];
    loading: boolean;
    onDelete: (attachment: Attachment) => void;
}

const FILE_TYPE_ICONS: Record<string, typeof FileText> = {
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

export function AttachmentList({ attachments, loading, onDelete }: AttachmentListProps) {
    if (loading) {
        return <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>;
    }

    if (attachments.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No attachments yet</p>;
    }

    return (
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
                                onClick={() => onDelete(attachment)}
                                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
