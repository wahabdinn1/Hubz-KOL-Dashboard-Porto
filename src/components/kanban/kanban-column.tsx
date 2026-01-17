"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { KOL, Campaign } from "@/lib/static-data";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
    id: string;
    title: string;
    items: KOL[];
    activeCampaign: Campaign | null;
    onAddClick?: (columnId: string) => void;
}

export function KanbanColumn({ id, title, items, activeCampaign, onAddClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex h-full min-w-[240px] w-[240px] lg:min-w-[260px] lg:w-[260px] xl:min-w-[280px] xl:w-[280px] flex-col rounded-xl p-4 border-2 transition-all shrink-0 ${isOver
                    ? 'bg-zinc-200 dark:bg-zinc-700 border-black dark:border-zinc-500'
                    : 'bg-zinc-100 dark:bg-zinc-800/50 border-transparent'
                }`}
        >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-xs font-bold dark:bg-zinc-600">
                        {items.length}
                    </span>
                </div>
                {onAddClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        onClick={() => onAddClick(id)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Cards */}
            <SortableContext
                id={id}
                items={items.map((k) => k.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 flex flex-col gap-2 min-h-[100px] overflow-y-auto">
                    {items.map((kol) => {
                        const deliverable = activeCampaign?.deliverables.find(d => d.kolId === kol.id);
                        return (
                            <KanbanCard
                                key={kol.id}
                                id={kol.id}
                                kol={kol}
                                status={id}
                                campaignId={activeCampaign?.id}
                                contentLink={deliverable?.contentLink}
                                dueDate={deliverable?.dueDate}
                                notes={deliverable?.notes}
                            />
                        );
                    })}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl opacity-60">
                            <p className="text-xs text-muted-foreground font-medium">Drop here</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
