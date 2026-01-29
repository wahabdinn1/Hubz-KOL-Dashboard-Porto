"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Variable } from "./extensions/variable";
import { ContractSidebar } from "./contract-sidebar";
import { supabase } from "@/lib/supabase/client";
import { EditorToolbar } from "./editor-toolbar";
import { FloatingMenu } from "@tiptap/react/menus";
import { Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarginExtension, CustomLineHeight } from "@/lib/tiptap/line-height";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import UnderlineExtension from "@tiptap/extension-underline";
import FloatingMenuExtension from "@tiptap/extension-floating-menu";
import { useData } from "@/context/data-context";
import { CONTRACT_TEMPLATES, CampaignTemplate } from "@/lib/contract-templates";
import { toast } from "sonner";

// Local types matching sidebar
interface Variables {
    legalName: string;
    nik: string;
    feeAmount: string;
    paymentTerms: string;
    campaignName: string;
}

interface ContractBuilderProps {
    campaignId: string;
    kolId: string;
}

export function ContractBuilder({ campaignId, kolId }: ContractBuilderProps) {
    const { kols, campaigns, updateCampaignDeliverableDB } = useData();
    const [variables, setVariables] = useState<Variables>({
        legalName: "",
        nik: "",
        feeAmount: "",
        paymentTerms: "Net 30",
        campaignName: "",
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState<CampaignTemplate[]>([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            const { data } = await supabase
                .from('contract_templates')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                setTemplates(data);
            } else {
                setTemplates(CONTRACT_TEMPLATES);
            }
        };
        fetchTemplates();
    }, []);

    // Load initial data
    useEffect(() => {
        if (!kols.length || !campaigns.length) return;

        const campaign = campaigns.find(c => c.id === campaignId);
        const kol = kols.find(k => k.id === kolId);

        if (campaign && kol) {
            const deliverable = campaign.deliverables.find(d => d.kolId === kolId);
            
            // Auto-fill vars
            setVariables({
                legalName: kol.name, 
                nik: "", 
                feeAmount: deliverable?.fixedFee?.toString() || (deliverable?.collaborationType === 'AFFILIATE' ? `${deliverable?.commissionRate}%` : "0"),
                paymentTerms: "Net 30",
                campaignName: campaign.name
            });
        }
    }, [campaignId, kolId, kols, campaigns]);

    const editor = useEditor({
        extensions: [
             StarterKit,
             UnderlineExtension,
             TextStyle,
             TextAlign.configure({ types: ['heading', 'paragraph'] }),
             CustomLineHeight.configure({ types: ['heading', 'paragraph'] }),
             MarginExtension,
             Placeholder.configure({ placeholder: "Write contract content here..." }),
             FloatingMenuExtension.configure({ element: undefined }),
             Variable,
        ],
        content: "<p>Select a template to begin...</p>",
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[297mm] p-[20mm]', 
            },
        },
        immediatelyRender: false,
    });

    // Live Sync Effect: Update Variable Nodes when state changes
    useEffect(() => {
        if (!editor) return;

        // Traverse doc and update attributes of variable nodes
        editor.commands.command(({ tr, state, dispatch }) => {
            const { doc } = state;
            let modified = false;

            doc.descendants((node, pos) => {
                if (node.type.name === 'variable') {
                    const id = node.attrs.id;
                    let newValue = "";

                    // Map ID to variable state
                    if (id === 'KOL_NAME') newValue = variables.legalName;
                    else if (id === 'KOL_NIK') newValue = variables.nik;
                    else if (id === 'FEE_AMOUNT') newValue = variables.feeAmount;
                    else if (id === 'PAYMENT_TERMS') newValue = variables.paymentTerms;
                    else if (id === 'TODAY_DATE') {
                         newValue = new Date().toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' });
                    }
                    else if (id === 'BRAND_NAME') newValue = "CV. Hubz Nusantara";
                    else return; 

                    // Only update if changed
                    if (newValue !== node.attrs.value) {
                         if (dispatch) {
                             tr.setNodeMarkup(pos, undefined, { ...node.attrs, value: newValue || "________________" });
                             modified = true;
                         }
                    }
                }
            });

            return modified;
        });

    }, [variables, editor]);

    const handleVariableChange = (key: keyof Variables, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }));
    };

    const hydrateTemplate = (templateContent: string) => {
        let content = templateContent;
        
        const createVar = (id: string, label: string, initialValue: string) => {
            const val = initialValue || "________________";
            return `<span data-variable-id="${id}" data-label="${label}" data-value="${val}"></span>`;
        };

        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric' });

        content = content.replace(/{KOL_NAME}/g, createVar("KOL_NAME", "KOL Name", variables.legalName));
        content = content.replace(/{KOL_NIK}/g, createVar("KOL_NIK", "NIK", variables.nik));
        content = content.replace(/{KOL_ADDRESS}/g, "________________"); 
        content = content.replace(/{BRAND_NAME}/g, createVar("BRAND_NAME", "Brand", "CV. Hubz Nusantara"));
        content = content.replace(/{FEE_AMOUNT}/g, createVar("FEE_AMOUNT", "Fee", variables.feeAmount));
        content = content.replace(/{SOW}/g, "<ul><li>Create 1 TikTok Video</li></ul>");
        content = content.replace(/{PAYMENT_TERMS}/g, createVar("PAYMENT_TERMS", "Terms", variables.paymentTerms));
        content = content.replace(/{START_DATE}/g, "________________");
        content = content.replace(/{END_DATE}/g, "________________");
        content = content.replace(/{TODAY_DATE}/g, createVar("TODAY_DATE", "Date", dateStr));
        content = content.replace(/{CONTRACT_NUMBER}/g, "DRAFT-001");

        return content;
    };

    const handleTemplateSelect = (templateId: string) => {
        let tpl = templates.find(t => t.id === templateId);
        if (!tpl) tpl = CONTRACT_TEMPLATES.find(t => t.id === templateId);

        if (tpl && editor) {
            const hydrated = hydrateTemplate(tpl.content);
            editor.commands.setContent(hydrated);
            toast.success("Template loaded with live variables");
        }
    };

    const handleReset = () => {
        toast.info("Please re-select a template to reset.");
    };

    const handleSaveDraft = async () => {
        if (!editor) return;
        setIsSaving(true);
        try {
            const json = editor.getJSON();
            await updateCampaignDeliverableDB(campaignId, kolId, {
                contractStatus: 'DRAFT',
                contractContent: json
            });
            toast.success("Draft saved");
        } catch (error) {
            toast.error("Failed to save draft");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-row h-[calc(100vh-(--spacing(16)))]">
            {/* Left Sidebar */}
            <ContractSidebar
                variables={variables}
                templates={templates}
                onVariableChange={handleVariableChange}
                onTemplateSelect={handleTemplateSelect}
                onSaveDraft={handleSaveDraft}
                onPrint={handlePrint}
                onReset={handleReset}
                isSaving={isSaving}
            />

            {/* Right Editor Canvas */}
            <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center print:bg-white print:p-0 relative">
                 <div className="flex flex-col w-full h-full relative">
                    {/* Toolbar Area */}
                    <div className="sticky top-0 z-10 bg-white border-b shadow-sm w-full flex justify-center py-2 print:hidden">
                        <div className="w-[210mm]">
                            <EditorToolbar editor={editor} />
                        </div>
                    </div>

                    {/* Scrollable Paper Area */}
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                        <div className="
                            bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-lg
                            print:shadow-none print:w-full print:h-full print:p-0
                        ">
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
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
}
