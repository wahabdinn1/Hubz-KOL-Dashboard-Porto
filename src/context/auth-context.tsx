"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Define Roles
export type UserRole = "super_admin" | "admin" | "member";

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    signIn: () => void; // Placeholder if needed
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    isAdmin: false,
    isSuperAdmin: false,
    signIn: () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();

            if (data?.role) {
                setRole(data.role as UserRole);
            } else {
                // Default to member if no profile found or error
                setRole("member");
            }
        } catch (error) {
            console.error("Error fetching role:", error);
            setRole("member");
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (isMounted) {
                if (user) {
                    setUser(user);
                    await fetchRole(user.id);
                } else {
                    setUser(null);
                    setRole(null);
                }
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            if (!isMounted) return;

            if (session?.user) {
                setUser(session.user);
                await fetchRole(session.user.id);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        router.push("/login"); // Redirect handled by Protected Route logic usually, but helper here
    };

    const isAdmin = role === "admin" || role === "super_admin";
    const isSuperAdmin = role === "super_admin";

    return (
        <AuthContext.Provider value={{
            user,
            role,
            loading,
            isAdmin,
            isSuperAdmin,
            signIn: () => { },
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
