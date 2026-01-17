"use client";

import { useState } from "react";
import { extractVideoId, detectPlatform } from "@/lib/content-utils";

interface ContentEmbedProps {
    url: string;
    className?: string;
}

export function ContentEmbed({ url, className }: ContentEmbedProps) {
    const [error, setError] = useState(false);
    const platform = detectPlatform(url);
    const videoId = extractVideoId(url);

    if (error || !videoId) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center p-4 border-2 border-black rounded-lg bg-muted hover:bg-muted/80 transition-colors ${className}`}
            >
                <span className="text-sm text-muted-foreground">Open link →</span>
            </a>
        );
    }

    if (platform === "tiktok") {
        return (
            <div className={`relative overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}>
                <iframe
                    src={`https://www.tiktok.com/embed/v2/${videoId}`}
                    width="100%"
                    height="500"
                    allow="encrypted-media"
                    allowFullScreen
                    onError={() => setError(true)}
                    className="border-0"
                />
            </div>
        );
    }

    if (platform === "instagram") {
        // Instagram embeds require their embed.js script
        return (
            <div className={`relative overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${className}`}>
                <blockquote
                    className="instagram-media"
                    data-instgrm-permalink={url}
                    data-instgrm-version="14"
                    style={{ maxWidth: "540px", width: "100%" }}
                />
                <script async src="//www.instagram.com/embed.js"></script>
            </div>
        );
    }

    if (platform === "youtube") {
        return (
            <div className={`relative overflow-hidden rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] aspect-video ${className}`}>
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    width="100%"
                    height="100%"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onError={() => setError(true)}
                    className="border-0 absolute inset-0"
                />
            </div>
        );
    }

    // Fallback for unknown platforms
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center p-4 border-2 border-black rounded-lg bg-muted hover:bg-muted/80 transition-colors ${className}`}
        >
            <span className="text-sm text-muted-foreground">View on {platform || "external site"} →</span>
        </a>
    );
}
