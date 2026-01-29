"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ContractBuilder } from "@/components/contracts/contract-builder";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function BuilderContent() {
    const searchParams = useSearchParams();
    const campaignId = searchParams.get("campaignId");
    const kolId = searchParams.get("kolId");

    if (!campaignId || !kolId) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <h2 className="text-xl font-semibold">Missing Parameters</h2>
                <p className="text-gray-500">Please select a contract from the management dashboard.</p>
                <Link href="/contracts">
                    <Button>Return to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return <ContractBuilder campaignId={campaignId} kolId={kolId} />;
}

export default function ContractBuilderPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-white z-10 print:hidden shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/contracts">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-gray-200" />
                    <h1 className="font-semibold text-lg">Contract Builder</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
                <Suspense fallback={<div className="p-8 text-center">Loading builder...</div>}>
                    <BuilderContent />
                </Suspense>
            </div>
        </div>
    );
}
