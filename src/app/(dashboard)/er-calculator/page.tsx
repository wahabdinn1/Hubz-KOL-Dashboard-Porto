"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, RotateCcw } from "lucide-react";

function ERCalculatorPageContent() {
    const [followers, setFollowers] = useState("");
    const [likes, setLikes] = useState("");
    const [comments, setComments] = useState("");
    const [shares, setShares] = useState("");

    const calculateER = () => {
        const f = Number(followers);
        const l = Number(likes) || 0;
        const c = Number(comments) || 0;
        const s = Number(shares) || 0;

        if (f > 0) {
            return ((l + c + s) / f) * 100;
        }
        return 0;
    };

    const er = calculateER();

    const getERQuality = (val: number) => {
        if (val === 0) return { label: "N/A", color: "text-muted-foreground border-border" };
        if (val > 5) return { label: "Excellent", color: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20" };
        if (val > 3) return { label: "Good", color: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20" };
        if (val > 1) return { label: "Average", color: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20" };
        return { label: "Low", color: "text-red-500 dark:text-red-400 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20" };
    };

    const quality = getERQuality(er);

    const reset = () => {
        setFollowers("");
        setLikes("");
        setComments("");
        setShares("");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calculator className="h-8 w-8 text-blue-600" />
                    ER Calculator
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Calculate Engagement Rate manually for any post or profile.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Calculate Engagement Rate</CardTitle>
                    <CardDescription>
                        Formula: ((Likes + Comments + Shares) / Followers) × 100%
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="followers">Total Followers</Label>
                            <Input
                                id="followers"
                                type="number"
                                placeholder="e.g. 10000"
                                value={followers}
                                onChange={(e) => setFollowers(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="likes">Likes</Label>
                                <Input
                                    id="likes"
                                    type="number"
                                    placeholder="0"
                                    value={likes}
                                    onChange={(e) => setLikes(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="comments">Comments</Label>
                                <Input
                                    id="comments"
                                    type="number"
                                    placeholder="0"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shares">Shares / Saves</Label>
                                <Input
                                    id="shares"
                                    type="number"
                                    placeholder="0"
                                    value={shares}
                                    onChange={(e) => setShares(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Result Area */}
                        <div className="col-span-2 md:col-span-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-slate-200 dark:border-slate-700">
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Engagement Rate</span>
                            <div className={`text-5xl font-bold ${er > 0 ? "text-primary" : "text-muted-foreground/30"}`}>
                                {er.toFixed(2)}%
                            </div>
                            {er > 0 && (
                                <div className={`mt-2 font-medium px-3 py-1 rounded-full shadow-sm border ${quality.color} bg-background`}>
                                    {quality.label}
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                        <Button variant="outline" onClick={reset} className="text-muted-foreground hover:text-foreground">
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ERCalculatorPage() {
    return (
        <ERCalculatorPageContent />
    );
}
