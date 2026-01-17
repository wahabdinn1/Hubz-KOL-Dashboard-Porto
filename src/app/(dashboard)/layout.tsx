import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/utils/supabase/server";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <DashboardShell user={user}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </DashboardShell>
    );
}
