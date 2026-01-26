"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/retroui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/retroui/Skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ContractItem {
    id: string; // deliverable_id
    contract_status: 'UNSENT' | 'GENERATED' | 'SIGNED';
    kol: {
        id: string;
        name: string;
        tiktok_username: string; // Changed from username
    };
    campaign: {
        id: string;
        name: string;
    };
    created_at: string;
    videos_count: number;
}

export default function ContractsPage() {
    const [contracts, setContracts] = useState<ContractItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        fetchContracts();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            // Fetch deliverables joined with KOLs and Campaigns
            // We use the raw supabase client to get the verified schema data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from("campaign_deliverables")
                .select(`
                    id,
                    contract_status,
                    created_at,
                    videos_count,
                    kols ( id, name, tiktok_username ),
                    campaigns ( id, name )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Transform data if necessary, though the select shape matches our interface mostly
            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const formatted: ContractItem[] = data.map((item: any) => ({
                    id: item.id,
                    contract_status: item.contract_status || 'UNSENT',
                    // Handle potential array or object return from join
                    kol: Array.isArray(item.kols) ? item.kols[0] : item.kols,
                    campaign: Array.isArray(item.campaigns) ? item.campaigns[0] : item.campaigns,
                    created_at: item.created_at,
                    videos_count: item.videos_count
                }));
                setContracts(formatted);
            }
        } catch (error) {
            console.error("Error fetching contracts:", error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any).message) console.error("Error Message:", (error as any).message);
            toast.error("Failed to load contracts list");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkSigned = async (id: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from("campaign_deliverables")
                .update({ contract_status: 'SIGNED' })
                .eq('id', id);

            if (error) throw error;
            
            setContracts(prev => prev.map(c => 
                c.id === id ? { ...c, contract_status: 'SIGNED' } : c
            ));
            toast.success("Marked as Signed");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const filteredContracts = contracts.filter(c => {
        const matchesSearch = 
            c.kol?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.campaign?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || c.contract_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SIGNED': return <Badge className="bg-green-600">Signed</Badge>;
            case 'GENERATED': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Generated</Badge>;
            default: return <Badge variant="outline" className="text-gray-500">Unsent</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto hidden-scrollbar">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Contract Management</h1>
                    <p className="text-muted-foreground">Monitor and generate contracts for your campaigns.</p>
                </div>
                <Link href="/contracts/generator">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Contract
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                         <div className="relative w-full sm:w-96">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search KOL or Campaign..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="UNSENT">Unsent</SelectItem>
                                    <SelectItem value="GENERATED">Generated</SelectItem>
                                    <SelectItem value="SIGNED">Signed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>KOL</TableHead>
                                    <TableHead>Campaign</TableHead>
                                    <TableHead>Date Created</TableHead>
                                    <TableHead>Deliverables</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredContracts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No contracts found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContracts.map((contract) => (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">
                                                <div>{contract.kol?.name || "Unknown KOL"}</div>
                                                <div className="text-xs text-muted-foreground">@{contract.kol?.tiktok_username || "unknown"}</div>
                                            </TableCell>
                                            <TableCell>{contract.campaign?.name || "Unknown Campaign"}</TableCell>
                                            <TableCell>
                                                {contract.created_at ? format(new Date(contract.created_at), "MMM d, yyyy") : "-"}
                                            </TableCell>
                                            <TableCell>{contract.videos_count} Video(s)</TableCell>
                                            <TableCell>{getStatusBadge(contract.contract_status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {contract.contract_status === 'SIGNED' ? (
                                                        <Button variant="ghost" size="sm" disabled>
                                                            <Filter className="h-4 w-4 mr-1" />
                                                            Completed
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {contract.contract_status !== 'GENERATED' && (
                                                                <Link 
                                                                    href={`/contracts/generator?campaignId=${contract.campaign?.id}&kolId=${contract.kol?.id}`}
                                                                >
                                                                    <Button variant="outline" size="sm">
                                                                        <FileText className="h-4 w-4 mr-1" />
                                                                        Generate
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => handleMarkSigned(contract.id)}
                                                            >
                                                                Mark Signed
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
