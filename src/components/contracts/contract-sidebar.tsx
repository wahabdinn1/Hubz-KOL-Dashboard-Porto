"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Printer, Save, RefreshCw, FileText } from "lucide-react";
import { CONTRACT_TEMPLATES } from "@/lib/contract-templates"; 

interface ContractVariables {
    legalName: string;
    nik: string;
    feeAmount: string;
    paymentTerms: string;
    campaignName: string;
}

interface ContractSidebarProps {
    variables: ContractVariables;
    templates: { id: string; name: string }[];
    onVariableChange: (key: keyof ContractVariables, value: string) => void;
    onTemplateSelect: (templateId: string) => void;
    onSaveDraft: () => void;
    onPrint: () => void;
    onReset: () => void;
    isSaving?: boolean;
}

export function ContractSidebar({
    variables,
    templates = [],
    onVariableChange,
    onTemplateSelect,
    onSaveDraft,
    onPrint,
    onReset,
    isSaving = false
}: ContractSidebarProps) {
    return (
        <div className="w-[350px] border-r border-gray-200 flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Configurator
                </h2>
                <p className="text-xs text-gray-500 mt-1">Setup variables & template</p>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {/* Read-Only Campaign Info */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Context</Label>
                        <div className="bg-blue-50/50 p-3 rounded-md border border-blue-100 text-sm">
                            <span className="font-medium text-blue-900">{variables.campaignName}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Template Selection */}
                    <div className="space-y-3">
                        <Label>Contract Template</Label>
                        <Select onValueChange={onTemplateSelect}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.length > 0 ? templates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                )) : CONTRACT_TEMPLATES.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs gap-2"
                            onClick={onReset}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Apply Template
                        </Button>
                    </div>

                    <Separator />

                    {/* Variable Inputs */}
                    <div className="space-y-4">
                        <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Variables</Label>
                        
                        <div className="space-y-1.5">
                            <Label className="text-xs">KOL Legal Name (Pihak Kedua)</Label>
                            <Input 
                                value={variables.legalName} 
                                onChange={(e) => onVariableChange('legalName', e.target.value)}
                                className="bg-white h-9"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label className="text-xs">NIK / KTP</Label>
                            <Input 
                                value={variables.nik} 
                                onChange={(e) => onVariableChange('nik', e.target.value)}
                                className="bg-white h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Fee Amount (Rp)</Label>
                            <Input 
                                value={variables.feeAmount} 
                                onChange={(e) => onVariableChange('feeAmount', e.target.value)}
                                className="bg-white h-9"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs">Payment Terms</Label>
                            <Input 
                                value={variables.paymentTerms} 
                                onChange={(e) => onVariableChange('paymentTerms', e.target.value)}
                                placeholder="e.g. 14 Days after invoice"
                                className="bg-white h-9"
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 bg-white space-y-2">
                <Button 
                    className="w-full gap-2 font-medium" 
                    onClick={onSaveDraft} 
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : (
                        <>
                            <Save className="h-4 w-4" /> Save Draft (JSON)
                        </>
                    )}
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={onPrint}
                >
                    <Printer className="h-4 w-4" /> Print / PDF
                </Button>
            </div>
        </div>
    );
}
