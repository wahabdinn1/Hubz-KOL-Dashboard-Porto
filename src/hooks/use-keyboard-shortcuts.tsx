"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ShortcutItem {
    key: string;
    description: string;
    action?: () => void;
}

export function useKeyboardShortcuts() {
    const [showHelp, setShowHelp] = React.useState(false);
    const router = useRouter();

    const shortcuts: ShortcutItem[] = React.useMemo(
        () => [
            { key: "g d", description: "Go to Dashboard", action: () => router.push("/") },
            { key: "g c", description: "Go to Campaigns", action: () => router.push("/campaigns") },
            { key: "g i", description: "Go to Influencers", action: () => router.push("/influencers") },
            { key: "g s", description: "Go to Settings", action: () => router.push("/settings") },
            { key: "?", description: "Show keyboard shortcuts" },
            { key: "⌘/Ctrl + K", description: "Open command palette" },
        ],
        [router]
    );

    React.useEffect(() => {
        let keySequence: string[] = [];
        let sequenceTimer: NodeJS.Timeout;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            // Show help with ?
            if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                setShowHelp((prev) => !prev);
                return;
            }

            // Handle key sequences (g + letter)
            keySequence.push(e.key.toLowerCase());

            clearTimeout(sequenceTimer);
            sequenceTimer = setTimeout(() => {
                keySequence = [];
            }, 500);

            const sequence = keySequence.join(" ");

            // Go shortcuts
            if (sequence === "g d") {
                e.preventDefault();
                router.push("/");
                keySequence = [];
            } else if (sequence === "g c") {
                e.preventDefault();
                router.push("/campaigns");
                keySequence = [];
            } else if (sequence === "g i") {
                e.preventDefault();
                router.push("/influencers");
                keySequence = [];
            } else if (sequence === "g s") {
                e.preventDefault();
                router.push("/settings");
                keySequence = [];
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            clearTimeout(sequenceTimer);
        };
    }, [router]);

    const ShortcutsHelpDialog = () => (
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        ⌨️ Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Use these shortcuts to navigate faster.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Navigation</h4>
                        <div className="space-y-2">
                            {shortcuts.slice(0, 4).map((s) => (
                                <div key={s.key} className="flex items-center justify-between">
                                    <span className="text-sm">{s.description}</span>
                                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">{s.key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-2 text-muted-foreground">General</h4>
                        <div className="space-y-2">
                            {shortcuts.slice(4).map((s) => (
                                <div key={s.key} className="flex items-center justify-between">
                                    <span className="text-sm">{s.description}</span>
                                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">{s.key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );

    return { ShortcutsHelpDialog, showHelp, setShowHelp };
}
