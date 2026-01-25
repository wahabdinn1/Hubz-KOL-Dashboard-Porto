"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Note } from "@/lib/static-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useData } from "@/context/data-context";

interface ActivityLogProps {
    kolId: string;
}

export function ActivityLog({ kolId }: ActivityLogProps) {
    const { addNote, deleteNote } = useData();
    const [newNote, setNewNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Notes locally for this component
    const { data: notes = [], isLoading, error } = useQuery({
        queryKey: ['notes', kolId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('kol_notes')
                .select('*')
                .eq('kol_id', kolId)
                .order('created_at', { ascending: false });

            if (error) {
                // Silent fail if table doesn't exist to avoid spamming console in demo
                if (error.code === '42P01') return [];
                throw error;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((n: any) => ({
                id: n.id,
                kolId: n.kol_id,
                content: n.content,
                createdAt: n.created_at
            })) as Note[];
        }
    });

    const handleSubmit = async () => {
        if (!newNote.trim()) return;
        setIsSubmitting(true);
        await addNote(kolId, newNote);
        setNewNote("");
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this note?")) {
            await deleteNote(id);
        }
    };

    if (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errTyped = error as any;
        if (errTyped?.code === '42P01') {
            return (
                <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed border-zinc-200 rounded-lg">
                    Activity Log unavailable. <br />(Database table `kol_notes` missing)
                </div>
            )
        }
    }

    return (
        <div className="flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4 mb-4 border-2 border-black rounded-xl bg-zinc-50 dark:bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm opacity-60">
                        <p>No activity yet.</p>
                        <p className="text-xs">Add a note to start tracking history.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.map((note) => (
                            <div key={note.id} className="relative group bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <p className="text-sm whitespace-pre-wrap text-foreground">{note.content}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                        {format(new Date(note.createdAt), "MMM d, yyyy • h:mm a")}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(note.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="flex gap-2">
                <Textarea
                    placeholder="Log activity, call notes, or updates..."
                    value={newNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                    className="flex-1 resize-none border-2 border-black rounded-xl shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-sm min-h-[80px]"
                />
                <Button
                    onClick={handleSubmit}
                    disabled={!newNote.trim() || isSubmitting}
                    className="h-auto border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all w-16"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-6 w-6" />}
                </Button>
            </div>
        </div>
    );
}
