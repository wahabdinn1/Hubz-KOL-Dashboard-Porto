"use client";

import { useActionState } from "react";
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const initialState = {
    error: "",
};

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await signup(formData);
        if (result?.error) {
            return { error: result.error };
        }
        return { error: "" };
    }, initialState);

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding (Swapped for Register page for variety or keep consistent? Let's keep consistent: Form Left) */}
            {/* Actually, visually splitting form right / image left is also common, but let's stick to consistency with Login: Form Left */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background border-r-2 border-black">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left space-y-2">
                        <h1 className="text-4xl font-black font-head tracking-tight text-foreground">
                            Create Account
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Get started with Hubz today.
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
                                <Label htmlFor="password" className="font-bold text-base">Password</Label>
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
                            Create account
                        </Button>

                        <div className="text-center text-sm font-medium pt-4">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-black underline decoration-2 underline-offset-4 hover:text-primary transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-black text-white p-12 relative overflow-hidden">
                <div className="z-10">
                    <div className="inline-flex items-center gap-2 bg-black border-2 border-white px-4 py-2 shadow-[4px_4px_0px_0px_white] rounded-full">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="font-bold font-head">Join the Revolution.</span>
                    </div>
                </div>

                <div className="z-10 max-w-xl">
                    <h2 className="text-6xl font-black font-head tracking-tighter mb-6 leading-[0.9]">
                        START YOUR JOURNEY.
                    </h2>
                    <p className="text-xl font-medium text-gray-300 font-sans border-l-4 border-white pl-6 py-2">
                        Join thousands of brands and agencies optimizing their KOL campaigns with data-driven brutality.
                    </p>
                </div>

                {/* Decorative Elements - Inverted for Dark BG */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            </div>
        </div>
    );
}
