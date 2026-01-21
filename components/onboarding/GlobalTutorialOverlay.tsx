"use client";

import { useEffect, useState } from "react";
import { useTutorial } from "@/contexts/TutorialContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export function GlobalTutorialOverlay() {
  const { isActive, currentStep, steps, skipTutorial, nextStep, previousStep } = useTutorial();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Listen for custom events from components
    const handleTutorialEvent = (event: CustomEvent) => {
      const step = steps[currentStep];
      if (step?.waitForEvent === event.detail.eventName) {
        handleNext();
      }
    };

    window.addEventListener('tutorial-event' as any, handleTutorialEvent as any);
    return () => {
      window.removeEventListener('tutorial-event' as any, handleTutorialEvent as any);
    };
  }, [currentStep, steps]);

  // Start countdown when step has navigateTo (redirect)
  useEffect(() => {
    const step = steps[currentStep];
    if (step?.navigateTo && step.page === pathname) {
      // Current step will redirect to navigateTo, start 10 second countdown
      setCountdown(10);
      setIsNavigating(true);
    } else {
      setCountdown(null);
      setIsNavigating(false);
    }
  }, [currentStep, steps, pathname]);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      if (countdown === 1) {
        // Time's up, proceed automatically
        handleNext();
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleNext = () => {
    const step = steps[currentStep];
    setCountdown(null);
    setIsNavigating(false);
    
    // If current step has navigateTo, navigate there first, then nextStep will be called after navigation
    if (step?.navigateTo) {
      nextStep();
    } else {
      nextStep();
    }
  };

  if (!mounted || !isActive || steps.length === 0) return null;

  const step = steps[currentStep];
  
  // Only show if we're on the correct page for this step
  if (step?.page !== pathname) return null;

  const getTargetElement = () => {
    if (!step.targetSelector) return null;
    return document.querySelector(step.targetSelector);
  };

  const getHighlightStyle = () => {
    const element = getTargetElement();
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      position: "fixed" as const,
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
      border: "3px solid hsl(var(--primary))",
      borderRadius: "8px",
      pointerEvents: "none" as const,
      zIndex: 10001,
    };
  };

  const getCardPosition = () => {
    if (step.position === "center" || !step.targetSelector) {
      // Center of screen
      return {
        position: "fixed" as const,
        top: `${window.innerHeight / 2 - 150}px`,
        left: `${window.innerWidth / 2 - 200}px`,
        zIndex: 10002,
        maxWidth: "400px",
      };
    }

    const element = getTargetElement();
    if (!element) {
      return {
        position: "fixed" as const,
        top: `${window.innerHeight / 2 - 150}px`,
        left: `${window.innerWidth / 2 - 200}px`,
        zIndex: 10002,
        maxWidth: "400px",
      };
    }

    const rect = element.getBoundingClientRect();
    const base: any = {
      position: "fixed" as const,
      zIndex: 10002,
      maxWidth: "400px",
    };

    switch (step.position) {
      case "top":
        return { 
          ...base, 
          top: `${Math.max(20, rect.top - 300)}px`, 
          left: `${Math.max(20, rect.left)}px`,
        };
      case "bottom":
        return { 
          ...base, 
          top: `${rect.bottom + 20}px`, 
          left: `${Math.max(20, rect.left)}px`,
        };
      case "left":
        return { 
          ...base, 
          top: `${rect.top}px`,
          left: `${Math.max(20, rect.left - 420)}px`,
        };
      case "right":
        return { 
          ...base, 
          top: `${rect.top}px`,
          left: `${rect.right + 20}px`,
        };
      default:
        return { 
          ...base, 
          top: `${rect.bottom + 20}px`, 
          left: `${Math.max(20, rect.left)}px`,
        };
    }
  };

  const highlightStyle = getHighlightStyle();

  return (
    <>
      {/* Overlay backdrop with cutout for highlighted element */}
      <div
        className="fixed inset-0 z-[10000] pointer-events-none"
        style={{ animation: "tutorialFadeIn 0.3s ease-in-out" }}
      >
        {highlightStyle ? (
          // Create spotlight effect with box-shadow
          <div
            style={{
              position: "absolute",
              top: highlightStyle.top,
              left: highlightStyle.left,
              width: highlightStyle.width,
              height: highlightStyle.height,
              borderRadius: highlightStyle.borderRadius,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
              pointerEvents: "none",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        ) : (
          // No target, full overlay
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        )}
      </div>

      {/* Highlight border around target element */}
      {highlightStyle && (
        <div 
          style={{
            ...highlightStyle,
            boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.4)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }} 
        />
      )}

      {/* Tutorial card */}
      <Card style={{
        ...getCardPosition(),
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }} className="shadow-2xl max-w-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTutorial}
              className="h-8 w-8 p-0 shrink-0"
              title="Skip tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-base leading-relaxed">
            {step.description}
          </CardDescription>
          <div className="space-y-3">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              {!step.hideNextButton && (
                <Button size="sm" onClick={handleNext}>
                  {currentStep === steps.length - 1 ? "Finish" : isNavigating && countdown ? `Next (${countdown}s)` : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes tutorialFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
