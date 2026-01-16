"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { KOL } from "@/lib/static-data";
import { ExternalLink, Calendar } from "lucide-react";
import { format, isPast, isToday } from "date-fns";

interface KanbanCardProps {
    id: string;
    kol: KOL;
    status: string;
    contentLink?: string;
    dueDate?: string;
    notes?: string;
}

export function KanbanCard({ id, kol, contentLink, dueDate, notes }: KanbanCardProps) {
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

    // Tier color mapping
    const tierColors: Record<string, string> = {
        'Mega': 'bg-purple-100 text-purple-700 border-purple-300',
        'Macro': 'bg-blue-100 text-blue-700 border-blue-300',
        'Micro': 'bg-green-100 text-green-700 border-green-300',
        'Nano': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };

    // Due date styling
    const getDueDateStyle = () => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        if (isPast(date) && !isToday(date)) {
            return 'bg-red-600 text-white'; // Overdue
        }
        if (isToday(date)) {
            return 'bg-amber-500 text-white'; // Due today
        }
        return 'bg-black text-white'; // Future
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3">
            <Card className="cursor-grab hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(63,63,70,1)] active:cursor-grabbing active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                <CardContent className="p-4">
                    {/* Tags Row */}
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={`text-[10px] font-bold py-0.5 px-1.5 border ${tierColors[kol.type] || tierColors['Nano']}`}>
                            {kol.type || 'Nano'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-medium py-0.5 px-1.5 border-black bg-zinc-100 dark:bg-zinc-800">
                            {kol.category}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm leading-tight mb-1">{kol.name}</h4>

                    {/* Notes / Description (truncated) */}
                    {notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {notes}
                        </p>
                    )}

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between mt-3">
                        {/* Due Date Badge */}
                        {dueDate ? (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded ${getDueDateStyle()}`}>
                                <Calendar className="h-3 w-3" />
                                {format(new Date(dueDate), "MMM d, yyyy")}
                            </span>
                        ) : (
                            <span className="text-[10px] text-muted-foreground">
                                {(kol.followers / 1000).toFixed(1)}K followers
                            </span>
                        )}

                        {/* Avatar & Link */}
                        <div className="flex items-center gap-1">
                            {contentLink && (
                                <a
                                    href={contentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                                    onPointerDown={(e) => e.stopPropagation()}
                                    title="View Content"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            <Avatar className="h-7 w-7 border-2 border-black">
                                <AvatarFallback className="font-bold text-xs bg-lime-400 text-black">
                                    {kol.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
