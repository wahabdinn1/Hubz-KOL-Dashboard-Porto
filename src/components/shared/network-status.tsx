"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial check
        setTimeout(() => setIsOnline(navigator.onLine), 0);

        const handleOnline = () => {
            setIsOnline(true);
            toast.success("You're back online!", {
                icon: <Wifi className="h-4 w-4" />,
                duration: 3000,
            });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.error("You are offline. Changes may not be saved.", {
                icon: <WifiOff className="h-4 w-4" />,
                duration: Infinity, // Keep until back online
                id: "offline-toast" // Prevent duplicates
            });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Dismiss offline toast when back online (handled by handleOnline implicitly by newer toast, or we can dismiss explicitly)
    useEffect(() => {
        if (isOnline) {
            toast.dismiss("offline-toast");
        }
    }, [isOnline]);

    return null; // Headless component
}
