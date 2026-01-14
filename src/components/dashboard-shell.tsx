"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Calculator,
    Users,
    Settings,
    Menu,
    Briefcase,
    BarChart3,
    LogOut,
    PanelLeft,
    LayoutGrid,
    ChevronDown,
    Search,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Navigation Structure ---
type NavItem = {
    name: string;
    href?: string;
    icon: any;
    items?: NavItem[]; // Nested items
};

const NAV_ITEMS: NavItem[] = [
    { name: "Overview", href: "/", icon: BarChart3 },
    { name: "Campaigns", href: "/campaigns", icon: Briefcase },
    { name: "Influencers", href: "/influencers", icon: Users },
    {
        name: "Tools",
        icon: Calculator,
        items: [
            { name: "ER Calculator", href: "/er-calculator", icon: Zap },
        ]
    },
    { name: "Settings", href: "/settings", icon: Settings },
];

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
            <aside className={`sticky top-0 h-screen hidden flex-col border-r-2 border-black bg-background md:flex transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {/* Header (BrutAdmin Style) */}
                <div className={`flex h-16 items-center border-b-2 border-black ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
                    <Link href="/" className="flex items-center gap-3 font-semibold overflow-hidden">
                        <div className="bg-[#FFDA5C] text-black h-8 w-8 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span className="font-bold text-lg">*</span>
                        </div>
                        {!isCollapsed && <span className="tracking-tight text-xl font-bold whitespace-nowrap">Hubz KOL</span>}
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 space-y-2 p-4 overflow-y-auto no-scrollbar">
                    <TooltipProvider delayDuration={0}>
                        {NAV_ITEMS.map((item, idx) => (
                            <SidebarItem
                                key={idx}
                                item={item}
                                isCollapsed={isCollapsed}
                                pathname={pathname}
                            />
                        ))}
                    </TooltipProvider>
                </nav>

                {/* Footer User */}
                <div className="p-4 border-t-2 border-black mt-auto bg-background">
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
                    className="absolute -right-3 top-7 z-40 h-6 w-6 rounded-full border-2 border-black bg-background shadow-hard-sm hover:bg-slate-100 dark:hover:bg-slate-800 hidden md:flex items-center justify-center p-0"
                    onClick={toggleSidebar}
                >
                    <PanelLeft className="h-3 w-3" />
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
                                {/* Simplified Mobile Nav for now, can recursively impl later if needed */}
                                {NAV_ITEMS.map((item) => (
                                    <div key={item.name}>
                                        {item.items ? (
                                            <>
                                                <div className="font-bold text-muted-foreground mb-1 px-2 text-sm uppercase tracking-wider">{item.name}</div>
                                                {item.items.map(subItem => (
                                                    <Link key={subItem.name} href={subItem.href || '#'} className="flex items-center gap-4 py-2 hover:text-primary px-4">
                                                        <subItem.icon className="h-5 w-5" />
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </>
                                        ) : (
                                            <Link href={item.href || '#'} className="flex items-center gap-4 py-2 hover:text-primary px-2 font-bold">
                                                <item.icon className="h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        )}
                                    </div>
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

// --- Recursive Sidebar Item Component ---
function SidebarItem({ item, isCollapsed, pathname }: { item: NavItem, isCollapsed: boolean, pathname: string }) {
    const isActive = item.href === pathname;
    const hasChildren = item.items && item.items.length > 0;
    const [isOpen, setIsOpen] = useState(false);

    // Auto-open if child is active
    useEffect(() => {
        if (hasChildren && item.items?.some(sub => sub.href === pathname)) {
            setIsOpen(true);
        }
    }, [pathname, hasChildren, item.items]);

    // Handle collapsed state display
    if (isCollapsed) {
        const targetHref = item.href || (hasChildren ? item.items![0].href : "#");
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={targetHref || "#"}
                        className={cn(
                            "flex items-center justify-center py-2 rounded-md transition-colors duration-200",
                            isActive || (hasChildren && item.items?.some(sub => sub.href === pathname))
                                ? "bg-black text-white"
                                : "text-muted-foreground hover:bg-black hover:text-white"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold border-2 border-black shadow-hard-sm">
                    {item.name}
                </TooltipContent>
            </Tooltip>
        );
    }

    // Expanded State - Group (Parent)
    if (hasChildren) {
        return (
            <div className="mb-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex w-full items-center justify-between px-2 py-2 text-sm font-medium transition-colors duration-200 rounded-md group",
                        // isOpen ? "text-foreground" : "text-muted-foreground"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-black" />
                        <span>{item.name}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180 text-black")} />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 pl-4 border-l border-gray-200"
                        >
                            <div className="py-1 flex flex-col gap-1">
                                {item.items!.map((subItem) => {
                                    const isSubActive = pathname === subItem.href;
                                    return (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href || "#"}
                                            className={cn(
                                                "block px-2 py-1.5 text-sm transition-colors duration-200 rounded-md",
                                                isSubActive
                                                    ? "font-bold bg-black text-white"
                                                    : "text-gray-500 hover:bg-black hover:text-white"
                                            )}
                                        >
                                            {/* Removed vertical indicator for cleaner block style */}
                                            {subItem.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Flat Item (No Children)
    return (
        <Link
            href={item.href || "#"}
            className={cn(
                "flex items-center gap-3 px-2 py-2 text-sm font-medium transition-colors duration-200 rounded-md mb-1 group",
                isActive
                    ? "font-bold bg-black text-white"
                    : "text-gray-500 hover:bg-black hover:text-white"
            )}
        >
            <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
            <span>{item.name}</span>
        </Link>
    );
}
