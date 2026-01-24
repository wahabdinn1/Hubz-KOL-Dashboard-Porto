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
                        <Avatar key={kol.avatar} className="h-24 w-24 border-2 border-black shadow-none bg-zinc-100">
                            <AvatarImage src={kol.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.id}`} />
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
                            {/* WhatsApp Button */}
                            {kol.whatsappNumber && (
                                <a
                                    href={`https://wa.me/${kol.whatsappNumber.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-3 rounded-lg border-2 border-green-600 bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Chat via WhatsApp
                                </a>
                            )}
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
