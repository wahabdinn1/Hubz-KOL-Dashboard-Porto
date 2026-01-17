"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { KeyboardShortcutsDialog } from "@/components/shared/keyboard-shortcuts-dialog";

type ShortcutAction = () => void;

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: ShortcutAction;
    description: string;
}

/**
 * Global keyboard shortcuts hook
 */
export function useKeyboardShortcuts(customShortcuts?: KeyboardShortcut[]) {
    const router = useRouter();

    // Default navigation shortcuts
    const defaultShortcuts: KeyboardShortcut[] = [
        {
            key: "h",
            alt: true,
            action: () => router.push("/"),
            description: "Go to Dashboard",
        },
        {
            key: "c",
            alt: true,
            action: () => router.push("/campaigns"),
            description: "Go to Campaigns",
        },
        {
            key: "i",
            alt: true,
            action: () => router.push("/influencers"),
            description: "Go to Influencers",
        },
        {
            key: "f",
            alt: true,
            action: () => router.push("/finance"),
            description: "Go to Finance",
        },
        {
            key: "b",
            alt: true,
            action: () => router.push("/invoices"),
            description: "Go to Invoices",
        },
        {
            key: "/",
            ctrl: true,
            action: () => {
                // Focus on global search if it exists
                const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
                if (searchInput) {
                    searchInput.focus();
                }
            },
            description: "Focus Search",
        },
        {
            key: "Escape",
            action: () => {
                // Blur active element
                if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            },
            description: "Close/Blur",
        },
    ];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const allShortcuts = useMemo(() => [...defaultShortcuts, ...(customShortcuts || [])], [customShortcuts]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                // Only allow Escape in inputs
                if (event.key !== "Escape") {
                    return;
                }
            }

            for (const shortcut of allShortcuts) {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
                    event.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [allShortcuts]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return { 
        shortcuts: allShortcuts,
        ShortcutsHelpDialog: KeyboardShortcutsDialog 
    };
}

/**
 * Get formatted shortcut key display string
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.shift) parts.push("Shift");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
}

/**
 * Shortcut definitions for display in help dialogs
 */
export const KEYBOARD_SHORTCUTS = [
    { keys: "Alt + H", description: "Go to Dashboard" },
    { keys: "Alt + C", description: "Go to Campaigns" },
    { keys: "Alt + I", description: "Go to Influencers" },
    { keys: "Alt + F", description: "Go to Finance" },
    { keys: "Alt + B", description: "Go to Invoices" },
    { keys: "Ctrl + /", description: "Focus Search" },
    { keys: "Escape", description: "Close/Blur" },
];
