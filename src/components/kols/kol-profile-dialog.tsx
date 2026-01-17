import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLog } from "@/components/kols/activity-log";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { KOL } from "@/lib/static-data";
import { formatIDR } from "@/lib/analytics";

interface KOLProfileDialogProps {
    kol: KOL;
    children: React.ReactNode;
}

export function KOLProfileDialog({ kol, children }: KOLProfileDialogProps) {

    const formatFollowersLocal = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "k";
        return num.toString();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="cursor-pointer hover:underline decoration-2 underline-offset-2">
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-zinc-950 sm:rounded-xl overflow-hidden h-[600px] flex flex-col">
                <div className="p-4 border-b-2 border-black bg-white dark:bg-zinc-900 flex items-center justify-between">
                    <DialogTitle className="font-bold text-lg">KOL Profile</DialogTitle>
                </div>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                    <div className="px-6 pt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="activity">Activity Log</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="flex-1 p-6 flex flex-col items-center gap-6 overflow-y-auto">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 border-2 border-black shadow-none bg-zinc-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.id}`} />
                            <AvatarFallback className="text-4xl font-bold text-slate-400 bg-slate-100">
                                {kol.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">TikTok Followers</span>
                                <span className="font-bold text-lg">{formatFollowersLocal(kol.tiktokFollowers || 0)}</span>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Rate (TikTok)</span>
                                <span className="font-bold text-lg">{formatIDR(kol.rateCardTiktok || 0)}</span>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Instagram Followers</span>
                                <span className="font-bold text-lg">{formatFollowersLocal(kol.instagramFollowers || 0)}</span>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Rate (Reels)</span>
                                <span className="font-bold text-lg">{formatIDR(kol.rateCardReels || 0)}</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800" />

                        {/* Socials */}
                        <div className="w-full space-y-2">
                            <h4 className="text-sm font-semibold mb-2">Socials</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={kol.tiktokProfileLink || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black hover:bg-zinc-50 transition-colors ${!kol.tiktokUsername ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                                    <span className="text-xs font-medium truncate">@{kol.tiktokUsername || 'N/A'}</span>
                                </a>
                                <a
                                    href={kol.instagramProfileLink || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-black hover:bg-zinc-50 transition-colors ${!kol.instagramUsername ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                                    <span className="text-xs font-medium truncate">@{kol.instagramUsername || 'N/A'}</span>
                                </a>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="activity" className="flex-1 p-6 h-full overflow-hidden">
                        <ActivityLog kolId={kol.id} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
