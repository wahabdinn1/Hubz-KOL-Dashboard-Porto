"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
    title: string;
    description: string;
    targetSelector?: string;
    position?: "top" | "bottom" | "left" | "right" | "center";
}

const DEFAULT_TOUR_STEPS: TourStep[] = [
    {
        title: "Welcome to Hubz KOL Dashboard! 🎉",
        description: "Let's take a quick tour to help you get started managing your influencer campaigns.",
        position: "center",
    },
    {
        title: "Dashboard Overview",
        description: "View your key metrics at a glance - revenue, views, and campaign performance.",
        targetSelector: '[data-tour="dashboard"]',
        position: "bottom",
    },
    {
        title: "Manage Campaigns",
        description: "Create, track, and manage all your influencer marketing campaigns in one place.",
        targetSelector: '[data-tour="campaigns"]',
        position: "right",
    },
    {
        title: "Influencer Directory",
        description: "Browse, filter, and manage your roster of Key Opinion Leaders.",
        targetSelector: '[data-tour="influencers"]',
        position: "right",
    },
    {
        title: "Financial Insights",
        description: "Track revenue, spending, and ROI across all your campaigns.",
        targetSelector: '[data-tour="finance"]',
        position: "right",
    },
    {
        title: "Quick Search",
        description: "Press Ctrl+K to quickly search campaigns, influencers, and more.",
        targetSelector: '[data-tour="search"]',
        position: "bottom",
    },
    {
        title: "You're All Set! 🚀",
        description: "Start by creating a campaign or adding influencers to your directory. Happy marketing!",
        position: "center",
    },
];

interface OnboardingContextType {
    isActive: boolean;
    currentStep: number;
    startTour: () => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within OnboardingProvider");
    }
    return context;
}

const ONBOARDING_KEY = "hubz-kol-onboarding-completed";

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    // Use lazy initialization to check localStorage once on mount
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
        if (typeof window === 'undefined') return true;
        return localStorage.getItem(ONBOARDING_KEY) === "true";
    });

    const startTour = useCallback(() => {
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    const endTour = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem(ONBOARDING_KEY, "true");
        setHasSeenOnboarding(true);
    }, []);

    const nextStep = useCallback(() => {
        if (currentStep < DEFAULT_TOUR_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            endTour();
        }
    }, [currentStep, endTour]);

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    }, [currentStep]);

    const skipTour = useCallback(() => {
        endTour();
    }, [endTour]);

    useEffect(() => {
        // Only show tour for users who haven't seen it
        if (hasSeenOnboarding) return;
        
        // Delay showing tour to let page load
        const timer = setTimeout(startTour, 1500);
        return () => clearTimeout(timer);
    }, [hasSeenOnboarding, startTour]);

    return (
        <OnboardingContext.Provider
            value={{
                isActive,
                currentStep,
                startTour,
                endTour,
                nextStep,
                prevStep,
                skipTour,
            }}
        >
            {children}
            {isActive && (
                <OnboardingOverlay
                    step={DEFAULT_TOUR_STEPS[currentStep]}
                    currentStep={currentStep}
                    totalSteps={DEFAULT_TOUR_STEPS.length}
                    onNext={nextStep}
                    onPrev={prevStep}
                    onSkip={skipTour}
                />
            )}
            {/* Show restart button if not active and has seen onboarding */}
            {!isActive && hasSeenOnboarding && (
                <Button
                    variant="outline"
                    size="sm"
                    className="fixed bottom-4 right-4 z-40 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all hidden md:flex"
                    onClick={startTour}
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tour
                </Button>
            )}
        </OnboardingContext.Provider>
    );
}

interface OnboardingOverlayProps {
    step: TourStep;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
}

function OnboardingOverlay({
    step,
    currentStep,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
}: OnboardingOverlayProps) {
    const isCenter = step.position === "center";
    const isLastStep = currentStep === totalSteps - 1;
    const isFirstStep = currentStep === 0;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Content */}
            <div
                className={cn(
                    "absolute bg-background border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md",
                    isCenter && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    !isCenter && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                )}
            >
                {/* Close button */}
                <button
                    onClick={onSkip}
                    className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Step indicator */}
                <div className="flex gap-1 mb-4">
                    {Array.from({ length: totalSteps }).map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-all",
                                idx === currentStep
                                    ? "bg-primary"
                                    : idx < currentStep
                                      ? "bg-primary/50"
                                      : "bg-muted"
                            )}
                        />
                    ))}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-6">
                    {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkip}
                        className="text-muted-foreground"
                    >
                        Skip tour
                    </Button>
                    <div className="flex gap-2">
                        {!isFirstStep && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onPrev}
                                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={onNext}
                            className="bg-primary text-primary-foreground border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all"
                        >
                            {isLastStep ? (
                                "Get Started"
                            ) : (
                                <>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
