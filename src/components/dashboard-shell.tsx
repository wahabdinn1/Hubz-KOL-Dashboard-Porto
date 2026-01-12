"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calculator,
    ChevronLeft,
    ChevronRight,
    Users,
    Settings,
    Menu,
    Briefcase,
    BarChart3,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
    { name: "Overview", href: "/", icon: BarChart3 },
    { name: "Campaigns", href: "/campaigns", icon: Briefcase },
    { name: "Influencers", href: "/influencers", icon: Users },
    { name: "ER Calculator", href: "/er-calculator", icon: Calculator },
    { name: "Settings", href: "/settings", icon: Settings },
];

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { User as SupabaseUser } from "@supabase/supabase-js";

// ... existing imports

export function DashboardShell({ children, user }: { children: React.ReactNode; user: SupabaseUser | null }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const userEmail = user?.email || "guest@hubz.com";
    const userInitials = userEmail.substring(0, 2).toUpperCase();
    const userName = userEmail.split("@")[0];

    return (
        <div className="flex min-h-screen bg-muted/40 font-sans">
            {/* Desktop Sidebar */}
            <aside className={`relative hidden flex-col border-r-2 border-black bg-background md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {/* ... Header ... */}
                <div className={`flex h-16 items-center border-b-2 border-black ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="bg-primary p-1.5 rounded-none text-primary-foreground border-2 border-black shadow-hard-sm">
                            {/* Simple Logo Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h1.5a.75.75 0 010 1.5H6a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v3a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V7.56l-5.47 5.47a.75.75 0 11-1.06-1.06l5.47-5.47h-2.94a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                            </svg>
                        </div>
                        {!isCollapsed && <span className="tracking-tight text-lg font-bold">Hubz KOL</span>}
                    </Link>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    <TooltipProvider delayDuration={0}>
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            const LinkComponent = (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 py-2 text-sm font-bold transition-all hover:bg-black hover:text-white rounded-md border-2 border-transparent hover:border-black ${isActive
                                        ? "bg-primary text-primary-foreground border-black shadow-hard-sm"
                                        : "text-muted-foreground"
                                        } ${isCollapsed ? 'justify-center px-2' : 'px-3'}`}
                                >
                                    <item.icon className="h-4 w-4 shrink-0" />
                                    {!isCollapsed && item.name}
                                </Link>
                            );

                            if (isCollapsed) {
                                return (
                                    <Tooltip key={item.name}>
                                        <TooltipTrigger asChild>
                                            {LinkComponent}
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="font-bold border-2 border-black shadow-hard-sm">
                                            {item.name}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return LinkComponent;
                        })}
                    </TooltipProvider>
                </nav>

                <div className="p-4 border-t-2 border-black mt-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={`w-full justify-start p-0 hover:bg-transparent ${isCollapsed ? 'justify-center' : ''}`}>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="h-9 w-9 shrink-0 rounded-none bg-secondary border-2 border-black flex items-center justify-center text-xs font-bold shadow-hard-sm hover:translate-y-[1px] hover:shadow-none transition-all text-secondary-foreground">
                                        {userInitials}
                                    </div>
                                    {!isCollapsed && (
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{userName}</p>
                                            <p className="text-xs text-muted-foreground truncate opacity-80">{userEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 mb-2 border-2 border-black shadow-hard" align="start" side="right">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-black" />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                onClick={async () => await logout()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {/* Removed separate logout button section */}

                { /* Floating Toggle Button on Border */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-6 z-40 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:flex items-center justify-center p-0"
                    onClick={toggleSidebar}
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col transition-all duration-300">
                {/* Mobile Header + Top Bar tools */}
                <header className="flex h-16 items-center gap-4 border-b-2 border-black bg-background px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[80vw] sm:w-[300px]">
                            <nav className="grid gap-2 text-lg font-medium">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="flex items-center gap-4 py-2 hover:text-primary"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="w-full flex-1">
                        {/* Can add search bar here if needed */}
                    </div>

                    <div className="flex items-center gap-2">
                        <ModeToggle />
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Breadcrumbs />
                    {children}
                </main>
            </div>
        </div>
    );
}
