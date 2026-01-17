"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <div className="mb-4 rounded-full bg-red-100 p-4 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-2xl font-black uppercase text-black">
                Something went wrong!
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
                We encountered an unexpected error. Our team has been notified.
                <br />
                <span className="text-xs font-mono bg-gray-100 p-1 rounded mt-2 block overflow-hidden text-ellipsis">
                    {error.message}
                </span>
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                    Go Home
                </Button>
                <Button
                    onClick={() => reset()}
                    className="bg-[#FFDA5C] text-black hover:bg-[#FFDA5C]/90 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold"
                >
                    Try Again
                </Button>
            </div>
        </div>
    );
}
