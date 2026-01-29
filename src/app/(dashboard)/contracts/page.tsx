"use client";

import React, { useMemo, useState } from 'react';
import { useData } from "@/context/data-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { DataView } from "@/components/shared/data-view";
import { EmptyState, EmptyStateIcons } from "@/components/retroui/EmptyState";

type ContractStatus = 'UNSENT' | 'DRAFT' | 'GENERATED' | 'SIGNED';

export default function ContractsPage() {
    const { campaigns, kols, loading } = useData();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ContractStatus | "ALL">("ALL");
    const [campaignFilter, setCampaignFilter] = useState<string>("ALL");

    // Flatten contracts from all campaigns
    const allContracts = useMemo(() => {
        return campaigns.flatMap(campaign =>
            campaign.deliverables.map(d => {
                const kol = kols.find(k => k.id === d.kolId);
                return {
                    id: `${campaign.id}-${d.kolId}`, // Virtual ID for key
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    kolId: d.kolId,
                    kolName: kol?.name || "Unknown",
                    kolAvatar: kol?.avatar,
                    fee: d.collaborationType === 'PAID' ? d.fixedFee : `${d.commissionRate}% Commission`,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status: (d as any).contractStatus as ContractStatus, 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    contractNumber: (d as any).contractNumber,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    signedUrl: (d as any).signedUrl,
                    // Link to the NEW builder page
                    builderLink: `/contracts/builder?campaignId=${campaign.id}&kolId=${d.kolId}`
                };
            })
        );
    }, [campaigns, kols]);

    // Filter logic
    const filteredContracts = useMemo(() => {
        return allContracts.filter(contract => {
            const matchesSearch = contract.kolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contract.campaignName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || contract.status === statusFilter;
            const matchesCampaign = campaignFilter === "ALL" || contract.campaignId === campaignFilter;

            return matchesSearch && matchesStatus && matchesCampaign;
        });
    }, [allContracts, searchQuery, statusFilter, campaignFilter]);

    const getStatusBadge = (status: ContractStatus) => {
        switch (status) {
            case 'SIGNED':
                return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Signed</Badge>;
            case 'GENERATED':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Generated</Badge>;
            case 'DRAFT':
                return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Draft</Badge>;
            default:
                return <Badge variant="outline" className="text-gray-500">Unsent</Badge>;
        }
    };

    // Mobile View Card Component
    const mobileView = (
        <div className="space-y-4 p-4">
             {filteredContracts.map((contract) => (
                <div 
                    key={contract.id}
                    className="p-4 border-2 border-black rounded-lg bg-white dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-black">
                                <AvatarImage src={contract.kolAvatar} />
                                <AvatarFallback>{contract.kolName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-bold">{contract.kolName}</div>
                                <div className="text-sm text-gray-500">{contract.campaignName}</div>
                            </div>
                        </div>
                        {getStatusBadge(contract.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                            <span className="text-gray-500 block text-xs">Contract No.</span>
                            <span className="font-mono">{contract.contractNumber || '-'}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-gray-500 block text-xs">Fee Arrangement</span>
                            <span className="font-medium">
                                {typeof contract.fee === 'number'
                                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(contract.fee)
                                    : contract.fee || '-'}
                            </span>
                        </div>
                    </div>

                    <Link href={contract.builderLink} className="w-full">
                        <Button className="w-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all">
                            <FileText className="h-4 w-4 mr-2" />
                            Manage Contract
                        </Button>
                    </Link>
                </div>
            ))}
        </div>
    );

    // Desktop View Table Component
    const desktopView = (
        <Table>
            <TableHeader className="bg-gray-50/50">
                <TableRow>
                    <TableHead>Influencer</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Fee Arrangement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contract No.</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredContracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-black shadow-sm">
                                    <AvatarImage src={contract.kolAvatar} />
                                    <AvatarFallback>{contract.kolName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium text-sm text-gray-900">{contract.kolName}</div>
                            </div>
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium">{contract.campaignName}</TableCell>
                        <TableCell>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-700 border border-black/10">
                                {typeof contract.fee === 'number'
                                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(contract.fee)
                                    : contract.fee || '-'}
                            </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-500">
                            {contract.contractNumber || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                            <Link href={contract.builderLink}>
                                <Button size="sm" variant="outline" className="gap-2 h-8 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all">
                                    <FileText className="h-3.5 w-3.5" />
                                    Manage
                                </Button>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    // Filters Component
    const filters = (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 flex-1 w-full">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search influencer or campaign..."
                        className="pl-9 bg-white shadow-none focus-visible:ring-0 focus-visible:shadow-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white shadow-none">
                        <SelectValue placeholder="All Campaigns" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Campaigns</SelectItem>
                        {campaigns.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContractStatus | "ALL")}>
                    <SelectTrigger className="w-full sm:w-[150px] bg-white shadow-none">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="UNSENT">Unsent</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="GENERATED">Generated</SelectItem>
                        <SelectItem value="SIGNED">Signed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <DataView
            pageTitle="Contract Control Center"
            pageDescription="Manage and audit contracts across all campaigns and influencers."
            filters={filters}
            cardTitle="All Contracts"
            desktopView={desktopView}
            mobileView={mobileView}
            isEmpty={filteredContracts.length === 0}
            isLoading={loading}
            emptyState={
                <EmptyState 
                    icon={EmptyStateIcons.folder}
                    title="No contracts found"
                    description="To create a contract, first add a KOL to a campaign."
                    action={
                        <Link href="/campaigns">
                            <Button className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all">Go to Campaigns</Button>
                        </Link>
                    }
                />
            }
        />
    );
}
