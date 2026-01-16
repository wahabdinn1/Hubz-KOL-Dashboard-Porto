"use client";

import { useState, useEffect, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import {
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { KanbanColumn } from "./kanban-column";
import { useData } from "@/context/data-context";
import { KOL } from "@/lib/static-data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const COLUMNS = [
    { id: "to_contact", title: "To Contact" },
    { id: "negotiating", title: "Negotiating" },
    { id: "content_creation", title: "Content" },
    { id: "posted", title: "Posted" },
    { id: "completed", title: "Completed" },
];

export function KanbanBoard() {
    const { activeCampaign, kols, updateCampaignDeliverableDB } = useData();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<Record<string, KOL[]>>({
        to_contact: [],
        negotiating: [],
        content_creation: [],
        posted: [],
        completed: []
    });

    // 1. Sync State with DB (only when not dragging to avoid jitter)
    useEffect(() => {
        if (activeId) return; // Don't sync while dragging
        if (!activeCampaign) return;

        const newItems: Record<string, KOL[]> = {
            to_contact: [],
            negotiating: [],
            content_creation: [],
            posted: [],
            completed: []
        };

        activeCampaign.deliverables.forEach((del) => {
            const kol = kols.find((k) => k.id === del.kolId);
            const status = del.status || "to_contact";
            if (kol && newItems[status]) {
                newItems[status].push(kol);
            }
        });
        const timer = setTimeout(() => setItems(newItems), 0);
        return () => clearTimeout(timer);
    }, [activeCampaign, kols, activeId]);

    // 2. Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;

        const query = searchQuery.toLowerCase();
        const filtered: Record<string, KOL[]> = {};

        Object.keys(items).forEach(key => {
            filtered[key] = items[key].filter(kol =>
                kol.name.toLowerCase().includes(query) ||
                kol.category.toLowerCase().includes(query)
            );
        });

        return filtered;
    }, [items, searchQuery]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: string) => {
        if (id in items) return id;
        return Object.keys(items).find((key) => items[key].find((k) => k.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) {
            return;
        }

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        // Optimistic Move for DragOver (Visual Separation)
        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((k) => k.id === active.id);
            const overIndex = overItems.findIndex((k) => k.id === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active } = event;
        const activeId = active.id as string;

        // Finalize location derived from whatever the DragOver logic left us with
        const finalContainer = findContainer(activeId);

        // Find original status from DB
        const currentDel = activeCampaign?.deliverables.find(d => d.kolId === activeId);
        const oldStatus = currentDel?.status || "to_contact";

        if (finalContainer && finalContainer !== oldStatus) {
            // Status changed!
            await updateCampaignDeliverableDB(activeCampaign!.id, activeId, { status: finalContainer });
        }

        setActiveId(null);
    };

    if (!activeCampaign) return <div>Select a campaign to view board.</div>;

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-4 px-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search KOL..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 border-2 border-black dark:border-zinc-700 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <span className="text-sm text-muted-foreground">
                    {Object.values(filteredItems).flat().length} KOLs
                </span>
            </div>

            {/* Kanban Columns */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-1 gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600">
                    {COLUMNS.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            items={filteredItems[col.id] || []}
                            activeCampaign={activeCampaign}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-80 rotate-3">
                            {(() => {
                                const kol = kols.find(k => k.id === activeId);
                                const deliverable = activeCampaign?.deliverables.find(d => d.kolId === activeId);
                                if (kol) return (
                                    <KanbanCard
                                        id={activeId}
                                        kol={kol}
                                        status="overlay"
                                        contentLink={deliverable?.contentLink}
                                        dueDate={deliverable?.dueDate}
                                        notes={deliverable?.notes}
                                    />
                                );
                                return null;
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
