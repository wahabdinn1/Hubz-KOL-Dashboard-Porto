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
import { Plus, Trash2, GripVertical, Settings, User as UserIcon, List, Database, FileText, HelpCircle, Info, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { updatePassword } from "@/app/auth/actions";
import { useState, useEffect } from "react";
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
import { SeedDataButton } from "@/components/shared/seed-data-button";
import { CampaignTemplate } from "@/lib/campaign-templates";

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


import { useAuth } from "@/context/auth-context";
import { Users as UsersIcon } from "lucide-react";

// --- Main Content ---
export function SettingsClient({ user }: { user: User | null }) {
    const { categories, addCategory, deleteCategory, updateCategoryOrder, campaignTemplates, addCampaignTemplate, deleteCampaignTemplate } = useData();
    const { role, isSuperAdmin, isAdmin } = useAuth();
    const [newCategory, setNewCategory] = useState("");

    // TikTok session cookie state
    const [tiktokCookie, setTiktokCookie] = useState("");
    const [tiktokCookieLoading, setTiktokCookieLoading] = useState(false);
    const [tiktokCookieSaved, setTiktokCookieSaved] = useState(false);
    const [showCookie, setShowCookie] = useState(false);

    // Fetch TikTok cookie on mount
    useEffect(() => {
        const fetchTikTokSettings = async () => {
            try {
                const response = await fetch('/api/tiktok/settings');
                const data = await response.json();
                if (data.status === 'success') {
                    setTiktokCookie(data.data.tiktok_session_cookie || '');
                }
            } catch (error) {
                console.error('Failed to fetch TikTok settings:', error);
            }
        };
        fetchTikTokSettings();
    }, []);

    const handleSaveTikTokCookie = async () => {
        setTiktokCookieLoading(true);
        setTiktokCookieSaved(false);
        try {
            const response = await fetch('/api/tiktok/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tiktok_session_cookie: tiktokCookie }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setTiktokCookieSaved(true);
                setTimeout(() => setTiktokCookieSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save TikTok settings:', error);
        } finally {
            setTiktokCookieLoading(false);
        }
    };

    // Templates form state
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateDesc, setNewTemplateDesc] = useState("");
    const [newTemplatePlatform, setNewTemplatePlatform] = useState<"TikTok" | "Instagram">("TikTok");
    const [newTemplateBudget, setNewTemplateBudget] = useState("");

    const handleAddTemplate = async () => {
        if (!newTemplateName.trim()) return;
        await addCampaignTemplate({
            name: newTemplateName.trim(),
            description: newTemplateDesc.trim(),
            defaultValues: {
                platform: newTemplatePlatform,
                budget: parseFloat(newTemplateBudget) || 50000000,
            },
        });
        setNewTemplateName("");
        setNewTemplateDesc("");
        setNewTemplateBudget("");
    };

    const handleDeleteTemplate = async (id: string) => {
        await deleteCampaignTemplate(id);
    };

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
                        <TabsTrigger value="tiktok" className="gap-2">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                            TikTok
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="members" className="gap-2"><UsersIcon className="h-4 w-4" /> Team Members</TabsTrigger>
                        )}

                        {isAdmin && (
                            <TabsTrigger value="categories" className="gap-2"><List className="h-4 w-4" /> Categories</TabsTrigger>
                        )}

                        {isAdmin && (
                            <TabsTrigger value="templates" className="gap-2"><FileText className="h-4 w-4" /> Templates</TabsTrigger>
                        )}

                        {isSuperAdmin && (
                            <TabsTrigger value="system" className="gap-2"><Settings className="h-4 w-4" /> System</TabsTrigger>
                        )}
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
                                        <Input id="role" value={role?.toUpperCase() || "LOADING..."} disabled className="bg-muted" />
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

                    {/* TikTok Integration Tab - Available to all users */}
                    <TabsContent value="tiktok" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                    TikTok Integration
                                </CardTitle>
                                <CardDescription>
                                    Configure your TikTok session cookie to enable trending features and API access.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tiktokCookie">Full TikTok Cookie String</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="tiktokCookie"
                                                type={showCookie ? "text" : "password"}
                                                value={tiktokCookie}
                                                onChange={(e) => setTiktokCookie(e.target.value)}
                                                placeholder="Paste full cookie string (sessionid=...; msToken=...)"
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                onClick={() => setShowCookie(!showCookie)}
                                            >
                                                {showCookie ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                            </Button>
                                        </div>
                                        <Button onClick={handleSaveTikTokCookie} disabled={tiktokCookieLoading}>
                                            {tiktokCookieLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : tiktokCookieSaved ? (
                                                <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Saved</>
                                            ) : (
                                                'Save'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-2">
                                    <p className="font-medium">How to get your FULL TikTok cookie (Zen/Chrome/Firefox):</p>
                                    <ol className="list-decimal list-inside space-y-1 text-xs">
                                        <li>Log in to TikTok.com</li>
                                        <li>Right-click page &rarr; <strong>Inspect</strong> (or F12)</li>
                                        <li>Go to <strong>Network</strong> tab. Refresh the page.</li>
                                        <li>Filter by &quot;Doc&quot; or find the request named <code>www.tiktok.com</code></li>
                                        <li>Click that request. Look for <strong>Request Headers</strong> on the right/bottom.</li>
                                        <li>Find <strong>Cookie</strong> line. Right-click the value &rarr; <strong>Copy Value</strong>.</li>
                                        <li>The string should be VERY long (begins with <code>tt_webid=...</code> usually).</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {isAdmin && (
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
                    )}

                    {isAdmin && (
                        <TabsContent value="templates" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Campaign Templates</CardTitle>
                                            <CardDescription>Pre-defined templates for quick campaign creation.</CardDescription>
                                        </div>
                                        <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                                            {campaignTemplates.length} Templates
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Template List */}
                                    {campaignTemplates.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20 dark:bg-muted/10">
                                            <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                                            <p className="text-sm text-muted-foreground">No templates yet. Add your first template below.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {campaignTemplates.map((template: CampaignTemplate) => (
                                                <div
                                                    key={template.id}
                                                    className="flex items-center justify-between p-4 rounded-xl border-2 border-border/50 bg-card dark:bg-card/50 hover:border-border hover:shadow-sm transition-all group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-sm text-foreground">{template.name}</p>
                                                            <TooltipProvider delayDuration={200}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                                                                            <Info className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" className="max-w-xs">
                                                                        <p className="text-xs">{template.description || 'No description'}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{template.description}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${template.defaultValues.platform === 'TikTok'
                                                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                                                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                                                }`}>
                                                                {template.defaultValues.platform}
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                Rp {((template.defaultValues.budget || 0) / 1000000).toFixed(0)}M
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <TooltipProvider delayDuration={200}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                                    className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left">
                                                                <p className="text-xs">Delete template</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="border-t p-4 bg-muted/10 dark:bg-muted/5">
                                    <div className="grid gap-3 w-full">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <HelpCircle className="h-3 w-3" />
                                            <span>Add new templates for quick campaign creation</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Template name..."
                                                value={newTemplateName}
                                                onChange={(e) => setNewTemplateName(e.target.value)}
                                                className="bg-background"
                                            />
                                            <Input
                                                placeholder="Description..."
                                                value={newTemplateDesc}
                                                onChange={(e) => setNewTemplateDesc(e.target.value)}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                value={newTemplatePlatform}
                                                onChange={(e) => setNewTemplatePlatform(e.target.value as "TikTok" | "Instagram")}
                                                className="flex h-10 w-[140px] rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="TikTok">TikTok</option>
                                                <option value="Instagram">Instagram</option>
                                            </select>
                                            <Input
                                                placeholder="Default budget (IDR)..."
                                                type="number"
                                                value={newTemplateBudget}
                                                onChange={(e) => setNewTemplateBudget(e.target.value)}
                                                className="flex-1 bg-background"
                                            />
                                            <Button onClick={handleAddTemplate} className="gap-2">
                                                <Plus className="h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    )}

                    {isSuperAdmin && (
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
                    )}
                </Tabs>
            </div>
        </ThemeProvider>
    );
}
