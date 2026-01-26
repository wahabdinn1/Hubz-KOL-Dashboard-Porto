"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: "super_admin" | "admin" | "member";
    avatar_url?: string;
    created_at: string;
}

const columns: ColumnDef<Profile>[] = [
    {
        accessorKey: "full_name",
        header: "Name",
        cell: ({ row }) => {
            const profile = row.original;
            const initials = profile.full_name
                ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                : "?";

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{profile.full_name || "Unknown"}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.original.role;
            let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
            
            if (role === "super_admin") variant = "destructive";
            else if (role === "admin") variant = "default";
            else variant = "secondary";

            return (
                <Badge variant={variant} className="capitalize rounded-sm">
                    {role.replace("_", " ")}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => {
            return new Date(row.original.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        },
    },
];

export function TeamMembersTable() {
    const [data, setData] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching profiles:", error);
            } else {
                setData(profiles as Profile[]);
            }
            setLoading(false);
        };

        fetchProfiles();
    }, []);

    if (loading) {
        return <div className="text-center py-10 text-muted-foreground">Loading team members...</div>;
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            searchKey="full_name"
            searchPlaceholder="Search members..."
        />
    );
}
