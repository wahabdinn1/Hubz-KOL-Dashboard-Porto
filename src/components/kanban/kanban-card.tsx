"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { KOL } from "@/lib/static-data";

interface KanbanCardProps {
    id: string;
    kol: KOL;
    status: string;
}

export function KanbanCard({ id, kol, status }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
            <Card className="cursor-grab hover:shadow-md transition-shadow dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:cursor-grabbing">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-black">
                            {/* In a real app, we'd have an image URL */}
                            <AvatarFallback className="font-bold bg-yellow-400 text-black">
                                {kol.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="font-bold text-sm truncate">{kol.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{kol.category}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <TierBadge tier={kol.type || 'Nano-Tier'} className="text-[10px] h-5 px-1.5 py-0" />
                        <span className="text-xs font-mono">
                            {(kol.followers / 1000).toFixed(1)}K
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
