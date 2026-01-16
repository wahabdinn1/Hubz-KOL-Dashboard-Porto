"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
    value: string | number;
    onSave: (value: string) => void | Promise<void>;
    className?: string;
    inputClassName?: string;
    displayClassName?: string;
    type?: "text" | "number";
    placeholder?: string;
    formatDisplay?: (value: string | number) => React.ReactNode;
}

export function InlineEdit({
    value,
    onSave,
    className,
    inputClassName,
    displayClassName,
    type = "text",
    placeholder = "Click to edit",
    formatDisplay,
}: InlineEditProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(String(value));
    const [isSaving, setIsSaving] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Update editValue when value prop changes
    React.useEffect(() => {
        if (!isEditing) {
            setEditValue(String(value));
        }
    }, [value, isEditing]);

    // Focus input when entering edit mode
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (editValue === String(value)) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(editValue);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save:", error);
            setEditValue(String(value)); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(String(value));
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <Input
                    ref={inputRef}
                    type={type}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSaving}
                    className={cn("h-8 text-sm", inputClassName)}
                    placeholder={placeholder}
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={handleCancel}
                    disabled={isSaving}
                >
                    <X className="h-3.5 w-3.5 text-red-600" />
                </Button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className={cn(
                "inline-flex items-center gap-1.5 group text-left hover:bg-muted px-1.5 py-0.5 -mx-1.5 rounded transition-colors",
                displayClassName,
                className
            )}
        >
            <span>{formatDisplay ? formatDisplay(value) : value || placeholder}</span>
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </button>
    );
}
