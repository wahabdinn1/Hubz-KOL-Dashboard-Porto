"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight,
    Users,
    Settings,
    Menu,
    Briefcase,
    BarChart3,
    LogOut,
    ChevronDown,
    LayoutDashboard,
    PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// --- Types & Data ---

type NavItem = {
    name: string;
    icon: any;
    href?: string;
    items?: { name: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        items: [
            { name: "Overview", href: "/" },
            { name: "ER Calculator", href: "/er-calculator" },
        ]
    },
    { name: "Campaigns", href: "/campaigns", icon: Briefcase },
    { name: "Influencers", href: "/influencers", icon: Users },
    {
        name: "System",
        icon: Settings,
        items: [
            { name: "Global Settings", href: "/settings" }
        ]
    },
];

// --- Sub-Components ---

function SidebarItem({ item, isCollapsed, pathname }: { item: NavItem, isCollapsed: boolean, pathname: string }) {
    const isActive = item.href === pathname || item.items?.some(sub => sub.href === pathname);
    const [isOpen, setIsOpen] = useState(isActive);

    // Auto-expand if child is active
    useEffect(() => {
        if (isActive) setIsOpen(true);
    }, [pathname, isActive]);

    const hasChildren = item.items && item.items.length > 0;

    // Collapsed State (Icon Only)
    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href || (item.items ? item.items[0].href : "#")}
                        className={`flex justify-center p-2 rounded-md transition-all duration-200 border-2 border-transparent hover:border-black hover:bg-black hover:text-white ${isActive ? "bg-primary text-primary-foreground border-black shadow-hard-sm" : "text-muted-foreground"}`}
                    >
                        <item.icon className="h-5 w-5" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold border-2 border-black shadow-hard-sm z-50">
                    {item.name}
                </TooltipContent>
            </Tooltip>
        );
    }

    // Expanded State
    return (
        <div className="overflow-hidden">
            {hasChildren ? (
                <div className="mb-1">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-sm font-bold transition-all rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`h-4 w-4 ${isActive ? "text-black dark:text-white" : ""}`} />
                            <span className={isActive ? "text-black dark:text-white" : ""}>{item.name}</span>
                        </div>
                        <motion.div
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                    </button>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <div className="mt-1 ml-4 border-l-2 border-zinc-200 dark:border-zinc-800 pl-2 space-y-1">
                                    {item.items!.map((sub) => {
                                        const isSubActive = pathname === sub.href;
                                        return (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                className={`block px-3 py-1.5 text-sm font-medium rounded-md transition-all ${isSubActive
                                                    ? "bg-primary/20 text-black dark:text-white border-l-4 border-primary -ml-[11px]" // Visual indicator
                                                    : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                    }`}
                                            >
                                                {sub.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <Link
                    href={item.href!}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-bold transition-all rounded-md mb-1 border-2 border-transparent hover:border-black hover:bg-black hover:text-white ${isActive
                        ? "bg-primary text-primary-foreground border-black shadow-hard-sm"
                        : "text-muted-foreground"
                        }`}
                >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.name}
                </Link>
            )}
        </div>
    );
}

// --- Main Shell ---

export function DashboardShell({ children, user }: { children: React.ReactNode; user: SupabaseUser | null }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const userEmail = user?.email || "guest@hubz.com";
    const userInitials = userEmail.substring(0, 2).toUpperCase();
    const userName = userEmail.split("@")[0];

    return (
        <div className="flex min-h-screen bg-muted/40 font-sans">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 256 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative hidden flex-col border-r-2 border-black bg-background md:flex overflow-hidden"
            >
                {/* Header */}
                <div className={`flex h-16 items-center border-b-2 border-black ${isCollapsed ? 'justify-center' : 'px-6'}`}>
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="bg-primary p-1.5 rounded-none text-primary-foreground border-2 border-black shadow-hard-sm shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h1.5a.75.75 0 010 1.5H6a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v3a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V7.56l-5.47 5.47a.75.75 0 11-1.06-1.06l5.47-5.47h-2.94a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                            </svg>
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="tracking-tight text-lg font-bold whitespace-nowrap"
                            >
                                Hubz KOL
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                    <TooltipProvider>
                        <nav className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <SidebarItem
                                    key={item.name}
                                    item={item}
                                    isCollapsed={isCollapsed}
                                    pathname={pathname}
                                />
                            ))}
                        </nav>
                    </TooltipProvider>
                </div>

                {/* Footer User */}
                <div className="p-4 border-t-2 border-black mt-auto bg-background z-10">
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

                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -right-3 top-6 z-40 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:flex items-center justify-center p-0"
                    onClick={toggleSidebar}
                >
                    <PanelLeft className="h-3 w-3" />
                </Button>
            </motion.aside>

            {/* Mobile Sidebar & Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center gap-4 border-b-2 border-black bg-background px-6 md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[80vw] sm:w-[300px]">
                            {/* Simplified Mobile Nav Replicating Structure */}
                            <nav className="grid gap-2 text-lg font-medium mt-4">
                                {NAV_ITEMS.map((item) => (
                                    <div key={item.name} className="space-y-2">
                                        {item.items ? (
                                            <>
                                                <div className="font-bold text-muted-foreground px-2">{item.name}</div>
                                                {item.items.map(sub => (
                                                    <Link key={sub.name} href={sub.href} className="block pl-6 py-2 hover:bg-muted rounded-md text-base">
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </>
                                        ) : (
                                            <Link href={item.href!} className="flex items-center gap-4 py-2 hover:bg-muted rounded-md px-2">
                                                <item.icon className="h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="flex-1 font-bold">Hubz KOL</div>
                    <ModeToggle />
                </header>

                {/* DESKTOP HEADER (Only visible on MD+) */}
                <header className="hidden md:flex h-16 items-center gap-4 border-b-2 border-black bg-background px-6">
                    <div className="w-full flex-1">
                        {/* Empty spacer or Search */}
                    </div>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Breadcrumbs />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
