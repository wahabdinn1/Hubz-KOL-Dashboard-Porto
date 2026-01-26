/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Save, Trash2, Copy, FileText, Eye, Bold, Italic, Underline, Heading1, Heading2, AlignCenter, AlignLeft, AlignRight, PanelRight, List, ListOrdered, ArrowUpDown, Check } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CONTRACT_VARIABLES } from "@/lib/contracts/constants";
import { Skeleton } from "@/components/retroui/Skeleton";
import { hydrateContract } from "@/lib/contracts/hydrator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

// Tiptap
import { MarginExtension, CustomLineHeight } from "@/lib/tiptap/line-height";
import { TextStyle } from "@tiptap/extension-text-style"; 
import { useEditor, EditorContent } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus'; 
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';

interface Template {
    id: string;
    name: string;
    content: string;
    created_at: string;
}

export default function TemplateSettingsPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedId, setSelectedId] = useState<string | null | undefined>(undefined); 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showVariables, setShowVariables] = useState(true);

    // Form State
    const [name, setName] = useState("");
    // We keep 'content' state to sync with Tiptap for saving/preview
    const [content, setContent] = useState(""); 
    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

    // Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExtension,
            TextStyle,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            CustomLineHeight.configure({
                types: ['heading', 'paragraph'],
            }),
            MarginExtension,
            Placeholder.configure({
                placeholder: 'Type your legal contract here. Use variables from the right panel...',
            }),
            FloatingMenuExtension.configure({
                element: undefined,
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[300px] p-4',
            },
        },
        immediatelyRender: false,
    });

    const fetchTemplates = useCallback(async () => {

        const { data, error } = await (supabase as any)
            .from("contract_templates")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to load templates");
        } else {
            setTemplates(data || []);
            if (data && data.length > 0) {
                 setSelectedId(prev => (prev === undefined ? data[0].id : prev));
            } else {
                 setSelectedId(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Sync Form with Selection
    useEffect(() => {
        if (typeof selectedId === 'string') {
            const tmpl = templates.find(t => t.id === selectedId);
            if (tmpl) {
                setName(tmpl.name);
                setContent(tmpl.content);
                if (editor && editor.getHTML() !== tmpl.content) {
                    editor.commands.setContent(tmpl.content);
                }
            }
        }
    }, [selectedId, templates, editor]);

    const handleCreateNew = () => {
        setSelectedId(null);
        setName("Untitled Template");
        setContent("");
        editor?.commands.setContent("");
        editor?.commands.focus();
    };

    const insertVariable = (variable: string) => {
        if (viewMode !== 'edit') {
            toast.error("Switch to Edit mode to insert variables");
            return;
        }
        
        if (editor) {
            editor.chain().focus().insertContent(variable).run();
        } else {
            copyToClipboard(variable);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return toast.error("Template name is required");
        setSaving(true);
        
        try {

            const sb = supabase as any;
            const currentContent = editor ? editor.getHTML() : content;

            if (selectedId) {
                const { error } = await sb
                    .from("contract_templates")
                    .update({ name, content: currentContent })
                    .eq("id", selectedId)
                    .select();

                if (error) throw error;
                toast.success("Template updated");
                
                setTemplates(prev => prev.map(t => 
                    t.id === selectedId ? { ...t, name, content: currentContent } : t
                ));
            } else {
                const { data, error } = await sb
                    .from("contract_templates")
                    .insert([{ name, content: currentContent }])
                    .select()
                    .single();

                if (error) throw error;
                setTemplates(prev => [data, ...prev]);
                setSelectedId(data.id);
                toast.success("Template created");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedId) return;
        if (!confirm("Are you sure you want to delete this template?")) return;


        const { error } = await (supabase as any)
            .from("contract_templates")
            .delete()
            .eq("id", selectedId);

        if (error) {
            toast.error("Failed to delete");
        } else {
            toast.success("Template deleted");
            const remaining = templates.filter(t => t.id !== selectedId);
            setTemplates(remaining);
            if (remaining.length > 0) setSelectedId(remaining[0].id);
            else handleCreateNew();
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${text}`);
    };

    if (!editor) {
        return null; // or loading spinner
    }

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            {/* LEFT SIDEBAR: Template List */}
            <div className="w-1/4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Contract Templates</h2>
                    <Button size="sm" onClick={handleCreateNew}>
                        <Plus className="h-4 w-4 mr-1" /> New
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {loading && templates.length === 0 ? (
                         <>
                            <Skeleton variant="text" className="h-10 w-full" />
                            <Skeleton variant="text" className="h-10 w-full" />
                            <Skeleton variant="text" className="h-10 w-full" />
                         </>
                    ) : (
                        templates.map(tmpl => (
                            <div 
                                key={tmpl.id}
                                onClick={() => setSelectedId(tmpl.id)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${
                                    selectedId === tmpl.id 
                                    ? "bg-primary/10 border-primary shadow-sm" 
                                    : "bg-background border-border hover:bg-muted"
                                }`}
                            >
                                <div className="font-medium truncate">{tmpl.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(tmpl.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CENTER: Editor */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between">
                     <Input 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="font-bold text-lg max-w-md"
                        placeholder="Template Name"
                     />
                     <div className="flex gap-2">
                        {selectedId && (
                            <Button variant="ghost" className="text-destructive h-9 w-9 p-0 flex items-center justify-center" onClick={handleDelete} title="Delete Template">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button onClick={handleSave} disabled={saving} className="h-9">
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save"}
                        </Button>
                        <div className="w-px h-9 bg-border/20 mx-1" />
                        <Button
                            variant={showVariables ? 'default' : 'outline'}
                            onClick={() => setShowVariables(!showVariables)} 
                            className="h-9 w-9 p-0 flex items-center justify-center"
                            title={showVariables ? "Hide Variables" : "Show Variables"}
                        >
                            <PanelRight className="h-4 w-4" />
                        </Button>
                     </div>
                </div>

                {/* Editor / Preview with Toggle */}
                <Card className="flex-1 flex flex-col shadow-sm overflow-hidden min-h-0">
                     <div className="p-2 border-b flex justify-between items-center bg-muted/20 shrink-0">
                         <div className="flex items-center gap-2">
                            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => { if(v) setViewMode(v as "edit" | "preview") }}>
                                <ToggleGroupItem value="edit" aria-label="Edit Mode" size="sm">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Edit
                                </ToggleGroupItem>
                                <ToggleGroupItem value="preview" aria-label="Preview Mode" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </ToggleGroupItem>
                            </ToggleGroup>
                            
                            {viewMode === 'edit' && (
                                <>
                                    <div className="w-px h-6 bg-border mx-1" />
                                    
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().toggleBold().run()} 
                                            title="Bold"
                                        >
                                            <Bold className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().toggleItalic().run()} 
                                            title="Italic"
                                        >
                                            <Italic className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('underline') ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().toggleUnderline().run()} 
                                            title="Underline"
                                        >
                                            <Underline className="h-4 w-4" />
                                        </Button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                                            title="Heading 1"
                                        >
                                            <Heading1 className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                                            title="Heading 2"
                                        >
                                            <Heading2 className="h-4 w-4" />
                                        </Button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                                            title="Align Left"
                                        >
                                            <AlignLeft className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                                            title="Align Center"
                                        >
                                            <AlignCenter className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`} 
                                            onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                                            title="Align Right"
                                        >
                                            <AlignRight className="h-4 w-4" />
                                        </Button>
                                        
                                        <div className="w-px h-6 bg-border mx-1" />

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" title="Line & Paragraph Spacing">
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="start" 
                                                className="w-56"
                                                onCloseAutoFocus={(e) => e.preventDefault()}
                                            >
                                                {/* Line Height Section */}
                                                <DropdownMenuLabel>Line Height</DropdownMenuLabel>
                                                {[
                                                    { label: 'Single', value: '1.0' },
                                                    { label: '1.15', value: '1.15' },
                                                    { label: '1.5', value: '1.5' },
                                                    { label: 'Double', value: '2.0' },
                                                ].map((option) => (
                                                    <DropdownMenuItem 
                                                        key={option.value}
                                                        onClick={() => editor.chain().focus().setLineHeight(option.value).run()}
                                                    >
                                                        <span className="w-6 flex items-center justify-center mr-2">
                                                            {editor.isActive({ lineHeight: option.value }) && <Check className="h-4 w-4" />}
                                                        </span>
                                                        {option.label}
                                                    </DropdownMenuItem>
                                                ))}
                                                
                                                <DropdownMenuSeparator />
                                                
                                                {/* Paragraph Spacing Section */}
                                                <DropdownMenuLabel>Paragraph Spacing</DropdownMenuLabel>
                                                
                                                {/* Space Before Logic */}
                                                {editor.getAttributes('paragraph').marginTop === '0' ? (
                                                    <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginTop('1em').run()}>
                                                        <span className="w-6 mr-2" />
                                                        Add space before paragraph
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginTop('0').run()}>
                                                        <span className="w-6 mr-2" />
                                                        Remove space before paragraph
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Space After Logic */}
                                                {editor.getAttributes('paragraph').marginBottom === '0' ? (
                                                     <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginBottom('1em').run()}>
                                                        <span className="w-6 mr-2" />
                                                        Add space after paragraph
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginBottom('0').run()}>
                                                        <span className="w-6 mr-2" />
                                                        Remove space after paragraph
                                                    </DropdownMenuItem>
                                                )}

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </>
                            )}
                         </div>
                         
                         <span className="text-xs text-muted-foreground ml-auto">
                            {viewMode === 'edit' ? 'Editor Mode' : 'Preview Mode'}
                         </span>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-white dark:bg-black relative">
                        {viewMode === 'edit' ? (
                            <>
                                {editor && (
                                    <FloatingMenu editor={editor} className="floating-menu flex items-center gap-1 p-1 rounded-md border bg-background shadow-md">
                                        <Button 
                                            size="sm" variant="ghost" className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                        >
                                            <Heading1 className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="sm" variant="ghost" className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
                                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                        >
                                            <Heading2 className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="sm" variant="ghost" className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="sm" variant="ghost" className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
                                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                        >
                                            <ListOrdered className="h-4 w-4" />
                                        </Button>
                                    </FloatingMenu>
                                )}
                                <EditorContent editor={editor} className="h-full" />
                            </>
                        ) : (
                            <div className="p-4 prose prose-sm sm:prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ 
                                __html: hydrateContract(content, {
                                     KOL_NAME: "Wahabdin Sangadji",
                                     BRAND_NAME: "Hubz",
                                     FEE_AMOUNT: 3500000,
                                     SOW: "1x IG Reel",
                                     PAYMENT_TERMS: "Net 30",
                                     START_DATE: new Date(),
                                     END_DATE: new Date(Date.now() + 86400000 * 30),
                                }) 
                            }} />
                        )}
                    </div>
                </Card>
            </div>

            {/* RIGHT: Variable Cheat Sheet */}
            {showVariables && (
                <div className="w-1/4 space-y-4 overflow-y-auto shrink-0 animate-in slide-in-from-right duration-300">
                     <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Variables</h3>
                    <div className="space-y-3">
                        {CONTRACT_VARIABLES.map((v) => (
                             <Card key={v.value} className="cursor-pointer hover:bg-muted transition-colors active:scale-95" onClick={() => insertVariable(v.value)}>
                                <CardContent className="p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="outline" className="font-mono text-xs">{v.value}</Badge>
                                        <Copy className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    <div className="font-medium text-sm">{v.label}</div>
                                    <div className="text-xs text-muted-foreground">{v.description}</div>
                                </CardContent>
                             </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
