import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { OnboardingProvider } from "@/components/shared/onboarding-tour";

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
                <OnboardingProvider>
                    {children}
                </OnboardingProvider>
            </ErrorBoundary>
        </DashboardShell>
    );
}
