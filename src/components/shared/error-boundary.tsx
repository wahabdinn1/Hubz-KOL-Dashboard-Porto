"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="mb-4 p-4 bg-destructive/10 rounded-full">
                        <AlertTriangle className="h-12 w-12 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={this.handleRetry}>
                            Try Again
                        </Button>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details className="mt-6 text-left max-w-lg">
                            <summary className="cursor-pointer text-sm text-muted-foreground">
                                Error Details
                            </summary>
                            <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export { ErrorBoundary };
