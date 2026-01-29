import { Button } from "@/components/retroui/Button";
import { FormInput } from "@/components/ui/form-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnyFieldApi } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface SocialMediaFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
}

export function SocialMediaForm({ form }: SocialMediaFormProps) {
    const [fetchingTikTok, setFetchingTikTok] = useState(false);
    const [fetchingInstagram, setFetchingInstagram] = useState(false);

    // Fetch TikTok data
    const fetchTikTokData = async () => {
        const username = form.getFieldValue("tiktokUsername");
        if (!username) return;
        
        setFetchingTikTok(true);
        try {
            const response = await fetch(`/api/tiktok/stalk?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                form.setFieldValue("tiktokFollowers", data.data.followers?.toString() || "");
                form.setFieldValue("name", form.getFieldValue("name") || data.data.nickname || "");
                form.setFieldValue("avatar", data.data.avatar || form.getFieldValue("avatar"));
            }
        } catch (error) {
            console.error('Failed to fetch TikTok data:', error);
        } finally {
            setFetchingTikTok(false);
        }
    };

    // Fetch Instagram data
    const fetchInstagramData = async () => {
        const username = form.getFieldValue("instagramUsername");
        if (!username) return;

        setFetchingInstagram(true);
        try {
            const cleanUser = username.replace('@', '');
            const response = await fetch(`/api/instagram/profile?username=${encodeURIComponent(cleanUser)}`);
            const data = await response.json();
            if (data.status === 'success' && data.data) {
                form.setFieldValue("instagramFollowers", data.data.followers?.toString() || "");
                form.setFieldValue("name", form.getFieldValue("name") || data.data.full_name || "");
                if (!form.getFieldValue("avatar") && data.data.profile_pic_url) {
                    form.setFieldValue("avatar", `/api/image-proxy?url=${encodeURIComponent(data.data.profile_pic_url)}`);
                }
            }
        } catch (error) {
            console.error('Failed to fetch Instagram data:', error);
        } finally {
            setFetchingInstagram(false);
        }
    };

    return (
        <>
            {/* --- TikTok --- */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                    TikTok
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <form.Field name="tiktokUsername">
                        {(field: AnyFieldApi) => (
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={field.state.value || ""} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.handleChange(val);
                                            // Auto link logic
                                            if (val) form.setFieldValue("tiktokProfileLink", `https://www.tiktok.com/@${val.replace(/^@/, '')}`);
                                        }} 
                                        placeholder="@username" 
                                        className="flex-1" 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={fetchTikTokData}
                                        disabled={!field.state.value || fetchingTikTok}
                                    >
                                        {fetchingTikTok ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="tiktokFollowers">
                        {(field: AnyFieldApi) => (
                            <FormInput
                                label="Followers"
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="0"
                            />
                        )}
                    </form.Field>

                    <form.Field name="tiktokProfileLink">
                        {(field: AnyFieldApi) => (
                            <div className="space-y-2 col-span-2">
                                <Label>Profile Link</Label>
                                <Input
                                    value={field.state.value || ""}
                                    readOnly
                                    className="bg-muted text-muted-foreground cursor-not-allowed"
                                    placeholder="Auto-generated from username"
                                />
                            </div>
                        )}
                    </form.Field>
                </div>
            </div>

            {/* --- Instagram --- */}
            <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.25-3.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" /></svg>
                    Instagram
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <form.Field name="instagramUsername">
                        {(field: AnyFieldApi) => (
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={field.state.value || ""} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            field.handleChange(val);
                                            // Auto link logic
                                            if (val) form.setFieldValue("instagramProfileLink", `https://www.instagram.com/${val.replace(/^@/, '')}/`);
                                        }} 
                                        placeholder="@username" 
                                        className="flex-1" 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={fetchInstagramData}
                                        disabled={!field.state.value || fetchingInstagram}
                                    >
                                        {fetchingInstagram ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="instagramFollowers">
                        {(field: AnyFieldApi) => (
                            <FormInput
                                label="Followers"
                                type="number"
                                value={field.state.value || ""}
                                onChange={(e) => field.handleChange(e.target.value)}
                                placeholder="0"
                            />
                        )}
                    </form.Field>

                    <form.Field name="instagramProfileLink">
                        {(field: AnyFieldApi) => (
                            <div className="space-y-2 col-span-2">
                                <Label>Profile Link</Label>
                                <Input
                                    value={field.state.value || ""}
                                    readOnly
                                    className="bg-muted text-muted-foreground cursor-not-allowed"
                                    placeholder="Auto-generated from username"
                                />
                            </div>
                        )}
                    </form.Field>
                </div>
            </div>
        </>
    );
}
