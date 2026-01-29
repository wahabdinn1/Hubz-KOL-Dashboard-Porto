"use client";

import { Bold, Italic, Underline, Heading1, Heading2, AlignCenter, AlignLeft, AlignRight, List, ListOrdered, ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
// ToggleGroup imports removed
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Editor } from "@tiptap/react";

interface EditorToolbarProps {
    editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    if (!editor) return null;

    return (
        <div className="p-2 border-b flex items-center gap-1 bg-muted/20 shrink-0 flex-wrap">
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

            <Button 
                size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`} 
                onClick={() => editor.chain().focus().toggleBulletList().run()} 
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button 
                size="icon" variant="ghost" className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`} 
                onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
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
                    
                    <DropdownMenuLabel>Paragraph Spacing</DropdownMenuLabel>
                    
                    {editor.getAttributes('paragraph').marginTop === '0' ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginTop('1em').run()}>
                            <span className="w-6 mr-2" />
                            Add space before paragraph
                        </DropdownMenuItem>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginTop('0').run()}>
                            <span className="w-6 mr-2" />
                            Remove space before paragraph
                        </DropdownMenuItem>
                    )}

                    {editor.getAttributes('paragraph').marginBottom === '0' ? (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginBottom('1em').run()}>
                            <span className="w-6 mr-2" />
                            Add space after paragraph
                        </DropdownMenuItem>
                    ) : (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <DropdownMenuItem onClick={() => (editor.chain().focus() as any).setMarginBottom('0').run()}>
                            <span className="w-6 mr-2" />
                            Remove space after paragraph
                        </DropdownMenuItem>
                    )}

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
