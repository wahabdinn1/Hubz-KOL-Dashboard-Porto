"use client";

import { ThemeProvider } from "@/components/theme-provider";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/context/data-context";
import { Plus, Trash2, GripVertical, Settings, User as UserIcon, List, Database } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";
import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from "@/lib/static-data";
import { SeedDataButton } from "@/components/seed-data-button";

// --- Sortable Item Component ---
interface SortableCategoryProps {
    category: Category;
    onDelete: (id: string) => void;
}

function SortableCategoryItem({ category, onDelete }: SortableCategoryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/10 hover:border-accent/50 transition-all group"
        >
            <div className="flex items-center gap-3">
                <div {...attributes} {...listeners} className="cursor-move text-muted-foreground/50 hover:text-foreground p-1 rounded hover:bg-muted transition-colors">
                    <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{category.name}</span>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category.id)}
                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-all"
                title="Delete Category"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

import { User } from "@supabase/supabase-js";

// --- Main Content ---
export function SettingsClient({ user }: { user: User | null }) {
    const { categories, addCategory, deleteCategory, updateCategoryOrder } = useData();
    const [newCategory, setNewCategory] = useState("");

    const userEmail = user?.email || "admin@hubz.com";
    const userName = userEmail.split("@")[0];
    const userInitials = userEmail.substring(0, 2).toUpperCase();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(categories, oldIndex, newIndex);
                updateCategoryOrder(newOrder);
            }
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        await addCategory(newCategory.trim());
        setNewCategory("");
    };

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage workspace preferences and configurations.</p>
                </div>

                <Tabs defaultValue="general" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="general" className="gap-2"><UserIcon className="h-4 w-4" /> General</TabsTrigger>
                        <TabsTrigger value="categories" className="gap-2"><List className="h-4 w-4" /> Categories</TabsTrigger>
                        <TabsTrigger value="system" className="gap-2"><Settings className="h-4 w-4" /> System</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Manage your public profile and contact info.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary">
                                        {userInitials}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg uppercase">{userName}</h3>
                                        <p className="text-sm text-muted-foreground">{userEmail}</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="displayName">Display Name</Label>
                                        <Input id="displayName" defaultValue={userName} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input id="role" defaultValue="Super Admin" disabled className="bg-muted" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4 bg-muted/20">
                                <Button>Save Profile</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage your password and security settings.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={async (formData) => {
                                    const password = formData.get("password") as string;
                                    const confirm = formData.get("confirm") as string;
                                    if (password !== confirm) {
                                        alert("Passwords do not match");
                                        return;
                                    }
                                    await updatePassword(password);
                                    alert("Password updated successfully");
                                }} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input id="password" name="password" type="password" placeholder="Enter new password" required minLength={6} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm">Confirm Password</Label>
                                        <Input id="confirm" name="confirm" type="password" placeholder="Confirm new password" required minLength={6} />
                                    </div>
                                    <Button type="submit" variant="secondary">Update Password</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                        <Card className="min-h-[500px] flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle>Influencer Categories</CardTitle>
                                        <CardDescription>
                                            Define the categories used to classify influencers. Drag to reorder.
                                        </CardDescription>
                                    </div>
                                    <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                                        {categories.length} Categories
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={categories}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-2">
                                            {categories.length === 0 ? (
                                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                                    <p className="text-sm text-muted-foreground">No categories defined yet.</p>
                                                </div>
                                            ) : (
                                                categories.map((category) => (
                                                    <SortableCategoryItem
                                                        key={category.id}
                                                        category={category}
                                                        onDelete={deleteCategory}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </CardContent>
                            <CardFooter className="border-t p-4 bg-muted/20">
                                <form onSubmit={handleAddCategory} className="flex gap-2 w-full max-w-md">
                                    <Input
                                        placeholder="Add new category..."
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="bg-background"
                                    />
                                    <Button type="submit">
                                        <Plus className="h-4 w-4 mr-2" /> Add
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Configuration</CardTitle>
                                <CardDescription>Technical details and connection status.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 p-4 border rounded-lg">
                                    <div className="p-2 bg-green-500/10 rounded-full">
                                        <Database className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">Database Connection</h4>
                                        <p className="text-xs text-muted-foreground">Connected to Supabase (Production)</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-medium text-green-600">Active</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">Development Tools</h4>
                                        <p className="text-xs text-muted-foreground">Utilities for managing test data.</p>
                                    </div>
                                    <SeedDataButton />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ThemeProvider>
    );
}
