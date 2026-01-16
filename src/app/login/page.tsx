"use client";

import { useActionState } from "react";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const initialState = {
    error: "",
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: { error: string }, formData: FormData) => {
        const result = await login(formData);
        if (result?.error) {
            return { error: result.error };
        }
        return { error: "" };
    }, initialState);

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background border-r-2 border-black">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left space-y-2">
                        <h1 className="text-4xl font-black font-head tracking-tight text-foreground">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Enter your credentials to access the dashboard.
                        </p>
                    </div>

                    <form action={formAction} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold text-base">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="font-bold text-base">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium hover:underline text-muted-foreground"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="h-12"
                                />
                            </div>
                        </div>

                        {state?.error && (
                            <div className="p-4 border-2 border-black bg-destructive/10 text-destructive font-bold rounded-none shadow-hard-sm">
                                {state.error}
                            </div>
                        )}

                        <Button
                            className="w-full h-12 text-lg border-2 border-black shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Sign in
                        </Button>

                        <div className="text-center text-sm font-medium pt-4">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-black underline decoration-2 underline-offset-4 hover:text-primary transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-primary border-l-2 border-black p-12 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 bg-white border-2 border-black px-4 py-2 shadow-hard rounded-full">
                        <div className="w-3 h-3 bg-black rounded-full animate-pulse" />
                        <span className="font-bold font-head">Hubz KOL Platform</span>
                    </div>
                </div>

                <div className="z-10 max-w-xl">
                    <h2 className="text-6xl font-black font-head tracking-tighter mb-6 text-black leading-[0.9]">
                        MANAGE YOUR INFLUENCERS LIKE A BOSS.
                    </h2>
                    <p className="text-xl font-medium text-black/80 font-sans border-l-4 border-black pl-6 py-2">
                        Track campaigns, calculate engagement, and scale your reach with the ultimate brutalist dashboard.
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white border-4 border-black rounded-full opacity-20 pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black rounded-full mix-blend-overlay opacity-10 pointer-events-none" />
            </div>
        </div>
    );
}
