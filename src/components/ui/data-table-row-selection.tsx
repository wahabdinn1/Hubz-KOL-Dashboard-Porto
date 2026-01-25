"use client";

import { Table } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableRowSelectionProps<TData> {
    table: Table<TData>;
}

export function DataTableRowSelection<TData>({
    table,
}: DataTableRowSelectionProps<TData>) {
    return (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
    );
}

interface DataTableRowCheckboxProps {
    checked: boolean;
    onCheckedChange: (value: boolean) => void;
}

export function DataTableRowCheckbox({
    checked,
    onCheckedChange,
}: DataTableRowCheckboxProps) {
    return (
        <Checkbox
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
        />
    );
}
