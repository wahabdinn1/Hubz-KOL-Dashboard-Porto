"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";

export function KeyboardShortcutsDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Keyboard Shortcuts (?)"
                >
                    <Keyboard className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-1 mt-4">
                    {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700 last:border-0"
                        >
                            <span className="text-sm text-muted-foreground">
                                {shortcut.description}
                            </span>
                            <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">?</kbd> to toggle this dialog
                </p>
            </DialogContent>
        </Dialog>
    );
}
