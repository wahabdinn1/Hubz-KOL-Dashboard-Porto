"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { KOL } from "@/lib/static-data";

interface KanbanColumnProps {
    id: string;
    title: string;
    items: KOL[];
}

export function KanbanColumn({ id, title, items }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className="flex h-full w-[280px] min-w-[280px] flex-col rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold dark:bg-zinc-700">
                    {items.length}
                </span>
            </div>

            <SortableContext
                id={id}
                items={items.map((k) => k.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 flex flex-col gap-2 min-h-[100px]">
                    {items.map((kol) => (
                        <KanbanCard key={kol.id} id={kol.id} kol={kol} status={id} />
                    ))}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-20 border-2 dashed border-zinc-300 dark:border-zinc-700 rounded-lg opacity-50">
                            <p className="text-xs text-muted-foreground">Drop here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
