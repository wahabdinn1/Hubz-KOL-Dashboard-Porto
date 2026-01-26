"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Printer, FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { hydrateContract, ContractData } from "@/lib/contracts/hydrator";
import { useData } from "@/context/data-context"; 
import { Skeleton } from "@/components/retroui/Skeleton";

interface Template {
    id: string;
    name: string;
    content: string;
    is_default?: boolean;
}

export default function ContractGeneratorPage() {
    const { kols, campaigns } = useData(); 
    const searchParams = useSearchParams();
    
    // State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("");
    const [templateContent, setTemplateContent] = useState<string>("");
    
    // Form Data
    const [formData, setFormData] = useState<ContractData>({
        BRAND_NAME: "CV. Hubz Nusantara", 
        KOL_NAME: "",
        KOL_NIK: "",
        KOL_ADDRESS: "",
        FEE_AMOUNT: 0,
        SOW: "",
        PAYMENT_TERMS: "50% Down Payment, 50% upon completion.",
        START_DATE: "",
        END_DATE:  "",
    });

    useEffect(() => {
        // Initialize Dates on client side
        const t = setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                START_DATE: new Date().toISOString().split('T')[0],
                END_DATE:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }));
        }, 0);
        return () => clearTimeout(t);
    }, []);

    // Auto-fill Handlers
    const handleCampaignSelect = (campaignId: string) => {
        const camp = campaigns.find(c => c.id === campaignId);
        if (camp) {
            setFormData(prev => ({
                ...prev,
                SOW: camp.deliverables.map(d => {
                     const kol = kols.find(k => k.id === d.kolId);
                     return `${kol?.name || 'KOL'}: ${d.videosCount} Video(s)`;
                }).join('\n'),
                START_DATE: camp.startDate || prev.START_DATE,
                END_DATE: camp.endDate || prev.END_DATE,
            }));
            toast.success("Details auto-filled from Campaign");
        }
    };

    // Auto-fill from URL
    useEffect(() => {
        const t = setTimeout(() => {
            const cId = searchParams.get("campaignId");
            const kId = searchParams.get("kolId");

            if (cId && campaigns.length > 0) {
                 handleCampaignSelect(cId);
            }

            if (kId && kols.length > 0) {
                const kol = kols.find(k => k.id === kId);
                if (kol) {
                    setFormData(prev => ({
                        ...prev,
                        KOL_NAME: kol.name,
                        // If we had more fields in KOL object, we'd map them here
                    }));
                }
            }
        }, 0);
        return () => clearTimeout(t);
        // eslint-disable-next-line
    }, [searchParams, campaigns, kols]); 
    // Note: handleCampaignSelect is defined below, need to ensure stability or move it up, 
    // or just duplicate logic inside effect to avoid dependency cycles if not wrapped in useCallback.
    // simpler to just call the logic directly here or make handleCampaignSelect stable.
    
    // ... rest of component

    // Loading
    const [loading, setLoading] = useState(true);

    // Fetch Templates
    useEffect(() => {
        const loadTemplates = async () => {
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const { data } = await (supabase as any).from("contract_templates").select("*");
             if (data) {
                 setTemplates(data);
                 // Default to "Default" or first
                 const def = data.find((t: Template) => t.is_default) || data[0];
                 if (def) {
                     setSelectedTemplate(def.id);
                     setTemplateContent(def.content);
                 }
             }
             setLoading(false);
        };
        loadTemplates();
    }, []);

    // Handle Template Change
    const handleTemplateChange = (val: string) => {
        setSelectedTemplate(val);
        const t = templates.find(temp => temp.id === val);
        if (t) setTemplateContent(t.content);
    };



    const handleDataChange = (field: keyof ContractData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Print Handler
    const handlePrint = () => {
        window.print();
    };

    // Hydrate
    const previewContent = hydrateContract(templateContent, formData);

    if (loading) return <div className="p-8"><Skeleton className="h-full w-full" /></div>;

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* TOP BAR - Hidden on Print */}
            <header className="h-14 border-b flex items-center justify-between px-6 bg-card z-10 print:hidden">
                <div className="flex items-center gap-2 font-semibold">
                    <FileText className="h-5 w-5 text-primary" />
                    Contract Generator
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 mr-2" /> Print / PDF
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden print:overflow-visible">
                {/* LEFT PANEL - CONTROLS - Hidden on Print */}
                <div className="w-[35%] overflow-y-auto border-r bg-muted/10 p-6 space-y-6 print:hidden">
                    
                    {/* 1. Template Selection */}
                    <div className="space-y-2">
                        <Label>Contract Template</Label>
                        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* 2. Auto-Fill Tools */}
                    <Card className="border-dashed bg-muted/20 shadow-none">
                        <CardContent className="p-3 space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase">Quick Fill</Label>
                             <Select onValueChange={handleCampaignSelect}>
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Load from Campaign..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {campaigns.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* 3. Form Fields */}
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label>KOL Full Name</Label>
                            <Input 
                                placeholder="e.g. Wahabdin Sangadji" 
                                value={formData.KOL_NAME}
                                onChange={e => handleDataChange("KOL_NAME", e.target.value)}
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>NIK (KTP)</Label>
                                <Input 
                                    placeholder="16-digit ID" 
                                    value={formData.KOL_NIK}
                                    onChange={e => handleDataChange("KOL_NIK", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fee Amount (IDR)</Label>
                                <Input 
                                    type="number"
                                    placeholder="Total Fee" 
                                    value={formData.FEE_AMOUNT || ''}
                                    onChange={e => handleDataChange("FEE_AMOUNT", Number(e.target.value))}
                                />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label>Address</Label>
                            <Textarea 
                                placeholder="Full residential address" 
                                className="h-20"
                                value={formData.KOL_ADDRESS}
                                onChange={e => handleDataChange("KOL_ADDRESS", e.target.value)}
                            />
                        </div>

                         <div className="space-y-2">
                            <Label>Scope of Work</Label>
                            <Textarea 
                                placeholder="- 1x Instagram Reel&#10;- 1x TikTok Video" 
                                className="h-24"
                                value={formData.SOW}
                                onChange={e => handleDataChange("SOW", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Terms</Label>
                            <Input 
                                placeholder="Terms" 
                                value={formData.PAYMENT_TERMS}
                                onChange={e => handleDataChange("PAYMENT_TERMS", e.target.value)}
                            />
                        </div>
                        
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input 
                                    type="date"
                                    value={formData.START_DATE as string}
                                    onChange={e => handleDataChange("START_DATE", e.target.value)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input 
                                    type="date"
                                    value={formData.END_DATE as string}
                                    onChange={e => handleDataChange("END_DATE", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - PREVIEW */}
                <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-900 p-8 flex justify-center print:p-0 print:bg-white print:overflow-visible">
                    <div 
                        className="
                            bg-white text-black 
                            w-[210mm] min-h-[297mm] 
                            p-[25mm] 
                            shadow-xl 
                            print:shadow-none print:w-full print:h-auto print:p-0
                            font-serif text-[12pt] leading-relaxed text-justify
                            whitespace-pre-wrap
                        "
                    >
                        {previewContent || "Select a template to generate preview..."}
                    </div>
                </div>
            </div>
        </div>
    );
}
