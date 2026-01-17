"use client";

import { supabase } from "@/lib/supabase";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/retroui/Select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";



export function UserManagementTable() {
    const { role: currentUserRole } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Only Super Admin can change roles
    const canManageRoles = currentUserRole === "super_admin";

    // Fetch users on mount
    useState(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data, error } = await (supabase as any)
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    });

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this user from the workspace?")) return;

        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border-2 border-black overflow-hidden bg-background">
                <Table>
                    <TableHeader className="bg-primary border-b-2 border-black">
                        <TableRow className="hover:bg-primary/90">
                            <TableHead className="text-black font-bold">Name</TableHead>
                            <TableHead className="text-black font-bold">Email</TableHead>
                            <TableHead className="text-black font-bold">Role</TableHead>
                            <TableHead className="text-black font-bold">Joined</TableHead>
                            <TableHead className="text-black font-bold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading users...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-black">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                                {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div className="flex flex-col">
                                                <span>{user.full_name || "Unknown User"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            user.role === 'super_admin' ? 'default' :
                                                user.role === 'admin' ? 'secondary' : 'outline'
                                        } className="uppercase text-[10px] border-black">
                                            {user.role.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {canManageRoles && user.role !== 'super_admin' && (
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(val) => handleRoleChange(user.id, val)}
                                                >
                                                    <Select.Trigger className="h-8 w-[110px] text-xs">
                                                        <Select.Value />
                                                    </Select.Trigger>
                                                    <Select.Content>
                                                        <Select.Item value="admin">Admin</Select.Item>
                                                        <Select.Item value="member">Member</Select.Item>
                                                    </Select.Content>
                                                </Select>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={loading || user.role === 'super_admin'}
                                                title="Remove from Workspace"
                                            >
                                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {!canManageRoles && (
                <p className="text-xs text-muted-foreground italic">
                    * Only Super Admins can modify user roles.
                </p>
            )}
        </div>
    );
}
